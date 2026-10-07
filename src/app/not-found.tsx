import Link from "next/link";

export default function NotFound() {
  return (
    <section className="gutter flex min-h-svh flex-col justify-center pt-[var(--nav-h)]">
      <p className="label text-blue">[ 404 ] Off route</p>
      <h1 className="mt-6 font-display text-mega font-medium">
        Wrong <span className="serif-accent font-normal text-signal">turn.</span>
      </h1>
      <p className="mt-8 max-w-md text-lede text-ink/75">This page isn&apos;t on the route. Let&apos;s get you back to something worth showing.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-cta px-6 py-4 font-medium text-white transition-colors hover:bg-cta-hover">Back home</Link>
        <Link href="/work" className="rounded-full border border-line bg-white px-6 py-4 font-medium shadow-sm transition-colors hover:border-line-strong hover:bg-sand">See the work</Link>
      </div>
    </section>
  );
}
