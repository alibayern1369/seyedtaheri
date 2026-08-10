import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";

export function ServicesSection({ content }: { content: ResumeContent }) {
  return (
    <section id="services" className="section">
      <div className="container-page">
        <Reveal>
          <p className="section-kicker">How I help</p>
          <h2 className="section-title">{content.services.heading}</h2>
          <p className="prose-muted mt-2 max-w-2xl">
            {content.services.description}
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {content.services.items.map((item, index) => (
            <Reveal key={item.id} delay={Math.min(index * 0.05, 0.2)}>
              <GlassCard className="h-full p-6">
                <h3 className="text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="prose-muted mt-3 text-sm sm:text-[0.95rem]">
                  {item.description}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
