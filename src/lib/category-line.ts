/** "Category · format" for a project card, without saying the same thing twice (Graphic Design · Graphic design). */
export const categoryLine = ({ kicker, format }: { kicker: string; format: string }) =>
  kicker.toLowerCase() === format.toLowerCase() ? kicker : `${kicker} · ${format}`;
