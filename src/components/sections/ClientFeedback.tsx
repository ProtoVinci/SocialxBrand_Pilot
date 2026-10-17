import { publishableFeedback } from "@/content/feedback";
import { FeedbackCarousel, type FeedbackCard } from "@/components/sections/FeedbackCarousel";

/**
 * What clients say, near the end of the home page: approved quotes as a row of cards the visitor
 * moves through (no autoplay, no star ratings). Renders NOTHING when there is no approved feedback,
 * so the page never shows an empty or placeholder section. Only the public fields are passed to the
 * browser: the source and approval records stay on the server.
 */
export function ClientFeedback() {
  const items: FeedbackCard[] = publishableFeedback().map(({ id, quote, displayName, role, business, logo, about }) => ({ id, quote, displayName, role, business, logo, about }));
  if (!items.length) return null;
  return (
    <section id="client-feedback" aria-labelledby="feedback-title" className="gutter py-20 md:py-28">
      <div className="text-center">
        <p className="label text-blue">Client feedback</p>
        <h2 id="feedback-title" className="mt-4 font-display text-headline font-medium">
          What our <span className="serif-accent font-normal text-signal">clients</span> say
        </h2>
      </div>
      <div className="mt-10 md:mt-12"><FeedbackCarousel items={items} /></div>
    </section>
  );
}
