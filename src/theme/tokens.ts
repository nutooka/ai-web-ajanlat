/**
 * Design tokens – plain module so both Server and Client Components can import it.
 * Brand: ink + lime. Lime is a fill colour (buttons, highlights, badges), never text on white.
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
  cardBody: "#1C1B2E",
  cardBodyDeep: "#121124",
  check: "#7BE495",
  cross: "#FF6B81",
} as const;

/** Each package owns a gradient – used for pricing card headers, bubbles and buttons. */
export const packageThemes = {
  basic: { gradient: "linear-gradient(135deg, #2BD2C9 0%, #3A7BFF 100%)", bubble: "#2F9BFF", headerText: "#FFFFFF" },
  standard: { gradient: "linear-gradient(135deg, #FFB547 0%, #FF5E7E 100%)", bubble: "#FF7A6B", headerText: "#FFFFFF" },
  premium: { gradient: "linear-gradient(135deg, #D4FF3A 0%, #2BD98A 100%)", bubble: "#5BE07A", headerText: "#0E0F12" },
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
};
