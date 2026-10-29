"use client";

import WhatsApp from "@mui/icons-material/WhatsApp";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { trackStep } from "@/features/funnel/track";
import { palette } from "@/theme/tokens";

/**
 * "Kérdezz bátran" – a small floating WhatsApp button for visitors who would rather ask than fill in the questionnaire.
 * Hidden when no number is configured. Used on the home and service pages (not in the planner or on the offer).
 */
export function WhatsAppFab({ context }: { context?: string }) {
  const number: string = siteConfig.chat.whatsapp;
  // Appears once the visitor scrolls past the first screen, so it never covers the hero.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  if (!number) return null;
  const text = `Szia! A nutooka.tech-ről írok${context ? ` (${context})` : ""}. Kérdésem lenne:`;

  return (
    <Box
      component="a"
      href={`https://wa.me/${number}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Kérdezz bátran WhatsAppon"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => trackStep("chat_click")}
      className="no-print"
      sx={{
        position: "fixed",
        right: { xs: 16, md: 24 },
        bottom: { xs: "calc(16px + env(safe-area-inset-bottom))", md: 24 },
        zIndex: 1200,
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        minHeight: 52,
        minWidth: 52,
        px: { xs: 1.75, md: 2.25 },
        borderRadius: 999,
        background: palette.ink,
        color: "#fff",
        border: "1px solid rgba(255,255,255,.18)",
        boxShadow: "0 14px 30px -12px rgba(14,15,18,.55)",
        fontWeight: 650,
        fontSize: 15,
        textDecoration: "none",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "none" : "translateY(12px)",
        transition: "opacity .25s ease, transform .25s ease",
        "&:hover": { transform: "translateY(-2px)" },
        "&:focus-visible": { outline: `2px solid ${palette.ink}`, outlineOffset: 3 },
      }}
    >
      <WhatsApp sx={{ fontSize: 24 }} />
      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
        Kérdezz bátran
      </Box>
    </Box>
  );
}
