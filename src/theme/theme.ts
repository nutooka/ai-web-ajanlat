"use client";

import { alpha, createTheme } from "@mui/material/styles";
import { gradients, palette, shadow } from "./tokens";

const display = "var(--font-display), 'Bricolage Grotesque', system-ui, sans-serif";
const body = "var(--font-body), 'Instrument Sans', system-ui, sans-serif";

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    // The brand gradient is drawn on buttons below; this solid is its mid tone for anything MUI paints itself.
    primary: { main: "#FF7A6B", dark: "#E5604F", light: palette.brandTint, contrastText: palette.ink },
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
        "::selection": { background: "#FFD9CF", color: palette.ink },
        "html": { caretColor: palette.ink, accentColor: "#FF7A6B" },
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
        // Entrance motion in plain CSS, so content is visible as soon as the HTML paints (no JS needed).
        "@media (prefers-reduced-motion: no-preference)": {
          ".enter-rise": { animation: "enter-rise .6s cubic-bezier(.22,1,.36,1) both" },
          ".enter-fade": { animation: "enter-fade .8s cubic-bezier(.22,1,.36,1) .2s both" },
          ".enter-marker": { animation: "enter-marker .7s cubic-bezier(.22,1,.36,1) .45s both" },
        },
        // Transform only (no opacity): the headline is the LCP element and must be visible at once.
        "@keyframes enter-rise": { from: { transform: "translateY(18px)" }, to: { transform: "none" } },
        "@keyframes enter-fade": { from: { opacity: 0, transform: "translateY(24px)" }, to: { opacity: 1, transform: "none" } },
        "@keyframes enter-marker": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "@keyframes reveal-up": {
          from: { opacity: 0, transform: "translateY(28px)" },
          to: { opacity: 1, transform: "none" },
        },
        ".print-only": { display: "none" },
        "@page": { size: "A4", margin: "14mm 12mm" },
        "@media print": {
          body: { background: "#FFFFFF", color: palette.ink, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" },
          ".no-print": { display: "none !important" },
          ".print-only": { display: "block !important" },
          ".reveal": { animation: "none !important" },
          // Dark header and hero become black-on-white, with readable (not pale) secondary text.
          ".site-header": { background: "#FFFFFF !important", borderBottom: `2px solid ${palette.ink}` },
          ".site-header, .site-header *": { color: `${palette.ink} !important` },
          ".site-header .MuiContainer-root": { paddingTop: "0 !important", paddingBottom: "8px !important", minHeight: "0 !important" },
          ".offer-hero": { background: "#FFFFFF !important" },
          ".offer-hero .MuiContainer-root": { paddingTop: "20px !important", paddingBottom: "8px !important" },
          ".offer-hero .MuiTypography-root": { color: "#2B2D33 !important" },
          ".offer-hero h1": { color: `${palette.ink} !important`, fontSize: "34px !important" },
          // Details: every tab panel, one after the other.
          ".MuiTabs-root": { display: "none !important" },
          ".print-panel": { paddingTop: "8px", marginTop: "16px", borderTop: `1px solid ${palette.line}` },
          ".print-panel:first-of-type": { borderTop: "none", marginTop: 0 },
          ".offer-details": { marginTop: "16px !important" },
          "h2, h3, h4, h5": { breakAfter: "avoid" },
          "li, .MuiChip-root, .print-row": { breakInside: "avoid" },
          ".MuiTypography-root.MuiTypography-body2": { color: "#3A3C42" },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      variants: [
        {
          // Brand gradient, ink text. Hover slides the gradient; disabled drops it (never looks clickable).
          props: { variant: "contained", color: "primary" },
          style: {
            color: palette.ink,
            backgroundColor: "#FF7A6B",
            backgroundImage: gradients.brand,
            backgroundSize: "200% 100%",
            backgroundPosition: "0% 50%",
            transition: "background-position .3s cubic-bezier(.22,1,.36,1), transform .2s ease, box-shadow .2s ease",
            "&:hover": { backgroundPosition: "100% 50%", boxShadow: shadow.raised },
            // Real disabled, and "focusable but not ready yet" (aria-disabled, e.g. the planner's next button).
            "&.Mui-disabled, &[aria-disabled='true']": { backgroundImage: "none", backgroundColor: palette.paper, color: palette.muted, boxShadow: "none" },
          },
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
