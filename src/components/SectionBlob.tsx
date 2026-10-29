"use client";

import Box from "@mui/material/Box";
import type { CSSProperties } from "react";
import { Blob, type BlobTone } from "./Blob";

interface SectionBlobProps {
  tone?: BlobTone;
  size?: number;
  /** Desktop position; the shape is cropped by the section (give the section `overflow: hidden`). */
  position: Pick<CSSProperties, "top" | "right" | "bottom" | "left">;
}

/**
 * The one decorative shape of a section (see DESIGN.md): cropped at the edge, never behind text, still.
 * On phones it shrinks to half and sits at the top-right, cropped only by the right edge.
 */
export function SectionBlob({ tone = "brand", size = 320, position }: SectionBlobProps) {
  return (
    <Box
      aria-hidden
      className="no-print"
      sx={{
        position: "absolute",
        zIndex: 0,
        pointerEvents: "none",
        // Every side is set at md too ("auto" when unused), so the phone corner never leaks into desktop.
        // Phones: starts inside the section (never cut flat by its top edge), only the right edge crops it.
        top: { xs: 16, md: position.top ?? "auto" },
        right: { xs: -size * 0.25, md: position.right ?? "auto" },
        bottom: { xs: "auto", md: position.bottom ?? "auto" },
        left: { xs: "auto", md: position.left ?? "auto" },
        transform: { xs: "scale(.5)", md: "none" },
        transformOrigin: "top right",
        opacity: 0.95,
      }}
    >
      <Blob tone={tone} size={size} morph={false} />
    </Box>
  );
}
