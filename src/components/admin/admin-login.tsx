"use client";

import { useEffect, useState } from "react";
import { Lock, LoaderCircle, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { executeRecaptcha } from "@/lib/grecaptcha";

type LoginCaptchaConfig = {
  protectLogin: boolean;
  siteKey: string;
};

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<LoginCaptchaConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/recaptcha", { cache: "no-store" });
        const data = (await res.json()) as LoginCaptchaConfig;
        if (!cancelled) {
          setCaptcha({
            protectLogin: Boolean(data.protectLogin),
            siteKey: data.siteKey || "",
          });
        }
      } catch {
        if (!cancelled) {
          setCaptcha({ protectLogin: false, siteKey: "" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let captchaToken: string | undefined;
      if (captcha?.protectLogin && captcha.siteKey) {
        captchaToken = await executeRecaptcha(captcha.siteKey, "login");
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, captchaToken }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Invalid password");
        return;
      }
      onSuccess();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const captchaReady = captcha !== null;
  const captchaEnabled = Boolean(captcha?.protectLogin && captcha.siteKey);

  return (
    <div className="flex min-h-[100svh] items-center justify-center px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <GlassCard strong className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="glass flex h-11 w-11 items-center justify-center rounded-full">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Admin sign-in</h1>
            <p className="text-sm text-[var(--muted)]">
              Enter your password to manage resume content.
            </p>
          </div>
        </div>

        {captchaEnabled && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--glass)] px-3.5 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              This login is protected by Google reCAPTCHA v3. The check runs
              quietly in the background when you sign in.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--muted)]">Password</span>
            <input
              className="input-field"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!captchaReady || loading}
            />
          </label>
          {error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary focus-ring w-full"
            disabled={!captchaReady || loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : !captchaReady ? (
              "Preparing…"
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {captchaEnabled && (
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
        )}
      </GlassCard>
    </div>
  );
}
