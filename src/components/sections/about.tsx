import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";

export function AboutSection({ content }: { content: ResumeContent }) {
  return (
    <section id="about" className="section">
      <div className="container-page">
        <Reveal>
          <p className="section-kicker">Profile</p>
          <h2 className="section-title">{content.about.heading}</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <GlassCard className="mt-6 p-6 sm:p-8">
            <p className="prose-muted max-w-4xl text-base sm:text-[1.05rem]">
              {content.about.body}
            </p>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
