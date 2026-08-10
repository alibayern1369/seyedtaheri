import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";

export function EducationSection({ content }: { content: ResumeContent }) {
  return (
    <section id="education" className="section">
      <div className="container-page">
        <Reveal>
          <p className="section-kicker">Academic</p>
          <h2 className="section-title">{content.education.heading}</h2>
        </Reveal>

        <div className="mt-8 grid gap-4">
          {content.education.items.map((item, index) => (
            <Reveal key={item.id} delay={Math.min(index * 0.05, 0.15)}>
              <GlassCard className="p-5 sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {item.degree}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {item.institution}
                    </p>
                    {item.details && (
                      <p className="mt-3 text-sm text-[var(--muted)]">
                        {item.details}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-[var(--faint)]">
                    {item.startDate} — {item.endDate}
                  </p>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
