import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";

export type ContentRow = { id: string; label: string };
export type TierContents = Record<PackageId, { base: ContentRow[]; additions: ContentRow[] }>;

/**
 * "Everything in the previous package, plus …": each card lists only what it adds.
 * - base: what the card inherits (Basic: the shared base; Standard: all of Basic; Premium: all of Standard)
 * - additions: what is new in this package (a better design level comes first)
 */
export function tierContents(quote: Quote): TierContents {
  const contents = {} as TierContents;
  type Pkg = Quote["packages"][PackageId];
  const toRows = (pkg: Pkg) =>
    pkg.items.map(({ id: rowId, label }) => ({ id: rowId, label }));
  // The design level as its own row – unless a design surcharge item already says it (webshop).
  const designRow = (pkg: Pkg): ContentRow[] =>
    pkg.items.some((item) => item.id === `design.${pkg.design.level}`)
      ? []
      : [{ id: `package-design.${pkg.design.level}`, label: pkg.design.label }];

  let previous: Pkg | null = null;
  for (const id of PACKAGE_IDS) {
    const pkg = quote.packages[id];
    if (!previous) {
      contents[id] = { base: toRows(pkg), additions: designRow(pkg) };
    } else {
      const had = new Set(previous.items.map((item) => item.id));
      const added = toRows(pkg).filter((row) => !had.has(row.id));
      const designChanged = pkg.design.label !== previous.design.label;
      contents[id] = {
        base: [...toRows(previous), ...designRow(previous)],
        additions: designChanged ? [...designRow(pkg), ...added] : added,
      };
    }
    previous = pkg;
  }
  return contents;
}
