import Box from "@mui/material/Box";

/** Soft colour field behind the page so it never feels flat white. Purely decorative. */
export function Backdrop({ variant = "default" }: { variant?: "default" | "quiet" }) {
  const strength = variant === "quiet" ? 0.55 : 1;
  return (
    <Box
      aria-hidden
      className="no-print"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        opacity: strength,
        background: `
          radial-gradient(60vw 50vh at 100% -10%, rgba(43,75,255,.16), transparent 70%),
          radial-gradient(50vw 45vh at -10% 30%, rgba(122,63,224,.12), transparent 70%),
          radial-gradient(45vw 40vh at 80% 100%, rgba(215,247,91,.28), transparent 70%),
          radial-gradient(35vw 35vh at 20% 110%, rgba(255,160,110,.14), transparent 70%)
        `,
      }}
    />
  );
}
