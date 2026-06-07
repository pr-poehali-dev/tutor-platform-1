import Icon from "@/components/ui/icon";
import { useMp4Export } from "@/components/video/useMp4Export";
import { VideoScene } from "@/components/video/VideoStudioPlayer";
import VideoLibraryPublish from "@/components/admin/video-studio/VideoLibraryPublish";

interface Props {
  scenes: VideoScene[];
  title: string;
  topic: string;
  subject: string;
  ageGroup: string;
  style: string;
  voice: string;
  duration: number;
}

const PHASE_LABEL: Record<string, string> = {
  idle: "Готов к экспорту",
  "loading-ffmpeg": "Загружаю движок",
  preparing: "Готовлю кадры",
  audio: "Озвучка",
  encoding: "Кодирую видео",
  finalizing: "Склейка",
  done: "Готово!",
  error: "Ошибка",
};

/** Финальный блок студии: сборка MP4 + публикация ролика в библиотеку. */
export default function VideoStudioFinalize({
  scenes, title, topic, subject, ageGroup, style, voice, duration,
}: Props) {
  const { state, exportMp4, reset } = useMp4Export();
  const hasImages = scenes.some((s) => !!s.image_url);
  const isBusy = ["loading-ffmpeg", "preparing", "audio", "encoding", "finalizing"].includes(state.phase);

  const handleDownload = () => {
    if (!state.resultUrl) return;
    const a = document.createElement("a");
    a.href = state.resultUrl;
    a.download = `${(title || "video").replace(/\s+/g, "-").slice(0, 40)}.mp4`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Экспорт MP4 */}
      <div className="bg-card border border-white/10 rounded-3xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Icon name="Film" size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-montserrat font-black text-white text-sm">Готовый видеофайл</p>
            <p className="text-white/45 text-[10px]">Сборка в браузере · ffmpeg.wasm</p>
          </div>
        </div>

        {!hasImages && (
          <p className="text-amber-200/85 text-xs bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 flex items-start gap-1.5">
            <Icon name="TriangleAlert" size={12} className="text-amber-300 flex-shrink-0 mt-0.5" />
            Сначала сгенерируйте кадры — без картинок MP4 не собрать.
          </p>
        )}

        {state.phase !== "idle" && state.phase !== "done" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/65">{PHASE_LABEL[state.phase] || state.phase}</span>
              <span className="text-white/45 tabular-nums">{Math.round(state.progress * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200"
                style={{ width: `${state.progress * 100}%` }}
              />
            </div>
            <p className="text-white/55 text-[10px]">{state.message}</p>
          </div>
        )}

        {state.phase === "error" && state.error && (
          <p className="text-rose-300 text-xs flex items-start gap-1.5 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
            <Icon name="CircleAlert" size={12} className="text-rose-300 flex-shrink-0 mt-0.5" />
            {state.error}
          </p>
        )}

        {state.phase === "done" && state.resultUrl && (
          <div className="space-y-2">
            <video src={state.resultUrl} controls className="w-full rounded-xl bg-black" />
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold py-2 rounded-xl hover:scale-[1.02] transition-transform"
              >
                <Icon name="Download" size={12} />
                Скачать MP4
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white/75 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              >
                <Icon name="RotateCcw" size={12} />
                Заново
              </button>
            </div>
          </div>
        )}

        {(state.phase === "idle" || state.phase === "error") && (
          <button
            onClick={() => exportMp4({ scenes, voiceId: voice, title })}
            disabled={!hasImages || isBusy}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold py-2.5 rounded-2xl hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            <Icon name="Film" size={14} />
            Собрать MP4 одной кнопкой
          </button>
        )}
      </div>

      {/* Публикация в библиотеку (передаём готовый MP4, если собран) */}
      <VideoLibraryPublish
        title={title}
        topic={topic}
        subject={subject}
        ageGroup={ageGroup}
        style={style}
        voice={voice}
        duration={duration}
        scenes={scenes}
        mp4Url={state.phase === "done" ? state.resultUrl : null}
      />
    </div>
  );
}
