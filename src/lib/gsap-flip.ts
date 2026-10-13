"use client";
// Flip is only used by the work index and the home page's audience tabs, so it is registered
// here and imported by those two instead of riding in the shared bundle every route downloads.
import { gsap } from "@/lib/gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export { Flip };
