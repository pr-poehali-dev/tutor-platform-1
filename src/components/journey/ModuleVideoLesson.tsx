import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import VideoStudioPlayer, { VideoScene } from "@/components/video/VideoStudioPlayer";

const MODULE_VIDEO_URL = (func2url as Record<string, string>)["module-video"];
const RENDER_URL = (func2url as Record<string, string>)["video-render"];
const FEEDBACK_URL = (func2url as Record<string, string>)["ai-evolve"];

interface Props {
  subject: string;
  topic: string;
  grade: string;
  moduleId?: string | number;
  lessonId?: string;
  durationSec?: number;
  voiceId?: string;
  /** Цвет акцента предмета */
  accent?: string;
}

type Phase = "idle" | "storyboard" | "rendering" | "ready" | "error";

interface VideoState {
  videoId?: number;
  title: string;
  scenes: VideoScene[];
  phase: Phase;
  rendered: number;
  total: number;
  error?: string;
}

/** Видео-урок внутри модуля программы.
 *  Генерирует storyboard через `module-video`, картинки через `video-render`,
 *  играет в плеере с TTS-озвучкой, собирает обратную связь. */
export default function ModuleVideoLesson({ subject, topic, grade, moduleId, lessonId, durationSec = 60, voiceId = "nika", accent = "#8b5cf6" }: Props) {
  const [state, setState] = useState<VideoState>({ title: topic, scenes: [], phase: "idle", rendered: 0, total: 0 });
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const startedRef = useRef(false);

  const createStoryboard = async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setState((s) => ({ ...s, phase: "storyboard", error: undefined }));
    try {
      const res = await fetch(`${MODULE_VIDEO_URL}?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          grade,
          module_id: String(moduleId || ""),
          lesson_id: lessonId || "",
          duration_sec: durationSec,
          voice_id: voiceId,
          style: "realistic",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.storyboard) {
        setState((s) => ({ ...s, phase: "error", error: data.error || "Не получилось создать сценарий" }));
        return;
      }
      const sb = data.storyboard;
      const initialScenes: VideoScene[] = sb.scenes || [];
      setState({
        videoId: data.video_id,
        title: sb.title || topic,
        scenes: initialScenes,
        phase: data.scenes_rendered === initialScenes.length && initialScenes.length > 0 ? "ready" : "rendering",
        rendered: data.scenes_rendered || 0,
        total: initialScenes.length,
      });

      // Если кэшированное видео уже полностью отрендерено — не запускаем рендер заново
      if (data.cached && data.scenes_rendered === initialScenes.length && initialScenes.every((s: VideoScene) => s.image_url)) {
        return;
      }
      renderAllImages(data.video_id, initialScenes);
    } catch (e) {
      setState((s) => ({ ...s, phase: "error", error: e instanceof Error ? e.message : "network error" }));
    }
  };

  const renderAllImages = async (videoId: number, scenes: VideoScene[]) => {
    const POOL = 3;
    const queue = scenes.map((s, i) => ({ scene: s, idx: i })).filter((t) => !t.scene.image_url);
    let done = scenes.filter((s) => !!s.image_url).length;
    const updated: VideoScene[] = [...scenes];

    const worker = async () => {
      while (queue.length > 0) {
        const task = queue.shift();
        if (!task) break;
        try {
          const res = await fetch(RENDER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: task.scene.image_prompt,
              scene_id: task.scene.id,
              title: state.title || topic,
            }),
          });
          const data = await res.json();
          if (res.ok && data.image_url) {
            updated[task.idx] = { ...updated[task.idx], image_url: data.image_url };
          } else {
            updated[task.idx] = { ...updated[task.idx], error: data.error || "render failed" };
          }
        } catch {
          updated[task.idx] = { ...updated[task.idx], error: "network error" };
        }
        done += 1;
        setState((s) => ({ ...s, scenes: [...updated], rendered: done }));
      }
    };

    await Promise.all(Array.from({ length: POOL }, () => worker()));

    // Сохраняем результат в БД
    try {
      await fetch(`${MODULE_VIDEO_URL}?action=update_scenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, scenes: updated }),
      });
    } catch { /* noop */ }

    setState((s) => ({ ...s, scenes: updated, phase: "ready", rendered: done }));
  };

  const sendFeedback = async (helpful: boolean, ratingValue: number) => {
    setFeedbackSent(true);
    setRating(ratingValue);
    try {
      await fetch(`${FEEDBACK_URL}?action=feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_key: "video_director",
          content_type: "video_lesson",
          content_id: state.videoId ? String(state.videoId) : "",
          rating: ratingValue,
          is_helpful: helpful,
          subject,
          grade,
          topic,
        }),
      });
    } catch { /* noop */ }
  };

  useEffect(() => {
    if (state.phase === "idle") createStoryboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.phase === "storyboard") {
    return (
      <div className="aspect-video bg-card/60 border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3">
        <Icon name="Loader2" size={28} className="animate-spin" style={{ color: accent }} />
        <p className="text-white/75 text-sm font-semibold">ИИ-режиссёр пишет сценарий урока...</p>
        <p className="text-white/45 text-xs">Это занимает ~10 секунд</p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-rose-200">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="AlertCircle" size={14} />
          <p className="font-semibold">Не получилось создать видео</p>
        </div>
        <p className="text-xs text-rose-200/85 mb-3">{state.error}</p>
        <button
          onClick={() => {
            startedRef.current = false;
            setState({ title: topic, scenes: [], phase: "idle", rendered: 0, total: 0 });
            createStoryboard();
          }}
          className="text-xs bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-white px-3 py-1.5 rounded-lg"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {state.phase === "rendering" && state.total > 0 && (
        <div className="bg-card/60 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <Icon name="Loader2" size={16} className="animate-spin flex-shrink-0" style={{ color: accent }} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold">FLUX рисует кадры урока</p>
            <div className="h-1 bg-white/8 rounded-full overflow-hidden mt-1.5">
              <div className="h-full transition-all duration-300" style={{ width: `${(state.rendered / state.total) * 100}%`, background: accent }} />
            </div>
          </div>
          <span className="text-white/55 text-xs tabular-nums flex-shrink-0">{state.rendered}/{state.total}</span>
        </div>
      )}

      {state.scenes.length > 0 && state.scenes.some((s) => !!s.image_url) && (
        <VideoStudioPlayer scenes={state.scenes} title={state.title} voiceId={voiceId} />
      )}

      {state.phase === "ready" && (
        <div className="bg-card/60 border border-white/10 rounded-2xl p-4">
          {!feedbackSent ? (
            <>
              <p className="text-white text-sm font-bold mb-2">Помогло разобраться?</p>
              <p className="text-white/55 text-xs mb-3">Твой отзыв помогает ИИ-режиссёру становиться лучше для следующих учеников.</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => sendFeedback(n >= 4, n)}
                      onMouseEnter={() => setRating(n)}
                      onMouseLeave={() => setRating(null)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <Icon name="Star" size={16} className={`transition-colors ${rating !== null && n <= rating ? "text-amber-300 fill-amber-300" : "text-white/40"}`} />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => sendFeedback(false, 2)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/65 px-3 py-2 rounded-xl"
                >
                  Запутался
                </button>
                <button
                  onClick={() => sendFeedback(true, 5)}
                  className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 px-3 py-2 rounded-xl"
                >
                  Огонь!
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-emerald-200 text-sm">
              <Icon name="CheckCircle2" size={16} />
              <span>Спасибо! ИИ запомнит и станет лучше.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
