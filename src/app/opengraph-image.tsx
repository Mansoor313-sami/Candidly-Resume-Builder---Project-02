import { ImageResponse } from "next/og";

/** Branded Open Graph image (used when a Candidly link is shared). */
export const runtime = "nodejs";
export const alt = "Candidly — AI resume & portfolio builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #f2fbef, #d9f9e6 60%, #eef7cf)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#16a34a,#0d9488)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 800 }}>C</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#14261c" }}>Candidly</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 74, fontWeight: 800, color: "#14261c", lineHeight: 1.05, maxWidth: 900 }}>
          A resume that sounds like you, at your best.
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#3a5c49" }}>
          AI resume &amp; portfolio builder · 20 templates · PDF &amp; Word export
        </div>
      </div>
    ),
    { ...size }
  );
}
