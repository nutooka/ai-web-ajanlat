// "always": Hungarian locale would otherwise print 9550 but 10 950.
const ronFormatter = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0, useGrouping: "always" });

/** 12 400 → "12 400 RON" (non-breaking spaces so it never wraps). */
export function formatRon(value: number): string {
  return `${ronFormatter.format(value)} RON`;
}

export function formatHours(value: number): string {
  return `${new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 1 }).format(value)} óra`;
}

export function formatWeeks(min: number, max: number): string {
  return min === max ? `${min} hét` : `${min}–${max} hét`;
}
