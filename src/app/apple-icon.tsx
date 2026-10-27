import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the same lime "n" mark as the favicon and the logo. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#D4FF3A" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M10.5 23.5V13.5M10.5 17.5a5.5 5.5 0 0 1 11 0v6" fill="none" stroke="#0E0F12" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
