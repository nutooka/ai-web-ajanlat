/** Design tokens – plain module so both Server and Client Components can import it. */
export const palette = {
  ink: "#14161A",
  paper: "#F6F6F3",
  surface: "#FFFFFF",
  line: "#E6E3DB",
  muted: "#5C616B",
  primary: "#2B4BFF",
  primaryDark: "#1A33CC",
  primaryTint: "#EEF1FF",
  accent: "#D7F75B",
  success: "#127A4B",
  inkSoft: "#1E2129",
} as const;

/** Soft tints for icon tiles and cards – cycled so lists feel colourful but calm. */
export const tints = [
  { bg: "#E4EAFF", fg: "#2B4BFF" },
  { bg: "#EFE6FF", fg: "#7A3FE0" },
  { bg: "#DFF5E9", fg: "#127A4B" },
  { bg: "#FFE9DA", fg: "#C2531B" },
  { bg: "#EEF8CC", fg: "#5A7300" },
  { bg: "#DDF1F7", fg: "#0B7491" },
] as const;

export const tint = (index: number) => tints[index % tints.length];
