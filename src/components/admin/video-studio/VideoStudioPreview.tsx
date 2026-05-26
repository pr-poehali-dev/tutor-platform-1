import Icon from "@/components/ui/icon";
import VideoStudioPlayer, { VideoScene } from "@/components/video/VideoStudioPlayer";

interface Props {
  scenes: VideoScene[];
  phase: "idle" | "storyboard" | "ready" | "rendering";
  title: string;
  voice: string;
  renderProgress: { done: number; total: number } | null;
}

export default function VideoStudioPreview({ scenes, phase, title, voice, renderProgress }: Props) {
  return (
    <>
      {scenes.length > 0 && phase === "ready" && (
        <VideoStudioPlayer scenes={scenes} title={title} voiceId={voice} />
      )}

      {phase === "idle" && (
        <div className="aspect-video bg-card border border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/45 gap-3">
          <Icon name="Film" size={48} />
          <p className="text-sm">Заполни форму справа и нажми «Создать сценарий»</p>
        </div>
      )}

      {phase === "storyboard" && (
        <div className="aspect-video bg-card border border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/65 gap-3">
          <Icon name="Loader2" size={32} className="animate-spin text-pink-300" />
          <p className="text-sm">ИИ-режиссёр пишет сценарий...</p>
        </div>
      )}

      {phase === "rendering" && (
        <div className="aspect-video bg-card border border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/65 gap-3">
          <Icon name="Loader2" size={32} className="animate-spin text-pink-300" />
          <p className="text-sm font-bold">FLUX рисует кадры...</p>
          {renderProgress && (
            <p className="text-xs text-white/45">{renderProgress.done} / {renderProgress.total}</p>
          )}
          <p className="text-xs text-white/35 max-w-md text-center">Это занимает 30-90 секунд: каждый кадр генерируется отдельно.</p>
        </div>
      )}
    </>
  );
}
