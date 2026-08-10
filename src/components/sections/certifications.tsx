import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";

export function CertificationsSection({ content }: { content: ResumeContent }) {
  return (
    <section id="certifications" className="section">
      <div className="container-page">
        <Reveal>
          <p className="section-kicker">Credentials</p>
          <h2 className="section-title">{content.certifications.heading}</h2>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {content.certifications.items.map((item, index) => (
            <Reveal key={item.id} delay={Math.min(index * 0.03, 0.18)}>
              <GlassCard className="p-5">
                <h3 className="text-sm font-semibold tracking-tight sm:text-base">
                  {item.name}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--muted)]">
                  {item.issuer}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
