import type { CSSProperties } from "react";
import type { PackageId } from "@/features/pricing/types";
import { ease, gradients, packageThemes } from "@/theme/tokens";

const EASE_OUT = `cubic-bezier(${ease.out.join(",")})`;

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

/**
 * Pure CSS (no JS animation loop): the morph runs in the browser's style engine, so it costs
 * no main-thread JavaScript on phones. Keyframes live in theme.ts (blob-in, blob-morph).
 */
export function Blob({ tone, size, position, scale = 1, opacity = 1, zIndex = 0, morph = true, duration = 15, delay = 0 }: BlobProps) {
  return (
    <div
      aria-hidden
      style={{
        position: position ? "absolute" : "relative",
        ...position,
        width: size,
        height: size,
        flexShrink: 0,
        pointerEvents: "none",
        zIndex,
        opacity,
        transform: `scale(${scale})`,
        transition: `transform .8s ${EASE_OUT}, opacity .6s`,
      }}
    >
      <div className="blob-in" style={{ width: "100%", height: "100%", animationDelay: `${delay}s` }}>
        <div
          className={morph ? "blob-morph" : undefined}
          style={{ position: "relative", width: "100%", height: "100%", borderRadius: SHAPES[0], overflow: "hidden", animationDuration: `${duration}s` }}
        >
          {/* Cross-fade when the meaning (tone) changes – gradients cannot tween directly. */}
          {(Object.keys(BLOB_GRADIENTS) as BlobTone[]).map((key) => (
            <span
              key={key}
              className="blob-tone"
              style={{ position: "absolute", inset: 0, background: BLOB_GRADIENTS[key], opacity: key === tone ? 1 : 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
