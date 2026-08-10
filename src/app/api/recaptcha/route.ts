import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  RECAPTCHA_COOKIE,
  createRecaptchaPassToken,
  getPublicRecaptchaConfig,
  hasValidRecaptchaPass,
  recaptchaPassCookieOptions,
  verifyRecaptchaToken,
} from "@/lib/recaptcha";

export async function GET() {
  const config = await getPublicRecaptchaConfig();
  const [passed, authenticated] = await Promise.all([
    hasValidRecaptchaPass(),
    isAuthenticated(),
  ]);

  return NextResponse.json(
    {
      ...config,
      passed: passed || authenticated,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function POST(request: Request) {
  const config = await getPublicRecaptchaConfig();
  if (!config.protectSite) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = (await request.json()) as { token?: string };
  const result = await verifyRecaptchaToken(body.token, "site");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true, score: result.score });
  response.cookies.set(
    RECAPTCHA_COOKIE,
    createRecaptchaPassToken(),
    recaptchaPassCookieOptions(),
  );
  return response;
}
