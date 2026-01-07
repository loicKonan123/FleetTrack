'use client';

import { useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';

interface CaptchaProps {
  onExecute?: (token: string) => void;
  action?: string;
}

export interface CaptchaHandle {
  execute: () => Promise<string>;
  reset: () => void;
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfTcjksAAAAAHdR0T9gqg3_i3XH7rLMmvJZkJhl';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(({ onExecute, action = 'LOGIN' }, ref) => {
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // Load reCAPTCHA Enterprise script if not already loaded
    if (!document.querySelector('script[src*="recaptcha/enterprise.js"]')) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        isLoadedRef.current = true;
      };
      document.head.appendChild(script);
    } else {
      isLoadedRef.current = true;
    }
  }, []);

  const execute = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha?.enterprise) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
          onExecute?.(token);
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
  }, [action, onExecute]);

  const reset = useCallback(() => {
    // reCAPTCHA Enterprise doesn't need reset - tokens are generated fresh each time
  }, []);

  useImperativeHandle(ref, () => ({
    execute,
    reset,
  }));

  // reCAPTCHA Enterprise is invisible - no UI to render
  // The badge will appear automatically in the corner
  return null;
});

Captcha.displayName = 'Captcha';

export default Captcha;
