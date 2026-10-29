"use client";

import Check from "@mui/icons-material/Check";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { OPTION_ICONS } from "@/components/icons";
import { OPTION_IMPACT_LABELS, type OptionImpact } from "@/features/pricing/optionImpact";
import { palette, shadow } from "@/theme/tokens";
import type { QuestionOption } from "../types";

interface OptionCardProps {
  option: QuestionOption;
  selected: boolean;
  multiple: boolean;
  shortcut?: number;
  recommended?: boolean;
  /** What this choice does to the price (badges). */
  impacts?: OptionImpact[];
  onSelect: () => void;
}

const IMPACT_ICONS: Record<OptionImpact, typeof TrendingUp> = {
  price: TrendingUp,
  majorPrice: TrendingUp,
  review: ForumOutlined,
  extraCost: ReceiptLongOutlined,
};

/** Small tags under the option: what makes the project more complex, and so more expensive. */
function ImpactBadges({ impacts }: { impacts: OptionImpact[] }) {
  return (
    <Box component="span" sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
      {impacts.map((impact) => {
        const Icon = IMPACT_ICONS[impact];
        const strong = impact === "majorPrice";
        return (
          <Box
            key={impact}
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.875,
              py: 0.25,
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.4,
              border: "1px solid",
              borderStyle: impact === "review" ? "dashed" : "solid",
              borderColor: strong ? palette.ink : palette.line,
              background: strong ? palette.ink : palette.paper,
              color: strong ? palette.surface : palette.ink,
            }}
          >
            <Icon sx={{ fontSize: 14 }} />
            {OPTION_IMPACT_LABELS[impact]}
          </Box>
        );
      })}
    </Box>
  );
}

export function OptionCard({ option, selected, multiple, shortcut, recommended, impacts = [], onSelect }: OptionCardProps) {
  const Icon = option.icon ? OPTION_ICONS[option.icon] : null;

  return (
    <ButtonBase
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: 72,
        p: 2.25,
        pr: 5,
        borderRadius: 3,
        border: "1.5px solid",
        borderColor: selected ? palette.ink : palette.line,
        background: selected ? palette.limeTint : palette.surface,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        textAlign: "left",
        gap: 1.75,
        transition: "border-color .18s ease, background .18s ease, transform .18s ease, box-shadow .18s ease",
        boxShadow: selected ? `inset 0 0 0 1px ${palette.ink}` : "none",
        "&:hover": {
          borderColor: palette.ink,
          transform: "translateY(-1px)",
          boxShadow: selected ? `inset 0 0 0 1px ${palette.ink}` : shadow.raised,
        },
        "&:active": { transform: "scale(0.99)" },
        "&.Mui-focusVisible": { outline: `2px solid ${palette.ink}`, outlineOffset: 3 },
      }}
    >
      {Icon && (
        <Box
          sx={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            background: selected ? palette.lime : palette.paper,
            color: palette.ink,
            transition: "all .18s ease",
          }}
        >
          <Icon fontSize="small" />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography component="span" sx={{ display: "block", fontWeight: 600, fontSize: "1rem", lineHeight: 1.35 }}>
          {option.label}
        </Typography>
        {option.description && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            {option.description}
          </Typography>
        )}
        {impacts.length > 0 && <ImpactBadges impacts={impacts} />}
        {recommended && (
          <Box component="span" sx={{ display: "inline-block", mt: 1, px: 1, py: 0.25, borderRadius: 999, background: palette.lime, color: palette.ink, fontSize: 12, fontWeight: 700 }}>
            Neked ajánljuk
          </Box>
        )}
      </Box>

      <Box sx={{ position: "absolute", top: 14, right: 14 }}>
        {selected ? (
          <Box sx={{ width: 22, height: 22, borderRadius: multiple ? "7px" : "50%", background: palette.ink, color: palette.lime, display: "grid", placeItems: "center" }}>
            <Check sx={{ fontSize: 15 }} />
          </Box>
        ) : (
          shortcut !== undefined && (
            <Box
              component="kbd"
              aria-hidden
              sx={{ display: { xs: "none", md: "grid" }, placeItems: "center", width: 22, height: 22, borderRadius: "6px", border: 1, borderColor: "divider", fontSize: 11, fontFamily: "inherit", color: "text.secondary" }}
            >
              {shortcut}
            </Box>
          )
        )}
      </Box>
    </ButtonBase>
  );
}
