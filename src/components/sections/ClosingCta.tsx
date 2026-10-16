import Link from "next/link";

/** The one closing call to action: a human question, what to do, one button. */
export function ClosingCta({
  title = "Have a project in mind?",
  body = "Tell us what your business needs help with. We’ll use that context to start the conversation.",
  cta = "Contact us",
  href = "/route",
}: { title?: string; body?: string; cta?: string; href?: string }) {
  return (
    <section aria-labelledby="closing-title" className="gutter pb-24 pt-4 md:pb-32">
      <div className="act-iris flex flex-col items-start gap-8 rounded-[28px] p-8 md:flex-row md:items-end md:justify-between md:p-14">
        <div>
          <h2 id="closing-title" className="max-w-[18ch] font-display text-headline font-medium">{title}</h2>
          <p className="mt-4 max-w-xl text-lede text-ink/80">{body}</p>
        </div>
        <Link href={href} transitionTypes={["nav-forward"]} className="magnetic inline-flex shrink-0 items-center gap-3 rounded-full bg-cta px-7 py-4 font-medium text-white shadow-sm transition-colors hover:bg-cta-hover">
          {cta} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
