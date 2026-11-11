"use client";

import Check from "@mui/icons-material/Check";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PackageId } from "@/features/pricing/types";
import { gradients, packageThemes, palette } from "@/theme/tokens";

/** Included = green tick. Not included = quiet dash plus where it is available – no red crosses. */
export type PackageTheme = (typeof packageThemes)[PackageId];

export function Row({
  theme,
  label,
  requested = false,
  strong = false,
}: {
  theme?: PackageTheme;
  included?: true;
  label: string;
  requested?: boolean;
  strong?: boolean;
}) {
  return (
    <Stack
      component="li"
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        py: 1,
        borderBottom: `1px solid ${palette.inkLine}`,
      }}
    >
      <Tick theme={theme} />
      <Typography
        sx={{ fontSize: 14, fontWeight: strong ? 650 : 400, color: "#fff" }}
      >
        {label}
        {requested && <RequestedTag theme={theme} />}
      </Typography>
    </Stack>
  );
}

/** Quiet white ring, the tick in the card's own package colour. */
function Tick({ theme }: { theme?: PackageTheme }) {
  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: 24,
        height: 24,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        border: "1.5px solid rgba(255,255,255,.35)",
        color: theme?.solid ?? "#fff",
      }}
    >
      <Check sx={{ fontSize: 15 }} />
    </Box>
  );
}

export function RequestedTag({ theme }: { theme?: PackageTheme }) {
  return (
    <Box
      component="span"
      sx={{
        ml: 0.75,
        px: 0.75,
        py: 0.1,
        borderRadius: 1,
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: "nowrap",
        color: palette.ink,
        background: theme?.gradient ?? gradients.brand,
      }}
    >
      Kérted
    </Box>
  );
}

/** One line per card: does this package cover what the visitor asked for? */
export function RequestStatus({
  theme,
  missing,
  recommended,
}: {
  theme: PackageTheme;
  missing: string[];
  recommended: boolean;
}) {
  const ok = missing.length === 0;
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "flex-start",
        mb: 2,
        px: 1.5,
        py: 1.1,
        borderRadius: 2,
        background: "rgba(255,255,255,.06)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          mt: "1px",
          color: ok ? theme.solid : palette.inkMuted,
          display: "grid",
        }}
      >
        {ok ? (
          <Check sx={{ fontSize: 18 }} />
        ) : (
          <InfoOutlined sx={{ fontSize: 18 }} />
        )}
      </Box>
      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: 600,
          color: ok ? "#fff" : palette.inkMuted,
          lineHeight: 1.45,
        }}
      >
        {ok
          ? recommended
            ? "Minden kérésed benne van – ezt ajánljuk."
            : "Minden kérésed benne van."
          : `Hiányzik ${missing.length} kérésed: ${missing.join(", ")}.`}
      </Typography>
    </Stack>
  );
}

export const visuallyHidden = {
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
} as const;
