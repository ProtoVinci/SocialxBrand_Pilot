import Link from "next/link";

export default function NotFound() {
  return (
    <section className="gutter flex min-h-svh flex-col justify-center pt-[var(--nav-h)]">
      <p className="label text-fog">[ 404 ] Off route</p>
      <h1 className="mt-6 font-display text-mega font-bold [font-stretch:76%]">
        Wrong <span className="serif-accent font-normal text-signal">turn.</span>
      </h1>
      <p className="mt-8 max-w-md text-lede text-paper/75">This page isn&apos;t on the route. Let&apos;s get you back to something worth showing.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-signal px-6 py-4 font-semibold text-ink">Back home</Link>
        <Link href="/work" className="rounded-full border border-paper/25 px-6 py-4">See the work</Link>
      </div>
    </section>
  );
}
