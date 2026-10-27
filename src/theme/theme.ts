"use client";

import { alpha, createTheme } from "@mui/material/styles";
import { palette } from "./tokens";

export { palette, tint, tints } from "./tokens";

const display = "var(--font-display), 'Bricolage Grotesque', system-ui, sans-serif";
const body = "var(--font-body), Inter, system-ui, sans-serif";

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: palette.primary, dark: palette.primaryDark, light: palette.primaryTint, contrastText: "#FFFFFF" },
    secondary: { main: palette.ink, contrastText: "#FFFFFF" },
    success: { main: palette.success },
    background: { default: palette.paper, paper: palette.surface },
    text: { primary: palette.ink, secondary: palette.muted },
    divider: palette.line,
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: body,
    h1: { fontFamily: display, fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.02, letterSpacing: "-0.035em" },
    h2: { fontFamily: display, fontWeight: 700, fontSize: "clamp(1.85rem, 4.4vw, 2.75rem)", lineHeight: 1.1, letterSpacing: "-0.03em" },
    h3: { fontFamily: display, fontWeight: 650, fontSize: "clamp(1.5rem, 3.2vw, 2rem)", lineHeight: 1.15, letterSpacing: "-0.02em" },
    h4: { fontFamily: display, fontWeight: 650, fontSize: "1.375rem", lineHeight: 1.25, letterSpacing: "-0.01em" },
    h5: { fontFamily: display, fontWeight: 650, fontSize: "1.125rem", lineHeight: 1.3 },
    h6: { fontWeight: 650, fontSize: "1rem", lineHeight: 1.4 },
    subtitle1: { fontSize: "1.125rem", lineHeight: 1.55, color: palette.muted },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.9375rem", lineHeight: 1.55 },
    overline: { fontWeight: 650, letterSpacing: "0.12em", fontSize: "0.75rem" },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" },
        "::selection": { background: palette.accent, color: palette.ink },
        "@media print": {
          body: { background: "#FFFFFF" },
          ".no-print": { display: "none !important" },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 22, minHeight: 44 },
        sizeLarge: { paddingInline: 28, minHeight: 52, fontSize: "1rem" },
        outlined: { borderColor: palette.line, "&:hover": { borderColor: palette.ink, background: "transparent" } },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { outlined: { borderColor: palette.line } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } } },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: palette.surface,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: palette.line },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: alpha(palette.ink, 0.4) },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 999, background: palette.line },
        bar: { borderRadius: 999 },
      },
    },
    MuiLink: { defaultProps: { underline: "hover" } },
  },
});
