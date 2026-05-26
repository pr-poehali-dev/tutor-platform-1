import Icon from "@/components/ui/icon";
import Mp4ExportPanel from "@/components/video/Mp4ExportPanel";
import { VideoScene } from "@/components/video/VideoStudioPlayer";
import { Project, STYLES, VOICES, DURATIONS } from "./types";

interface Props {
  topic: string;
  setTopic: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  ageGroup: string;
  setAgeGroup: (v: string) => void;
  duration: number;
  setDuration: (v: number) => void;
  style: string;
  setStyle: (v: string) => void;
  voice: string;
  setVoice: (v: string) => void;
  error: string | null;
  phase: "idle" | "storyboard" | "ready" | "rendering";
  scenes: VideoScene[];
  title: string;
  projects: Project[];
  onGenerateStoryboard: () => void;
  onRenderImages: () => void;
  onLoadProject: (p: Project) => void;
}

export default function VideoStudioSidebar({
  topic,
  setTopic,
  subject,
  setSubject,
  ageGroup,
  setAgeGroup,
  duration,
  setDuration,
  style,
  setStyle,
  voice,
  setVoice,
  error,
  phase,
  scenes,
  title,
  projects,
  onGenerateStoryboard,
  onRenderImages,
  onLoadProject,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-white/10 rounded-3xl p-5 space-y-4">
        <p className="font-montserrat font-black text-white text-sm">Параметры ролика</p>

        <div>
          <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">Тема ролика</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Например: Как работает фотосинтез у растений"
            rows={3}
            className="w-full bg-white/5 border border-white/12 rounded-2xl px-3 py-2.5 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-pink-500/50 resize-none"
          />
        </div>

        <div>
          <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">Предмет (необязательно)</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Биология, физика, история..."
            className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-pink-500/50"
          />
        </div>

        <div>
          <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">Аудитория</label>
          <input
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500/50"
          />
        </div>

        <div>
          <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">Длительность (сек)</label>
          <div className="flex gap-1">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  duration === d
                    ? "bg-pink-500/25 border border-pink-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">Визуальный стиль</label>
          <div className="grid grid-cols-2 gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`flex items-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all ${
                  style === s.id
                    ? "bg-pink-500/25 border border-pink-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10"
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1.5 block">Голос диктора</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500/50"
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id} className="bg-background">{v.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-rose-300 text-xs flex items-center gap-1.5">
            <Icon name="AlertCircle" size={12} />
            {error}
          </p>
        )}

        <button
          onClick={onGenerateStoryboard}
          disabled={phase === "storyboard" || phase === "rendering" || !topic.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold py-3 rounded-2xl hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {phase === "storyboard" ? (
            <>
              <Icon name="Loader2" size={14} className="animate-spin" />
              Пишу сценарий...
            </>
          ) : (
            <>
              <Icon name="Wand2" size={14} />
              1. Создать сценарий
            </>
          )}
        </button>

        {scenes.length > 0 && (
          <button
            onClick={onRenderImages}
            disabled={phase === "rendering"}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold py-3 rounded-2xl hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {phase === "rendering" ? (
              <>
                <Icon name="Loader2" size={14} className="animate-spin" />
                FLUX рисует...
              </>
            ) : (
              <>
                <Icon name="ImagePlus" size={14} />
                2. Сгенерировать кадры FLUX
              </>
            )}
          </button>
        )}
      </div>

      {/* Экспорт MP4 — появляется когда есть сцены */}
      {scenes.length > 0 && (
        <Mp4ExportPanel scenes={scenes} title={title || topic} voiceId={voice} />
      )}

      {/* Сохранённые проекты */}
      {projects.length > 0 && (
        <div className="bg-card border border-white/10 rounded-3xl p-4">
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Мои проекты ({projects.length})</p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => onLoadProject(p)}
                className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2.5 transition-colors"
              >
                <p className="text-white text-xs font-bold truncate">{p.title}</p>
                <p className="text-white/45 text-[10px]">{p.scenes.length} сцен · {p.duration_sec}с · {new Date(p.createdAt).toLocaleDateString("ru-RU")}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Инструкция */}
      <div className="bg-cyan-500/8 border border-cyan-500/30 rounded-2xl p-4 text-xs text-white/75 space-y-1.5">
        <p className="font-bold text-cyan-200">Как это работает:</p>
        <p>1. ИИ-режиссёр (gpt-4o-mini) пишет сценарий из 4-15 сцен.</p>
        <p>2. FLUX генерирует кадр для каждой сцены (16:9).</p>
        <p>3. Картинки оживают через Ken Burns (зум/пан).</p>
        <p>4. TTS озвучивает текст диктора выбранным голосом.</p>
        <p>5. Всё склеивается в плеере — никаких сторонних подписок.</p>
      </div>
    </div>
  );
}
