"use client";

import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { PackageId } from "@/features/pricing/types";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";
import type { Offer } from "../buildOffer";
import { PriceBreakdown } from "./PriceBreakdown";

const TABS = [
  { id: "kalkulacio", label: "Kalkuláció" },
  { id: "tartalom", label: "Mit tartalmaz" },
  { id: "tech", label: "Technológia és fenntartás" },
  { id: "valaszok", label: "Válaszaid" },
] as const;

function List({ items, included }: { items: string[]; included: boolean }) {
  const Icon = included ? Check : Close;
  return (
    <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {items.map((item) => (
        <Stack component="li" key={item} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
          <Icon aria-hidden sx={{ fontSize: 18, mt: "3px", color: included ? palette.success : "text.secondary" }} />
          <Typography variant="body2">{item}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
        {value}
      </Typography>
    </Stack>
  );
}

/** Everything that supports the decision, collapsed into one tabbed block below the form. */
export function OfferDetails({ offer, packageId }: { offer: Offer; packageId: PackageId }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("kalkulacio");
  const pkg = offer.quote.packages[packageId];

  return (
    <Box sx={{ borderRadius: 4, border: 1, borderColor: "divider", background: palette.surface, overflow: "hidden" }}>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Az ajánlat részletei"
        textColor="inherit"
        sx={{
          px: { xs: 1, md: 3 },
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": { minHeight: 56, textTransform: "none", fontWeight: 650, fontSize: 15 },
          "& .MuiTabs-indicator": { height: 3, backgroundColor: palette.ink },
        }}
      >
        {TABS.map((item) => (
          <Tab key={item.id} value={item.id} label={item.label} id={`tab-${item.id}`} aria-controls={`panel-${item.id}`} />
        ))}
      </Tabs>

      <Box sx={{ p: { xs: 3, md: 4 } }}>
        {(
          <Box role="tabpanel" id="panel-kalkulacio" aria-labelledby="tab-kalkulacio" className="print-panel" sx={{ display: tab === "kalkulacio" ? "block" : "none", "@media print": { display: "block" } }}>
            <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
              Tételes kalkuláció – {pkg.name}
            </Typography>
            <PriceBreakdown pkg={pkg} />
            {offer.selectedFeatures.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" component="h4" sx={{ mb: 1.5 }}>
                  A választott funkciók
                </Typography>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {offer.selectedFeatures.map((feature) => {
                    const included = pkg.items.some((item) => item.label === feature);
                    return (
                      <Chip
                        key={feature}
                        label={included ? feature : `${feature} – nem része a csomagnak`}
                        icon={included ? <Check /> : <Close />}
                        variant={included ? "filled" : "outlined"}
                        sx={included ? { background: palette.limeTint, color: palette.ink } : { color: "text.secondary" }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {(
          <Box role="tabpanel" id="panel-tartalom" aria-labelledby="tab-tartalom" className="print-panel" sx={{ display: tab === "tartalom" ? "grid" : "none", "@media print": { display: "grid" }, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                Mit tartalmaz?
              </Typography>
              <List items={offer.includes[packageId]} included />
            </Box>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                Mit nem tartalmaz?
              </Typography>
              <List items={offer.excludes[packageId]} included={false} />
            </Box>
          </Box>
        )}

        {(
          <Box role="tabpanel" id="panel-tech" aria-labelledby="tab-tech" className="print-panel" sx={{ display: tab === "tech" ? "grid" : "none", "@media print": { display: "grid" }, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 1 }}>
                {offer.tech.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {offer.tech.description}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {offer.tech.stack.map((tech) => (
                  <Chip key={tech} label={tech} size="small" variant="outlined" />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 1 }}>
                Fenntartás
              </Typography>
              <Row label={pkg.maintenance.hostingLabel} value={`${formatRon(pkg.maintenance.hostingMonthly)}/hó`} />
              <Row label={`${pkg.maintenance.supportLabel} – nem kötelező`} value={`${formatRon(pkg.maintenance.supportMonthly)}/hó`} />
              <Row label="Domain" value={`${formatRon(pkg.maintenance.domainYearly)}/év`} />
              <Typography sx={{ fontWeight: 700, mt: 1.5 }}>
                {formatRon(pkg.maintenance.hostingMonthly)}/hó kötelező + {formatRon(pkg.maintenance.supportMonthly)}/hó, ha kéred a karbantartást
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Karbantartással együtt évente kb. {formatRon(pkg.maintenance.yearlyTotal)} (domainnel)
              </Typography>
            </Box>
          </Box>
        )}

        {(
          <Box role="tabpanel" id="panel-valaszok" aria-labelledby="tab-valaszok" className="print-panel" sx={{ display: tab === "valaszok" ? "block" : "none", "@media print": { display: "block" } }}>
            <Typography variant="h5" component="h3" sx={{ mb: 0.5 }}>
              A válaszaid
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ezeket is megkapjuk, amikor egyeztetést kérsz – nem kell külön elküldened.
            </Typography>
            <Box component="dl" sx={{ m: 0 }}>
              {offer.answerRows.map((row) => (
                <Box key={row.questionId} className="print-row" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: { xs: 0.25, sm: 3 }, py: 1.25, borderBottom: 1, borderColor: "divider" }}>
                  <Typography component="dt" variant="body2" color="text.secondary">
                    {row.question}
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600, whiteSpace: "pre-wrap" }}>
                    {row.answer}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
