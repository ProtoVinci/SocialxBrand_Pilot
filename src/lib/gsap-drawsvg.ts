"use client";
// DrawSVG is only used by the home page's finale (`drawSVG` on the underline). Import this module
// for its side effect: it registers the plugin without adding it to the shared bundle.
import { gsap } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);
