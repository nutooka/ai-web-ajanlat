"use client";

import { alpha, createTheme } from "@mui/material/styles";
import { palette } from "./tokens";

const display = "var(--font-display), 'Bricolage Grotesque', system-ui, sans-serif";
const body = "var(--font-body), 'Instrument Sans', system-ui, sans-serif";

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    // Lime fills with ink text; ink is the "secondary" solid.
    primary: { main: palette.lime, dark: palette.limeHover, light: palette.limeTint, contrastText: palette.ink },
    secondary: { main: palette.ink, contrastText: "#FFFFFF" },
    success: { main: palette.success },
    background: { default: palette.paper, paper: palette.surface },
    text: { primary: palette.ink, secondary: palette.muted },
    divider: palette.line,
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: body,
    h1: { fontFamily: display, fontWeight: 700, fontSize: "clamp(2.75rem, 7vw, 5.25rem)", lineHeight: 1, letterSpacing: "-0.03em" },
    h2: { fontFamily: display, fontWeight: 700, fontSize: "clamp(2rem, 4.6vw, 3.25rem)", lineHeight: 1.06, letterSpacing: "-0.025em" },
    h3: { fontFamily: display, fontWeight: 650, fontSize: "clamp(1.5rem, 3.2vw, 2rem)", lineHeight: 1.15, letterSpacing: "-0.02em" },
    h4: { fontFamily: display, fontWeight: 650, fontSize: "1.375rem", lineHeight: 1.25, letterSpacing: "-0.01em" },
    h5: { fontFamily: display, fontWeight: 650, fontSize: "1.125rem", lineHeight: 1.3 },
    h6: { fontWeight: 650, fontSize: "1rem", lineHeight: 1.4 },
    subtitle1: { fontSize: "1.125rem", lineHeight: 1.55, color: palette.muted },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.9375rem", lineHeight: 1.55 },
    overline: { fontWeight: 650, letterSpacing: "0.08em", fontSize: "0.75rem" },
    button: { textTransform: "none", fontWeight: 650, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" },
        "::selection": { background: palette.lime, color: palette.ink },
        "h1, h2, h3": { textWrap: "balance" },
        ":focus-visible": { outline: `2px solid ${palette.ink}`, outlineOffset: 3 },
        // Scroll-linked reveal: progressive enhancement, content is never hidden without support.
        "@supports (animation-timeline: view())": {
          "@media (prefers-reduced-motion: no-preference)": {
            ".reveal": {
              animation: "reveal-up linear both",
              animationTimeline: "view()",
              animationRange: "entry 5% cover 30%",
            },
          },
        },
        "@keyframes reveal-up": {
          from: { opacity: 0, transform: "translateY(28px)" },
          to: { opacity: 1, transform: "none" },
        },
        "@media print": {
          body: { background: "#FFFFFF" },
          ".no-print": { display: "none !important" },
          ".reveal": { animation: "none !important" },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: { "&:hover": { backgroundColor: palette.limeHover, boxShadow: `0 10px 30px -12px ${alpha(palette.lime, 0.9)}` } },
        },
      ],
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 22,
          minHeight: 44,
          transition: "background-color .2s ease, transform .2s ease, box-shadow .2s ease",
          "&:active": { transform: "translateY(1px)" },
        },
        sizeLarge: { paddingInline: 28, minHeight: 54, fontSize: "1rem" },
        outlined: { borderColor: palette.line, "&:hover": { borderColor: palette.ink, background: "transparent" } },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { outlined: { borderColor: palette.line } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } } },
    MuiCheckbox: { defaultProps: { color: "secondary" } },
    MuiTextField: { defaultProps: { fullWidth: true, color: "secondary" } },
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
    MuiLink: { defaultProps: { underline: "always", color: "inherit" }, styleOverrides: { root: { textUnderlineOffset: 3 } } },
  },
});
