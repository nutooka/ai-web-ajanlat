"use client";

import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { formatRon } from "@/lib/format";
import { ease, palette } from "@/theme/tokens";

/** Always-reachable "request a call" bar; hides itself once the contact form is on screen. */
export function StickyCta({ targetId, price, packageName }: { targetId: string; price: number; packageName: string }) {
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <AnimatePresence>
      {!formVisible && (
        <motion.div
          className="no-print"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: ease.out }}
          style={{ position: "fixed", insetInline: 0, bottom: 0, zIndex: 20 }}
        >
          <Box sx={{ background: palette.ink, color: "#fff", pb: "env(safe-area-inset-bottom)" }}>
            <Container maxWidth="lg" sx={{ py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: palette.inkMuted, display: { xs: "none", sm: "block" } }}>
                  {packageName} csomag · becsült ár
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 17, sm: 20 }, whiteSpace: "nowrap" }}>{formatRon(price)}</Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowDownward />}
                onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Ingyenes egyeztetést kérek
                </Box>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  Egyeztetést kérek
                </Box>
              </Button>
            </Container>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
