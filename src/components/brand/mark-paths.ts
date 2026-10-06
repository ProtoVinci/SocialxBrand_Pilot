// Vector trace of the SOCIALxBRAND PILOT logomark (two ribbons + play-triangle).
// Traced from the supplied 1563px artwork; viewBox is the mark's own bounding box.
export const MARK_VIEWBOX = "0 0 362 534";

export const RIBBON =
  "M361 0 L69 145 C25 167 0 210 0 250 C0 280 12 305 22 318 L44 345 C44 310 64 280 97 262 L294 167 C335 147 361 105 361 60 Z";

/** The second ribbon is the first one shifted down by this many units. */
export const RIBBON_OFFSET = 186;

export const TRIANGLE = "M361 370 L236 432 C222 440 222 460 236 468 L361 533 Z";

/** A single centre-line through both ribbons, used to "draw" the mark as a signal route. */
export const ROUTE_THROUGH_MARK =
  "M361 30 L83 170 C35 195 20 240 22 290 C24 320 40 335 44 345 C60 380 75 410 83 356 L361 216 C340 260 330 300 300 330 L83 446 C40 470 22 500 44 531";
