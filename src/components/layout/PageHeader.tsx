import type { ReactNode } from "react";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Crumbs, type Crumb } from "@/components/layout/Crumbs";

/** Standard inner-page opening: breadcrumb trail, bracketed index label, a mega headline, and a lede. */
export function PageHeader({ index, label, title, lede, crumbs, children }: { index: string; label: string; title: ReactNode; lede?: ReactNode; crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <header className="gutter pb-16 pt-[calc(var(--nav-h)+4rem)] md:pb-24 md:pt-[calc(var(--nav-h)+6rem)]">
      <Crumbs trail={crumbs} />
      <p className="label mt-6 text-blue">[ {index} ] {label}</p>
      <SplitReveal as="h1" trigger="mount" className="mt-6 max-w-[14ch] font-display text-mega font-medium">
        {title}
      </SplitReveal>
      {lede && <div className="mt-10 max-w-2xl text-lede text-ink/75">{lede}</div>}
      {children}
    </header>
  );
}
