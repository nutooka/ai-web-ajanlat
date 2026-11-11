"use client";

import Box from "@mui/material/Box";
import { useState } from "react";
import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";
import { Comparison } from "./Comparison";
import { MobilePackageSwitch } from "./MobilePackageSwitch";
import { PackageCard } from "./PackageCard";
import { tierContents, type ContentRow } from "./tierContents";

interface PricingCardsProps {
  quote: Quote;
  /**
   * "home": marketing preview – Standard is featured ("Legnépszerűbb"), buttons link to the planner.
   * "offer": the visitor's own offer – only "Neked ajánlott" + the selected ring; cards are selectable.
   */
  mode: "home" | "offer";
  selected?: PackageId;
  /** Changes the selection only (the mobile switch). Must not move the page. */
  onSelect?: (id: PackageId) => void;
  /** The card's explicit "Ezt választom" button – may move on to the form. Falls back to onSelect. */
  onChoose?: (id: PackageId) => void;
  /** Shared snapshot: the chosen package stays marked, but cannot be changed. */
  readOnly?: boolean;
  /** Where the "Tételes árak" link points on the offer page. */
  detailsHref?: string;
}

export function PricingCards({
  quote,
  mode,
  selected,
  onSelect,
  onChoose,
  readOnly = false,
  detailsHref = "#reszletek",
}: PricingCardsProps) {
  const contents = tierContents(quote);
  const requested = new Set(mode === "offer" ? quote.requested.ids : []);
  // The visitor's own requests, shown first in every card (ticked, or "nincs benne").
  const labelOf = new Map(
    PACKAGE_IDS.flatMap((pid) =>
      quote.packages[pid].items.map((item) => [item.id, item.label] as const),
    ),
  );
  const requestedRows: ContentRow[] = [...requested].map((rid) => ({
    id: rid,
    label: labelOf.get(rid) ?? rid,
  }));
  const selectable = mode === "offer" && Boolean(onSelect);
  // Mobile shows one card at a time; on the home page (and in a read-only snapshot) the visitor browses locally.
  const [browsing, setBrowsing] = useState<PackageId>(
    readOnly && selected ? selected : "standard",
  );
  const mobileActive: PackageId =
    selectable && selected && !readOnly ? selected : browsing;

  const pick = (id: PackageId) => {
    if (selectable && !readOnly) onSelect?.(id);
    else setBrowsing(id);
  };
  const choose = (id: PackageId) => (onChoose ?? onSelect)?.(id);

  return (
    <Box>
      <MobilePackageSwitch quote={quote} active={mobileActive} onPick={pick} tone={mode} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: { xs: 3, md: 2.5 },
          alignItems: "stretch",
        }}
      >
        {PACKAGE_IDS.map((id, index) => (
          <Box key={id} sx={{ display: { xs: id === mobileActive ? "block" : "none", md: "block" } }}>
            <PackageCard
              quote={quote}
              id={id}
              index={index}
              mode={mode}
              contents={contents}
              requested={requested}
              requestedRows={requestedRows}
              selectable={selectable}
              isSelected={selectable && selected === id}
              readOnly={readOnly}
              onChoose={choose}
            />
          </Box>
        ))}
      </Box>
      <Comparison
        quote={quote}
        contents={contents}
        requestedRows={requestedRows}
        requested={requested}
        mode={mode}
        detailsHref={detailsHref}
      />
    </Box>
  );
}
