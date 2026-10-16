import { Reveal } from "@/components/motion/Reveal";
import { method, steps } from "@/content/site";

/**
 * How a project runs, in four steps, the same on every page that explains it (home, How we work,
 * each service). `detail`: also list the method stages each step stands for (How we work).
 */
export function ProcessSteps({ detail = false }: { detail?: boolean }) {
  return (
    <Reveal group as="ol" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.id} className="flex flex-col border-t-2 border-ink pt-5">
          <span className="font-display text-[2.4rem] font-medium leading-none text-signal">{i + 1}</span>
          <h3 className="mt-4 font-display text-title font-medium">{s.title}</h3>
          <p className="mt-2 text-ink/75">{s.body}</p>
          {detail && (
            <ul className="mt-5 flex flex-col gap-3 border-t border-ink/10 pt-4 text-sm text-ink/70">
              {s.stages.map((id) => {
                const m = method.find((x) => x.id === id)!;
                return (
                  <li key={id}>
                    <span className="font-medium text-ink">{m.name}.</span> {m.body}
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      ))}
    </Reveal>
  );
}
