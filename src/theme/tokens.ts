/**
 * Design tokens – plain module so both Server and Client Components can import it.
 * Colour roles (see DESIGN.md):
 * - ink: structure (headers, hero, bars, selected border); inkSoft: raised surface on ink
 * - lime: the one primary action per screen + "your choice" (selection fill, check)
 * - packageThemes: package identity only (card header, package chip) + liquid shapes; always ink text
 * - amber: discount and time
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
  lime: "#D4FF3A",
  limeHover: "#C6F22B",
  limeTint: "#F3FBD6",
  success: "#127A4B",
  /** Discount and time – never used for actions. */
  amber: "#FFB547",
  check: "#7BE495",
  cross: "#FF6B81",
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
  premium: { gradient: "linear-gradient(135deg, #D4FF3A 0%, #2BD98A 100%)", solid: "#7BEA62", bubble: "#5BE07A", headerText: "#0E0F12" },
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
};
