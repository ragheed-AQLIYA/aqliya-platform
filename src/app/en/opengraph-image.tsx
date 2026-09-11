import { ImageResponse } from "next/og";

/** EN OpenGraph card — same branded template as the AR marketing segment. */

export const runtime = "nodejs";
export const alt = "AQLIYA — Private Governed Institutional Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background:
            "linear-gradient(135deg, #0a0f24 0%, #1e3a8a 55%, #2563eb 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "30px",
            fontWeight: 700,
            letterSpacing: "0.24em",
            color: "#0ea5e9",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "9999px",
              background: "#0ea5e9",
            }}
          />
          AQLIYA
        </div>
        <div
          style={{
            marginTop: "36px",
            fontSize: "76px",
            fontWeight: 800,
            lineHeight: 1.08,
            maxWidth: "980px",
          }}
        >
          Private, Governed Institutional Intelligence
        </div>
        <div
          style={{
            marginTop: "48px",
            fontSize: "26px",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          AI assists. Humans decide. Evidence governs.
        </div>
      </div>
    ),
    { ...size },
  );
}
