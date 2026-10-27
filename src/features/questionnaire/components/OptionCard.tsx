"use client";

import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { OPTION_ICONS } from "@/components/icons";
import { palette } from "@/theme/tokens";
import type { QuestionOption } from "../types";

interface OptionCardProps {
  option: QuestionOption;
  selected: boolean;
  multiple: boolean;
  shortcut?: number;
  recommended?: boolean;
  onSelect: () => void;
}

export function OptionCard({ option, selected, multiple, shortcut, recommended, onSelect }: OptionCardProps) {
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
          boxShadow: selected ? `inset 0 0 0 1px ${palette.ink}` : "0 12px 28px -18px rgba(14,15,18,.4)",
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
        {recommended && (
          <Box component="span" sx={{ display: "inline-block", mt: 1, px: 1, py: 0.25, borderRadius: 999, background: palette.lime, color: palette.ink, fontSize: 12, fontWeight: 700 }}>
            Ajánlott
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
