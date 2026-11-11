"use client";

import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";
import { packageThemes, palette, shadow } from "@/theme/tokens";
import { RequestedTag, visuallyHidden } from "./PricingRows";
import type { ContentRow, TierContents } from "./tierContents";

export const COMPARISON_ID = "osszehasonlitas";

/** Every item of every package in one table: the visitor's requests first, then the differences, then the shared base. */
export function Comparison({
  quote,
  contents,
  requestedRows,
  requested,
  mode,
  detailsHref,
}: {
  quote: Quote;
  contents: TierContents;
  requestedRows: ContentRow[];
  requested: Set<string>;
  mode: "home" | "offer";
  detailsHref: string;
}) {
  const has = (pid: PackageId, rowId: string) =>
    quote.packages[pid].items.some((item) => item.id === rowId);
  const base = contents.basic.base.filter((row) => !requested.has(row.id));
  const seen = new Set([...base.map((row) => row.id), ...requested]);
  const differences: ContentRow[] = [];
  for (const pid of PACKAGE_IDS)
    for (const row of contents[pid].additions)
      if (!seen.has(row.id) && !row.id.startsWith("package-design.")) {
        seen.add(row.id);
        differences.push(row);
      }

  const cols = {
    xs: "minmax(0,1fr) 62px 62px 62px",
    md: "minmax(0,1fr) 140px 140px 140px",
  };
  const cell = (pid: PackageId, rowId: string) => (
    <Box key={pid} role="cell" sx={{ display: "grid", placeItems: "center" }}>
      {has(pid, rowId) ? (
        <Box
          component="span"
          sx={{ display: "grid", color: packageThemes[pid].solid }}
        >
          <Check sx={{ fontSize: 20 }} />
          <Box component="span" sx={visuallyHidden}>
            {quote.packages[pid].name}: benne van
          </Box>
        </Box>
      ) : (
        <Box component="span" sx={{ color: palette.inkLine, fontSize: 18 }}>
          –
          <Box component="span" sx={visuallyHidden}>
            {quote.packages[pid].name}: nincs benne
          </Box>
        </Box>
      )}
    </Box>
  );
  const line = (row: ContentRow, tag = false) => (
    <Box
      key={row.id}
      role="row"
      sx={{
        display: "grid",
        gridTemplateColumns: cols,
        alignItems: "center",
        py: 1.1,
        borderBottom: `1px solid ${palette.inkLine}`,
      }}
    >
      <Typography role="rowheader" sx={{ fontSize: 14, color: "#fff", pr: 1 }}>
        {row.label}
        {tag && requested.has(row.id) && <RequestedTag />}
      </Typography>
      {PACKAGE_IDS.map((pid) => cell(pid, row.id))}
    </Box>
  );
  const heading = (text: string) => (
    <Box
      role="row"
      sx={{
        pt: 2.5,
        pb: 0.75,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: palette.inkMuted,
      }}
    >
      <Box component="span" role="rowheader" aria-colspan={4}>
        {text}
      </Box>
    </Box>
  );

  return (
    <Box
      id={COMPARISON_ID}
      sx={{
        mt: { xs: 3, md: 4 },
        scrollMarginTop: 24,
        borderRadius: 4,
        background: palette.inkSoft,
        color: "#fff",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3 },
        boxShadow: shadow.raisedOnDark,
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: { xs: 20, md: 24 },
          mb: 1,
        }}
      >
        Részletes összehasonlítás
      </Typography>
      <Box role="table" aria-label="A három csomag összehasonlítása">
        {/* Sticky header with the package names in their colours. */}
        <Box
          role="row"
          sx={{
            display: "grid",
            gridTemplateColumns: cols,
            alignItems: "end",
            pb: 1,
            borderBottom: `1px solid ${palette.inkLine}`,
            position: "sticky",
            top: 0,
            background: palette.inkSoft,
            zIndex: 1,
          }}
        >
          <Box role="columnheader" />
          {PACKAGE_IDS.map((pid) => (
            <Box key={pid} role="columnheader" sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  mx: "auto",
                  mb: 0.75,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: packageThemes[pid].gradient,
                }}
              />
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: { xs: 0, md: "0.04em" },
                  textTransform: { xs: "none", md: "uppercase" },
                }}
              >
                {quote.packages[pid].name}
              </Typography>
            </Box>
          ))}
        </Box>

        {heading("Design")}
        <Box
          role="row"
          sx={{
            display: "grid",
            gridTemplateColumns: cols,
            alignItems: "start",
            py: 1.1,
            borderBottom: `1px solid ${palette.inkLine}`,
          }}
        >
          <Typography role="rowheader" sx={{ fontSize: 14, color: "#fff" }}>
            Kinézet
          </Typography>
          {PACKAGE_IDS.map((pid) => (
            <Typography
              key={pid}
              role="cell"
              sx={{
                fontSize: 13,
                lineHeight: 1.35,
                color: palette.inkMuted,
                textAlign: "center",
                px: 0.5,
                overflowWrap: "anywhere",
                hyphens: "auto",
              }}
            >
              {quote.packages[pid].design.label}
            </Typography>
          ))}
        </Box>

        {mode === "offer" && requestedRows.length > 0 && (
          <>
            {heading("Amit kértél")}
            {requestedRows.map((row) => line(row))}
          </>
        )}

        {differences.length > 0 && (
          <>
            {heading("Csomagonként eltér")}
            {differences.map((row) => line(row, true))}
          </>
        )}
      </Box>
      {mode === "offer" && (
        <Box
          component="a"
          href={detailsHref}
          sx={{
            mt: 1.5,
            color: "#fff",
            fontSize: 14,
            textUnderlineOffset: 3,
            display: "inline-flex",
            minHeight: 44,
            alignItems: "center",
          }}
        >
          Tételes árak: Részletek / Kalkuláció
        </Box>
      )}
    </Box>
  );
}
