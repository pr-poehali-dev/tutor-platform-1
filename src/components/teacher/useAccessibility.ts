import { useState, useEffect } from "react";

export interface AccessibilitySettings {
  autoSpeak: boolean; // озвучивать ответы автоматически
  speed: number; // скорость голоса 0.7–1.3
  bigText: boolean; // крупный текст для пожилых/малышей
}

const KEY = "uchispro_a11y";

const DEFAULTS: AccessibilitySettings = {
  autoSpeak: true,
  speed: 1.0,
  bigText: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return DEFAULTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const update = (patch: Partial<AccessibilitySettings>) =>
    setSettings(prev => ({ ...prev, ...patch }));

  return { settings, update };
}
