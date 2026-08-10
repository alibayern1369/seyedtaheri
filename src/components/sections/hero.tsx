"use client";

import Image from "next/image";
import { ArrowDownRight, MapPin } from "lucide-react";
import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { SocialIcons } from "@/components/ui/social-icons";

export function HeroSection({ content }: { content: ResumeContent }) {
  const { profile } = content;

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center pt-28 pb-16"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-[18%] left-[8%] h-56 w-56 rounded-full bg-[var(--hero-orb-1)] blur-3xl" />
        <div className="absolute right-[10%] bottom-[20%] h-64 w-64 rounded-full bg-[var(--hero-orb-2)] blur-3xl" />
      </div>

      <div className="container-page relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <p className="section-kicker">Portfolio</p>
          <h1 className="max-w-3xl text-[clamp(2.6rem,7vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
            {profile.name}
          </h1>
          <p className="mt-3 text-xl font-medium tracking-tight text-[var(--muted)] sm:text-2xl">
            {profile.title}
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {profile.tagline}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#contact" className="btn btn-primary focus-ring">
              Get in touch
              <ArrowDownRight className="h-4 w-4" />
            </a>
            <a href="#experience" className="btn btn-ghost focus-ring">
              View experience
            </a>
          </div>

          <SocialIcons className="mt-8" links={content.socialLinks} />
        </Reveal>

        <Reveal delay={0.12} className="justify-self-center lg:justify-self-end">
          <div className="glass-strong relative aspect-[4/5] w-[min(100%,22rem)] overflow-hidden rounded-[2rem] p-3">
            <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-[var(--bg-elevated)]">
              {profile.photoUrl ? (
                <Image
                  src={profile.photoUrl}
                  alt={profile.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 80vw, 352px"
                  unoptimized={
                    profile.photoUrl.startsWith("data:") ||
                    profile.photoUrl.startsWith("/api/photo") ||
                    profile.photoUrl.startsWith("/api/media/")
                  }
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--accent-soft)] text-3xl font-semibold tracking-tight text-[var(--accent)]">
                    {profile.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    Profile photo can be added from the admin panel.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
