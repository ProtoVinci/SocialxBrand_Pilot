"use client";
// Single registration point for GSAP. Import gsap and plugins from here, never directly.
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

// Flip and DrawSVG are not here: each is used by one or two routes only and is registered by
// lib/gsap-flip.ts / lib/gsap-drawsvg.ts, so the shared bundle every route loads does not carry them.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

// cubic-bezier(0.22, 1, 0.36, 1) and (0.65, 0, 0.35, 1), expressed as SVG path data
CustomEase.create("pilot", "M0,0 C0.22,1 0.36,1 1,1");
CustomEase.create("glide", "M0,0 C0.65,0 0.35,1 1,1");

gsap.defaults({ ease: "pilot", duration: 0.6 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, useGSAP, ScrollTrigger, SplitText, CustomEase };
