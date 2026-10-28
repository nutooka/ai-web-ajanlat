"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "motion/react";
import type { PackageQuote } from "@/features/pricing/types";
import { formatRon } from "@/lib/format";
import { vatNote } from "@/lib/priceNotes";
import { palette } from "@/theme/tokens";

function Row({ label, detail, value, strong, accent }: { label: string; detail?: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2, py: 1.25, borderBottom: 1, borderColor: "divider" }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: strong ? 700 : 500 }}>{label}</Typography>
        {detail && (
          <Typography variant="body2" color="text.secondary">
            {detail}
          </Typography>
        )}
      </Box>
      <Typography sx={{ fontWeight: strong ? 700 : 500, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: accent ? palette.success : undefined }}>
        {value}
      </Typography>
    </Box>
  );
}

export function PriceBreakdown({ pkg }: { pkg: PackageQuote }) {
  // Core features first, then the complexity surcharges (fixed RON), so it is clear what costs extra and why.
  const groups = [
    { id: "base", title: "Alapfunkciók", items: pkg.items.filter((item) => item.group === "base") },
    { id: "surcharge", title: "Komplexitási felárak", items: pkg.items.filter((item) => item.group === "surcharge") },
  ].filter((group) => group.items.length > 0);
  const hasSurcharges = groups.length > 1;
  return (
    <Box>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={pkg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {groups.map((group) => (
            <Box key={group.id} sx={{ "& + &": { mt: 3 } }}>
              {hasSurcharges && (
                <Typography variant="overline" component="h4" sx={{ display: "block", color: "text.secondary", fontWeight: 700, letterSpacing: "0.08em" }}>
                  {group.title}
                </Typography>
              )}
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                {group.items.map((item) => (
                  <Box component="li" key={item.id} className="print-row">
                    <Row
                      label={item.review ? `${item.label} *` : item.label}
                      detail={[item.source === "premium" ? `${pkg.name} csomag extra` : null, item.description].filter(Boolean).join(" · ") || undefined}
                      value={item.review ? `${formatRon(item.price)}-tól` : formatRon(item.price)}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
          {pkg.items.some((item) => item.review) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              * Technikai egyeztetés után véglegesítjük – az ár kiinduló becslés.
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Row label="Részösszeg" value={formatRon(pkg.subtotal)} />
            {pkg.urgencyAdjustment !== 0 && (
              <Row
                label={pkg.schedule.label}
                detail={pkg.urgencyAdjustment > 0 ? `+${Math.round((pkg.schedule.multiplier - 1) * 100)}% felár` : `−${Math.round((1 - pkg.schedule.multiplier) * 100)}% kedvezmény a rugalmas határidőért`}
                value={`${pkg.urgencyAdjustment > 0 ? "+" : "−"}${formatRon(Math.abs(pkg.urgencyAdjustment))}`}
                accent={pkg.urgencyAdjustment < 0}
              />
            )}
            <Row label="Listaár" value={formatRon(pkg.listPrice)} />
            {pkg.discounts.map((discount) => (
              <Row key={discount.id} label={discount.label} detail={`−${discount.percent}%`} value={`−${formatRon(discount.amount)}`} accent />
            ))}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", pt: 2.5, gap: 2 }}>
              <Typography variant="h5" component="p">
                Becsült projektár
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, whiteSpace: "nowrap" }}>
                {formatRon(pkg.finalPrice)}
                {pkg.items.some((item) => item.review) ? "-tól" : ""}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
              {vatNote()}
            </Typography>
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
