"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, LoaderCircle, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { executeRecaptcha } from "@/lib/grecaptcha";

type RecaptchaStatus = {
  protectSite: boolean;
  protectLogin: boolean;
  siteKey: string;
  passed: boolean;
};

export function SiteRecaptchaGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<RecaptchaStatus | null>(null);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function loadStatus() {
    const res = await fetch("/api/recaptcha", { cache: "no-store" });
    const data = (await res.json()) as RecaptchaStatus;
    setStatus(data);
    return data;
  }

  async function verify(siteKey: string) {
    setVerifying(true);
    setError("");
    try {
      const token = await executeRecaptcha(siteKey, "site");
      const res = await fetch("/api/recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
        return;
      }
      setStatus((prev) => (prev ? { ...prev, passed: true } : prev));
    } catch {
      setError("Unable to run reCAPTCHA. Check your connection and try again.");
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadStatus();
        if (cancelled) return;
        if (data.protectSite && data.siteKey && !data.passed) {
          await verify(data.siteKey);
        }
      } catch {
        if (!cancelled) {
          setStatus({
            protectSite: false,
            protectLogin: false,
            siteKey: "",
            passed: true,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!status) {
    return <>{children}</>;
  }

  if (status.protectSite && status.siteKey && !status.passed) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center px-4 py-10">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <GlassCard strong className="w-full max-w-md p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="glass flex h-11 w-11 items-center justify-center rounded-full">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Security check
              </h1>
              <p className="text-sm text-[var(--muted)]">
                This site is protected by Google reCAPTCHA v3.
              </p>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)]">
            {verifying
              ? "Verifying that you are human…"
              : "We could not complete the security check."}
          </p>

          {error && (
            <p className="mt-3 text-sm" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary focus-ring mt-6 w-full"
            disabled={verifying}
            onClick={() => void verify(status.siteKey)}
          >
            {verifying ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Try again
              </>
            )}
          </button>

          <p className="mt-4 text-xs leading-relaxed text-[var(--faint)]">
            Protected by reCAPTCHA. Google{" "}
            <a
              className="underline underline-offset-2"
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              className="underline underline-offset-2"
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
