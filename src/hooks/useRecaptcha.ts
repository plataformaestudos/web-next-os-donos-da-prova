"use client";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

// Função para carregar o script do reCAPTCHA apenas quando necessário
async function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
    if (existingScript) {
      const checkLoaded = () => {
        if (window.grecaptcha) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      const style = document.createElement("style");
      style.textContent = `
        .grecaptcha-badge {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error("Erro ao carregar reCAPTCHA"));
    };
    
    document.head.appendChild(script);
  });
}

export async function executeRecaptcha(action: string = "submit"): Promise<string> {
  // Carregar o script apenas quando necessário
  await loadRecaptchaScript();
  
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error("reCAPTCHA não carregado"));
      return;
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action })
        .then((token) => {
          resolve(token);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
}