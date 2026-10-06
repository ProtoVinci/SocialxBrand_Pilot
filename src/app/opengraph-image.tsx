import { ImageResponse } from "next/og";
import { RIBBON, RIBBON_OFFSET, TRIANGLE, MARK_VIEWBOX } from "@/components/brand/mark-paths";

export const alt = "SOCIALxBRAND PILOT — Digital Marketing Agency. We will show, you will grow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b0a12", color: "#f3f0e8", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="48" height="71" viewBox={MARK_VIEWBOX}>
            <path d={RIBBON} fill="#ff3131" />
            <path d={RIBBON} fill="#ff3131" transform={`translate(0 ${RIBBON_OFFSET})`} />
            <path d={TRIANGLE} fill="#ff3131" />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>SOCIALxBRAND PILOT</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3 }}>EVERY BUSINESS HAS</div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3 }}>
            <span>SOMETHING</span>
            <span style={{ color: "#ff3131", marginLeft: 22 }}>WORTH SHOWING.</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a9a5b6" }}>
          <span>Digital Marketing Agency · India &amp; Global</span>
          <span>We will show, you will grow.</span>
        </div>
      </div>
    ),
    size,
  );
}
