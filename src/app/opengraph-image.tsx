import { ImageResponse } from "next/og";
import { RIBBON, RIBBON_OFFSET, TRIANGLE, MARK_VIEWBOX } from "@/components/brand/mark-paths";

export const alt = "SOCIALxBRAND PILOT — Digital Marketing Agency. We will show, you will grow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fdf9f7", color: "#12121a", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="48" height="71" viewBox={MARK_VIEWBOX}>
            <path d={RIBBON} fill="#ff3131" />
            <path d={RIBBON} fill="#ff3131" transform={`translate(0 ${RIBBON_OFFSET})`} />
            <path d={TRIANGLE} fill="#ff3131" />
          </svg>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}><span style={{ color: "#3651e6" }}>SOCIAL</span><span>x</span><span style={{ color: "#ff3131" }}>BRAND PILOT</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* one phrase per line: the OG renderer has no condensed display face, so text sets wide */}
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>EVERY BUSINESS HAS</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3, color: "#3651e6" }}>SOMETHING</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3, color: "#ff3131" }}>WORTH SHOWING.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#55556a" }}>
          <span>Digital Marketing Agency · India &amp; Global</span>
          <span>We will show, you will grow.</span>
        </div>
      </div>
    ),
    size,
  );
}
