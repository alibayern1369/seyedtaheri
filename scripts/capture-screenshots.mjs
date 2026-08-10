import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");

async function shot(page, name, options = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, ...options });
  console.log("saved", file);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await context.newPage();

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "01-hero-light", { fullPage: false });

  const experience = page.locator("#experience");
  if (await experience.count()) {
    await experience.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await shot(page, "02-experience", { fullPage: false });
  }

  const projects = page.locator("#projects");
  if (await projects.count()) {
    await projects.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await shot(page, "03-projects", { fullPage: false });
  }

  const skills = page.locator("#skills");
  if (await skills.count()) {
    await skills.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await shot(page, "04-skills", { fullPage: false });
  }

  await shot(page, "05-full-page-light", { fullPage: true });

  // Dark mode via next-themes localStorage + reload
  await page.evaluate(() => {
    localStorage.setItem("theme", "dark");
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "06-hero-dark", { fullPage: false });

  const contact = page.locator("#contact");
  if (await contact.count()) {
    await contact.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await shot(page, "07-contact-dark", { fullPage: false });
  }

  // Admin login
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await shot(page, "08-admin-login", { fullPage: false });

  const password = page.locator('input[type="password"]');
  if (await password.count()) {
    await password.fill("admin");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1200);
    await shot(page, "09-admin-editor", { fullPage: false });
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
