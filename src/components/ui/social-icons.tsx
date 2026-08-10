import { Mail, Phone, Globe, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { SocialLink } from "@/types/resume";
import { cn } from "@/lib/utils";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.77-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0Z" />
    </svg>
  );
}

type IconComponent =
  | LucideIcon
  | ComponentType<{ className?: string; strokeWidth?: number }>;

const iconMap: Record<SocialLink["icon"], IconComponent> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  email: Mail,
  phone: Phone,
  website: Globe,
  x: Globe,
};

export function SocialIcons({
  links,
  className,
}: {
  links: SocialLink[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {links.map((link) => {
        const Icon = iconMap[link.icon] ?? Globe;
        return (
          <a
            key={link.id}
            href={link.url}
            target={
              link.url.startsWith("mailto:") || link.url.startsWith("tel:")
                ? undefined
                : "_blank"
            }
            rel="noopener noreferrer"
            className="focus-ring glass inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted)] transition-all duration-300 hover:-translate-y-0.5 hover:text-[var(--fg)]"
            aria-label={link.label}
            title={link.label}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </a>
        );
      })}
    </div>
  );
}
