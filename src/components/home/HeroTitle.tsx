import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { gradients, palette } from "@/theme/tokens";

/**
 * Headline with a brand-gradient "marker" behind the key word – the page's signature motion.
 * Server component with CSS-only animation: the headline (LCP) shows on first paint, before any JavaScript.
 */
export function HeroTitle() {
  return (
    <Typography variant="h1" sx={{ color: "#fff", maxWidth: 640 }}>
      {/* The searchable part of the heading: what we do and where. */}
      <Box component="span" sx={{ display: "block", mb: 1.5, fontFamily: "var(--font-body)", fontSize: { xs: 14, md: 16 }, fontWeight: 600, letterSpacing: "0.02em", lineHeight: 1.4, color: palette.inkMuted }}>
        Weboldal és webshop készítés · Székelyudvarhely, Erdély
      </Box>
      <span className="enter-rise" style={{ display: "block" }}>
        Tervezzük meg
      </span>
      <span className="enter-rise" style={{ display: "block", animationDelay: ".08s" }}>
        együtt a{" "}
        <Box component="span" sx={{ position: "relative", display: "inline-block", px: "0.12em", mx: "-0.04em", color: palette.ink }}>
          <span
            aria-hidden
            className="enter-marker"
            style={{ position: "absolute", inset: "0.08em 0 0.02em", background: gradients.brand, borderRadius: 6, transformOrigin: "left", zIndex: 0 }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>weboldalad.</span>
        </Box>
      </span>
    </Typography>
  );
}
