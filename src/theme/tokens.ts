/**
 * Design tokens – plain module so both Server and Client Components can import it.
 * Colour roles (see DESIGN.md):
 * - ink: structure (headers, hero, bars, selected border); inkSoft: raised surface on ink
 * - gradients.brand: the one primary action per screen + "your choice" (selection border, check, progress)
 * - packageThemes: package identity (card header, package chip) + liquid shapes; always ink text
 * - gradients.discount: discount and time
 * Gradients are fills only – text on them is always ink (never gradient text, never white).
 * - paper/surface/line/muted: neutral content and info notes
 */
export const palette = {
  ink: "#0E0F12",
  inkSoft: "#1A1C21",
  inkLine: "rgba(255,255,255,.12)",
  inkMuted: "rgba(255,255,255,.62)",
  paper: "#F5F5F0",
  surface: "#FFFFFF",
  line: "#E4E4DD",
  muted: "#5B5F68",
  /** Light tint behind a selected answer card ("your choice"). */
  brandTint: "#FFF1EC",
  /** Small accents (icons) on ink, from the brand coral – text on ink stays white. */
  brandOnDark: "#FFB59E",
  success: "#127A4B",
  cross: "#FF6B81",
} as const;

/** Shared gradients – fills only, always with ink text. */
export const gradients = {
  /** Two neighbouring colours (orange → pink), never a rainbow: action + "your choice". */
  brand: "linear-gradient(120deg, #FFB547 0%, #FF5E7E 100%)",
  /** Discount and time. */
  discount: "linear-gradient(135deg, #FFD27A 0%, #FFB547 55%, #FF9447 100%)",
} as const;

/** One neutral, offset shadow for every raised surface. No coloured glows. */
export const shadow = {
  raised: "0 18px 40px -24px rgba(14,15,18,.35)",
  raisedOnDark: "0 24px 48px -28px rgba(0,0,0,.7)",
} as const;

/** Each package owns a gradient – used for pricing card headers, bubbles and buttons. */
export const packageThemes = {
  basic: { gradient: "linear-gradient(135deg, #2BD2C9 0%, #3A7BFF 100%)", solid: "#3A9BFF", bubble: "#2F9BFF", headerText: "#0E0F12" },
  standard: { gradient: "linear-gradient(135deg, #FFB547 0%, #FF5E7E 100%)", solid: "#FF8A62", bubble: "#FF7A6B", headerText: "#0E0F12" },
  premium: { gradient: "linear-gradient(135deg, #5BE38A 0%, #10A37F 100%)", solid: "#2FC487", bubble: "#3BCB8A", headerText: "#0E0F12" },
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
};
