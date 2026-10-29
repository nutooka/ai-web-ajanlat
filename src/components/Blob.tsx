"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import type { PackageId } from "@/features/pricing/types";
import { ease, gradients, packageThemes } from "@/theme/tokens";

/**
 * The one liquid shape of the site. Its colour always means something:
 * - basic / standard / premium: that package (blue / orange / emerald)
 * - discount: discount and time (warm gradient)
 * - brand: decoration – at most one per section, cropped at the edge
 * - neutral: "still taking shape" (no package yet)
 * If a shape would mean nothing in a place, it does not go there.
 */
export type BlobTone = PackageId | "discount" | "neutral" | "brand";

export const BLOB_GRADIENTS: Record<BlobTone, string> = {
  basic: packageThemes.basic.gradient,
  standard: packageThemes.standard.gradient,
  premium: packageThemes.premium.gradient,
  discount: gradients.discount,
  brand: gradients.brand,
  neutral: "linear-gradient(135deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,.08) 100%)",
};

const SHAPES = [
  "42% 58% 70% 30% / 45% 45% 55% 55%",
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "35% 65% 55% 45% / 50% 60% 40% 50%",
];

interface BlobProps {
  tone: BlobTone;
  size: number;
  /** Absolute position inside a relatively positioned parent. Omit for inline use. */
  position?: Pick<CSSProperties, "top" | "right" | "bottom" | "left">;
  /** 0–1.5: lets the shape carry a value (progress, time left, emphasis). */
  scale?: number;
  opacity?: number;
  zIndex?: number;
  /** Slow organic morph. Off for small inline marks. */
  morph?: boolean;
  duration?: number;
  delay?: number;
}

export function Blob({ tone, size, position, scale = 1, opacity = 1, zIndex = 0, morph = true, duration = 15, delay = 0 }: BlobProps) {
  const reduce = useReducedMotion();
  const moving = morph && !reduce;

  return (
    <motion.div
      aria-hidden
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{
        scale,
        opacity,
        ...(moving ? { borderRadius: [...SHAPES, SHAPES[0]], rotate: [0, 12, -6, 0], y: [0, -12, 8, 0] } : {}),
      }}
      transition={{
        scale: { duration: 0.8, delay, ease: ease.out },
        opacity: { duration: 0.6, delay },
        ...(moving ? { default: { duration, repeat: Infinity, ease: "easeInOut" } } : {}),
      }}
      style={{
        position: position ? "absolute" : "relative",
        ...position,
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: SHAPES[0],
        overflow: "hidden",
        pointerEvents: "none",
        zIndex,
      }}
    >
      {/* Cross-fade when the meaning (tone) changes – gradients cannot tween directly. */}
      <AnimatePresence initial={false}>
        <motion.span
          key={tone}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: ease.out }}
          style={{ position: "absolute", inset: 0, background: BLOB_GRADIENTS[tone] }}
        />
      </AnimatePresence>
    </motion.div>
  );
}
