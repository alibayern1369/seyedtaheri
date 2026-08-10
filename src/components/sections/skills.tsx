import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";

export function SkillsSection({ content }: { content: ResumeContent }) {
  return (
    <section id="skills" className="section">
      <div className="container-page">
        <Reveal>
          <p className="section-kicker">Capabilities</p>
          <h2 className="section-title">{content.skills.heading}</h2>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {content.skills.categories.map((category, index) => (
            <Reveal key={category.id} delay={Math.min(index * 0.04, 0.2)}>
              <GlassCard className="h-full p-5 sm:p-6">
                <h3 className="text-base font-semibold tracking-tight">
                  {category.name}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
