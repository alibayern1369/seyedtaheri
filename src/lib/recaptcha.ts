import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  getRecaptchaPublicConfig,
  getResumeContent,
} from "@/lib/content";
import type { RecaptchaSettings } from "@/types/resume";

export const RECAPTCHA_COOKIE = "portfolio_recaptcha_ok";
const SITE_PASS_TTL_SECONDS = 60 * 60 * 6; // 6 hours

type GoogleVerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

function getPassSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dev-insecure-secret-change-me"
  );
}

function sign(value: string) {
  return createHmac("sha256", getPassSecret()).update(value).digest("hex");
}

export function createRecaptchaPassToken() {
  const issuedAt = Date.now().toString();
  const payload = `recaptcha:${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyRecaptchaPassToken(
  token: string | undefined | null,
): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const [, issuedAt] = payload.split(":");
  const ts = Number(issuedAt);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < SITE_PASS_TTL_SECONDS * 1000;
}

export function recaptchaPassCookieOptions(maxAge = SITE_PASS_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getRecaptchaSettings(): Promise<RecaptchaSettings> {
  const content = await getResumeContent();
  return content.recaptcha;
}

export async function getPublicRecaptchaConfig() {
  const content = await getResumeContent();
  return getRecaptchaPublicConfig(content);
}

export async function hasValidRecaptchaPass() {
  const jar = await cookies();
  return verifyRecaptchaPassToken(jar.get(RECAPTCHA_COOKIE)?.value);
}

export async function verifyRecaptchaToken(
  token: string | undefined | null,
  expectedAction: string,
): Promise<{ ok: true; score: number } | { ok: false; error: string }> {
  if (!token) {
    return { ok: false, error: "Missing reCAPTCHA token" };
  }

  const settings = await getRecaptchaSettings();
  if (!settings.siteKey || !settings.secretKey) {
    return { ok: false, error: "reCAPTCHA is not configured" };
  }

  const body = new URLSearchParams({
    secret: settings.secretKey,
    response: token,
  });

  let data: GoogleVerifyResponse;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    data = (await res.json()) as GoogleVerifyResponse;
  } catch {
    return { ok: false, error: "Unable to verify reCAPTCHA" };
  }

  if (!data.success) {
    return { ok: false, error: "reCAPTCHA verification failed" };
  }

  if (data.action && data.action !== expectedAction) {
    return { ok: false, error: "reCAPTCHA action mismatch" };
  }

  const score = typeof data.score === "number" ? data.score : 0;
  if (score < settings.minScore) {
    return { ok: false, error: "reCAPTCHA score too low" };
  }

  return { ok: true, score };
}
