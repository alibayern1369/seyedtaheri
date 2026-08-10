"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const modes = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "glass h-10 w-[7.5rem] rounded-full opacity-60",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "glass inline-flex items-center gap-0.5 rounded-full p-1",
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      {modes.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
              active
                ? "bg-[var(--glass-fill-strong)] text-[var(--fg)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--fg)]",
            )}
            aria-label={label}
            aria-pressed={active}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}
