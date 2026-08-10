export type GrecaptchaClient = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaClient;
  }
}

export function loadRecaptchaScript(siteKey: string): Promise<GrecaptchaClient> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("reCAPTCHA is browser-only"));
  }

  if (window.grecaptcha) {
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => resolve(window.grecaptcha!));
    });
  }

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-recaptcha-v3="true"]',
  );

  return new Promise((resolve, reject) => {
    const onReady = () => {
      if (!window.grecaptcha) {
        reject(new Error("reCAPTCHA failed to load"));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha!));
    };

    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("reCAPTCHA failed to load")),
        { once: true },
      );
      if (window.grecaptcha) onReady();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptchaV3 = "true";
    script.onload = onReady;
    script.onerror = () => reject(new Error("reCAPTCHA failed to load"));
    document.head.appendChild(script);
  });
}

export async function executeRecaptcha(
  siteKey: string,
  action: string,
): Promise<string> {
  const grecaptcha = await loadRecaptchaScript(siteKey);
  return grecaptcha.execute(siteKey, { action });
}
