import { Mail, MapPin, Phone } from "lucide-react";
import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";
import { SocialIcons } from "@/components/ui/social-icons";

export function ContactSection({ content }: { content: ResumeContent }) {
  const { contact } = content;

  return (
    <section id="contact" className="section">
      <div className="container-page">
        <Reveal>
          <p className="section-kicker">Connect</p>
          <h2 className="section-title">{contact.heading}</h2>
          <p className="prose-muted mt-2 max-w-2xl">{contact.description}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <GlassCard strong className="mt-8 p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div className="space-y-4">
                <a
                  href={`mailto:${contact.email}`}
                  className="focus-ring flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-[var(--glass)]"
                >
                  <span className="glass flex h-11 w-11 items-center justify-center rounded-full">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.12em] text-[var(--faint)]">
                      Email
                    </span>
                    <span className="text-sm font-medium sm:text-base">
                      {contact.email}
                    </span>
                  </span>
                </a>
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                  className="focus-ring flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-[var(--glass)]"
                >
                  <span className="glass flex h-11 w-11 items-center justify-center rounded-full">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.12em] text-[var(--faint)]">
                      Phone
                    </span>
                    <span className="text-sm font-medium sm:text-base">
                      {contact.phone}
                    </span>
                  </span>
                </a>
                <div className="flex items-center gap-3 rounded-2xl p-2">
                  <span className="glass flex h-11 w-11 items-center justify-center rounded-full">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.12em] text-[var(--faint)]">
                      Location
                    </span>
                    <span className="text-sm font-medium sm:text-base">
                      {contact.location}
                    </span>
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--glass)] p-6">
                <p className="text-sm text-[var(--muted)]">
                  Prefer social? Reach out directly.
                </p>
                <SocialIcons className="mt-4" links={content.socialLinks} />
                <a
                  href={`mailto:${contact.email}`}
                  className="btn btn-primary focus-ring mt-6 w-full"
                >
                  Send email
                </a>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
