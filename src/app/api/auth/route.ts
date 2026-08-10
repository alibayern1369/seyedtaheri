import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  createSessionToken,
  isAuthenticated,
  sessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/auth";
import {
  getRecaptchaSettings,
  verifyRecaptchaToken,
} from "@/lib/recaptcha";

export async function GET() {
  return NextResponse.json({ authenticated: await isAuthenticated() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    password?: string;
    captchaToken?: string;
  };

  const settings = await getRecaptchaSettings();
  const loginProtected = Boolean(
    settings.protectLogin && settings.siteKey && settings.secretKey,
  );

  if (loginProtected) {
    const captcha = await verifyRecaptchaToken(body.captchaToken, "login");
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 403 });
    }
  }

  if (!body.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, createSessionToken(), sessionCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}
