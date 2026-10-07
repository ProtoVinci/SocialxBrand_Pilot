# Merge candidates from the `sujal_site` prototype

`C:\Users\Parth\Desktop\sujal_site` is a separate prototype (its own git repo, hanzo/promptiq-inspired, light warm palette).
The user plans to merge **some** of its parts into this site. **Nothing is merged yet: wait for the user to pick.**
Whatever gets merged is rebuilt in this repo's grammar (GSAP tokens, `act-*` palette, VideoBudget, reduced-motion/no-JS failsafes). Their files are never copied as they are.

## Blocked: these break the non-negotiables
- Hero rating stack ("4.9/5", "Trusted by 50+ Ambitious Brands", "Client 1–3" avatars). Invented proof.
- Hero pill graphic "+340% VERIFIED ROAS". Invented metric.
- "Booking Open — 2 Strategy Sprints Left". Invented scarcity.
- `ui/LiveActivityToast.tsx`: fake activity with cities.
- `ui/ChatFeedbackBubbles.tsx`: invented testimonials.
- `ui/PartnerMarquee.tsx`: invented partnerships (Meta Business Partner, Google Ads Premier…).
- `sections/FaqSection.tsx` answers: invented turnaround, team and geography claims.
- `diagnostic/GrowthCompass.tsx`: numeric "scores" from a five-click quiz.

## Candidates (offered to the user, none chosen yet)
1. **Hero media capsules** (`sections/HeroSection.tsx` + `ui/HeroMediaPill.tsx`): rounded media pills inline in the headline, cycling real reels and stills. Strongest idea.
2. **Pilot Check** (`data/diagnostic.ts`, `diagnostic/PilotCheckFlow.tsx`): a five-step quiz (business type → stage → challenge → channels → 90–180-day priority). It would become a quick start that pre-fills `/route` via `routeStore`, with a qualitative readout only.
3. **FAQ + FAQPage JSON-LD**: keep the format, rewrite the answers only from `src/content/*`.
4. **Problem vs solution board** (`sections/ProblemVsSolutionSection.tsx`): copy from our philosophy and differentiators.
5. **Tools orbit** (`ui/RotatingSealBadge.tsx`, `sections/SpinningAppsOrbitSection.tsx`): undecided. If used, frame it as neutral "tools we use", with no partner wording.

## Likely skip (we already have a better version, or it misleads)
- Diagonal glare (`HeroGlareOverlay`): clashes with the `act-*` textures.
- Before/after slider: fakes a "raw" shot by greyscaling the same photo.
- Tilt cards, spotlight cursor, noise overlay: our pointer FX already cover these.
- Live clock and seal: we have `Clock` and `SpinBadge`.

Note: their `public/media` is a copy of this repo's media, so no new assets come from there.
