import { useEffect, useState } from "react";
import func2url from "../../../../backend/func2url.json";

const KSUSHA_VIDEO_URL = (func2url as Record<string, string>)["ksusha-video"];

// Кэш на уровне модуля — список готовых роликов грузим один раз на сессию.
let cache: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

async function fetchVideos(): Promise<Record<string, string>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`${KSUSHA_VIDEO_URL}?action=list`);
      const data = await res.json().catch(() => ({}));
      cache = (data && data.videos) || {};
      return cache;
    } catch {
      cache = {};
      return cache;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * Отдаёт карту готовых «говорящих» роликов Ксюши: phrase_key → video_url.
 * Если ролика для фразы нет — аватар показывает красивую картинку с анимацией.
 */
export function useKsushaVideos() {
  const [videos, setVideos] = useState<Record<string, string>>(cache || {});

  useEffect(() => {
    let alive = true;
    fetchVideos().then((v) => {
      if (alive) setVideos(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  return videos;
}
