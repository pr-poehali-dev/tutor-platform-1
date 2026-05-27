import { useEffect, useRef, useState } from "react";
import { kidsApi, ScreenTimeState } from "./kidsApi";

const DEFAULT_STATE: ScreenTimeState = {
  minutesUsed: 0,
  dailyLimit: 15,
  remaining: 15,
  limitReached: false,
  bedtimeActive: false,
  blocked: false,
  reason: null,
};

/** Хук учёта экранного времени.
 *  - Подтягивает текущее состояние с сервера каждые 60 сек
 *  - Heartbeat: пишет +1 минуту на сервер каждые 60 сек активности
 *  - Возвращает блокировку при лимите или режиме «перед сном»
 */
export function useScreenTime(active = true) {
  const [state, setState] = useState<ScreenTimeState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const lastBeatRef = useRef<number>(Date.now());

  // Стартовая загрузка
  useEffect(() => {
    kidsApi.getScreenTime()
      .then((s) => setState(s))
      .catch(() => { /* offline ok */ })
      .finally(() => setLoaded(true));
  }, []);

  // Heartbeat: каждые 60 секунд + при возврате на вкладку
  useEffect(() => {
    if (!active || !loaded) return;
    const tick = async () => {
      const now = Date.now();
      const seconds = Math.round((now - lastBeatRef.current) / 1000);
      lastBeatRef.current = now;
      if (seconds < 30) return; // защита от частых тиков
      const minutes = Math.max(1, Math.round(seconds / 60));
      try {
        const updated = await kidsApi.addScreenTime(minutes);
        setState(updated);
      } catch { /* offline ok */ }
    };
    const id = setInterval(tick, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        lastBeatRef.current = Date.now();
        kidsApi.getScreenTime().then(setState).catch(() => { /* noop */ });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, loaded]);

  return { state, loaded, refresh: () => kidsApi.getScreenTime().then(setState).catch(() => null) };
}
