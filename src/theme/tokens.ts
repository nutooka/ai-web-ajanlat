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
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
};
