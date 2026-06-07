import { useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../../backend/func2url.json";
import { VideoScene } from "@/components/video/VideoStudioPlayer";

const LIBRARY_URL = (func2url as Record<string, string>)["video-library"];
const TOKEN_KEY = "uchispro_auth_token_v1";

interface Props {
  title: string;
  topic: string;
  subject: string;
  ageGroup: string;
  style: string;
  voice: string;
  duration: number;
  scenes: VideoScene[];
  /** blob URL готового MP4 (если уже собран в экспорт-панели). */
  mp4Url?: string | null;
}

function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

async function blobUrlToBase64(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Публикация готового ролика в библиотеку: раскадровка + (опционально) MP4 в хранилище. */
export default function VideoLibraryPublish({
  title, topic, subject, ageGroup, style, voice, duration, scenes, mp4Url,
}: Props) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [includeMp4, setIncludeMp4] = useState(true);

  const hasScenes = scenes.length > 0;
  const cover = scenes.find((s) => s.image_url)?.image_url || null;

  const publish = async (asStatus: "draft" | "published") => {
    if (!hasScenes) {
      setStatus("error");
      setMessage("Сначала создайте сценарий и кадры.");
      return;
    }
    const token = getToken();
    if (!token) {
      setStatus("error");
      setMessage("Нужен вход в аккаунт, чтобы публиковать.");
      return;
    }
    setStatus("saving");
    setMessage(includeMp4 && mp4Url ? "Загружаю видео в хранилище…" : "Сохраняю ролик…");

    let videoBase64: string | null = null;
    if (includeMp4 && mp4Url) {
      videoBase64 = await blobUrlToBase64(mp4Url);
    }

    try {
      const res = await fetch(`${LIBRARY_URL}?action=save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify({
          action: "save",
          title,
          topic,
          subject,
          age_group: ageGroup,
          style,
          voice_id: voice,
          duration_sec: duration,
          scenes_count: scenes.length,
          cover_url: cover,
          video_base64: videoBase64,
          status: asStatus,
          storyboard: scenes.map((s) => ({
            id: s.id,
            narration: s.narration,
            image_url: s.image_url || null,
            duration_sec: s.duration_sec,
            transition: s.transition || "fade",
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Не удалось сохранить ролик.");
        return;
      }
      setStatus("done");
      setMessage(
        asStatus === "published"
          ? "Ролик опубликован в библиотеке!"
          : "Ролик сохранён как черновик."
      );
    } catch {
      setStatus("error");
      setMessage("Нет связи с сервером.");
    }
  };

  return (
    <div className="bg-card border border-white/10 rounded-3xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Icon name="Library" size={16} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-montserrat font-black text-white text-sm">Библиотека роликов</p>
          <p className="text-white/45 text-[10px]">Сохраните готовый ролик для курсов</p>
        </div>
      </div>

      {mp4Url && (
        <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeMp4}
            onChange={(e) => setIncludeMp4(e.target.checked)}
            className="accent-amber-500 w-4 h-4"
          />
          Приложить собранный MP4-файл
        </label>
      )}

      {status !== "idle" && (
        <p
          className={`text-xs flex items-start gap-1.5 rounded-xl p-2.5 border ${
            status === "error"
              ? "text-rose-300 bg-rose-500/10 border-rose-500/30"
              : status === "done"
              ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
              : "text-white/70 bg-white/5 border-white/10"
          }`}
        >
          <Icon
            name={status === "error" ? "AlertCircle" : status === "done" ? "CircleCheck" : "Loader2"}
            size={12}
            className={`flex-shrink-0 mt-0.5 ${status === "saving" ? "animate-spin" : ""}`}
          />
          {message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => publish("published")}
          disabled={!hasScenes || status === "saving"}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold py-2.5 rounded-2xl hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          <Icon name="Upload" size={13} />
          Опубликовать
        </button>
        <button
          onClick={() => publish("draft")}
          disabled={!hasScenes || status === "saving"}
          className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white/75 text-xs font-semibold px-3 py-2.5 rounded-2xl transition-colors disabled:opacity-50"
        >
          <Icon name="Save" size={13} />
          В черновик
        </button>
      </div>
    </div>
  );
}
