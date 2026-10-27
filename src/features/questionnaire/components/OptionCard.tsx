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
        borderColor: selected ? palette.primary : palette.line,
        background: selected ? palette.primaryTint : palette.surface,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        textAlign: "left",
        gap: 1.75,
        transition: "border-color .18s ease, background .18s ease, transform .18s ease, box-shadow .18s ease",
        boxShadow: selected ? `0 0 0 3px ${palette.primaryTint}` : "none",
        "&:hover": {
          borderColor: selected ? palette.primary : palette.ink,
          transform: "translateY(-1px)",
          boxShadow: selected ? `0 0 0 3px ${palette.primaryTint}` : "0 10px 24px -16px rgba(20,22,26,.35)",
        },
        "&:active": { transform: "scale(0.99)" },
        "&.Mui-focusVisible": { outline: `3px solid ${palette.primary}`, outlineOffset: 2 },
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
            background: selected ? palette.primary : palette.paper,
            color: selected ? "#fff" : palette.ink,
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
          <Box component="span" sx={{ display: "inline-block", mt: 1, px: 1, py: 0.25, borderRadius: 999, background: palette.accent, fontSize: 12, fontWeight: 700 }}>
            Ajánlott
          </Box>
        )}
      </Box>

      <Box sx={{ position: "absolute", top: 14, right: 14 }}>
        {selected ? (
          <Box sx={{ width: 22, height: 22, borderRadius: multiple ? "7px" : "50%", background: palette.primary, color: "#fff", display: "grid", placeItems: "center" }}>
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
