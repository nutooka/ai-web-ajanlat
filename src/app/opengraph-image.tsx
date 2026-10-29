import { ImageResponse } from "next/og";
import { startingPrice } from "@/features/pricing/startingPrice";
import { formatRon } from "@/lib/format";

export const alt = "Nutooka – weboldal-árajánlat 3 perc alatt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0E0F12";
const BRAND = "linear-gradient(120deg, #2BD2C9 0%, #3A7BFF 35%, #FF5E7E 70%, #FFB547 100%)";
const DISCOUNT = "linear-gradient(135deg, #FFD27A 0%, #FFB547 55%, #FF9447 100%)";

/** Link preview for Facebook, Messenger, WhatsApp, LinkedIn. */
export default function OpengraphImage() {
  const from = formatRon(startingPrice("company"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: INK, color: "#fff", position: "relative" }}>
        {/* Liquid shapes, like the site. */}
        <div style={{ position: "absolute", right: -120, top: -140, width: 520, height: 520, borderRadius: 9999, background: "linear-gradient(135deg, #FFB547, #FF6B8B)", opacity: 0.9 }} />
        <div style={{ position: "absolute", right: 220, bottom: -180, width: 360, height: 360, borderRadius: 9999, background: "linear-gradient(135deg, #3FD0C9, #4D7CFE)", opacity: 0.85 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: BRAND, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="56" height="56" viewBox="0 0 32 32">
              <path d="M10.5 23.5V13.5M10.5 17.5a5.5 5.5 0 0 1 11 0v6" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>nutooka.tech</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Mennyibe kerül a weboldalad?</div>
          <div style={{ fontSize: 34, marginTop: 24, color: "#C9CBD1" }}>Töltsd ki a kérdőívet, és 3 perc alatt kapsz tételes árajánlatot.</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", padding: "16px 28px", borderRadius: 14, background: BRAND, color: INK, fontSize: 32, fontWeight: 800 }}>Céges weboldal {from}-tól</div>
          <div style={{ display: "flex", padding: "16px 24px", borderRadius: 14, background: DISCOUNT, color: INK, fontSize: 30, fontWeight: 800 }}>−25% gyors döntéskor</div>
        </div>
      </div>
    ),
    size,
  );
}
