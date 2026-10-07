import { ImageResponse } from "next/og";
import { RIBBON, RIBBON_OFFSET, TRIANGLE, MARK_VIEWBOX } from "@/components/brand/mark-paths";

export const alt = "SOCIALxBRAND PILOT — Digital Marketing Agency. We will show, you will grow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#faf8f5", color: "#181614", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="48" height="71" viewBox={MARK_VIEWBOX}>
            <path d={RIBBON} fill="#f43436" />
            <path d={RIBBON} fill="#f43436" transform={`translate(0 ${RIBBON_OFFSET})`} />
            <path d={TRIANGLE} fill="#f43436" />
          </svg>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}><span style={{ color: "#2a3ba4" }}>SOCIAL</span><span>x</span><span style={{ color: "#f43436" }}>BRAND PILOT</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* one phrase per line: the OG renderer has no condensed display face, so text sets wide */}
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>EVERY BUSINESS HAS</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3, color: "#2a3ba4" }}>SOMETHING</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3, color: "#f43436" }}>WORTH SHOWING.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#6b665f" }}>
          <span>Digital Marketing Agency · India &amp; Global</span>
          <span>We will show, you will grow.</span>
        </div>
      </div>
    ),
    size,
  );
}
