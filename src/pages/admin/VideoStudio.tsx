import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import func2url from "../../../backend/func2url.json";
import VideoStudioPlayer, { VideoScene } from "@/components/video/VideoStudioPlayer";

const STORYBOARD_URL = (func2url as Record<string, string>)["video-storyboard"];
const RENDER_URL = (func2url as Record<string, string>)["video-render"];

const PROJECTS_KEY = "uchispro_video_projects_v1";

interface Project {
  id: string;
  title: string;
  topic: string;
  style: string;
  duration_sec: number;
  scenes: VideoScene[];
  createdAt: number;
}

const STYLES = [
  { id: "realistic", label: "Реалистичный", emoji: "📷" },
  { id: "cartoon", label: "Мультяшный 3D", emoji: "🎨" },
  { id: "flat", label: "Плоская графика", emoji: "📐" },
  { id: "sketch", label: "Карандашный набросок", emoji: "✏️" },
  { id: "cosmic", label: "Космический", emoji: "🌌" },
];

const VOICES = [
  { id: "nika", label: "Ника (тёплый ж)" },
  { id: "sofia", label: "София (живой ж)" },
  { id: "alex", label: "Алекс (уверенный м)" },
  { id: "dmitry", label: "Дмитрий (спокойный м)" },
  { id: "fox", label: "Лиса (ласковый)" },
];

const DURATIONS = [30, 60, 90, 120, 180];

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch { /* noop */ }
}

export default function VideoStudio() {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60);
  const [style, setStyle] = useState("realistic");
  const [voice, setVoice] = useState("nika");
  const [subject, setSubject] = useState("");
  const [ageGroup, setAgeGroup] = useState("школьник 10-15 лет");

  const [title, setTitle] = useState("");
  const [scenes, setScenes] = useState<VideoScene[]>([]);
  const [phase, setPhase] = useState<"idle" | "storyboard" | "ready" | "rendering">("idle");
  const [error, setError] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState<{ done: number; total: number } | null>(null);

  const [projects, setProjects] = useState<Project[]>(() => loadProjects());

  useEffect(() => { saveProjects(projects); }, [projects]);

  const generateStoryboard = async () => {
    if (!topic.trim()) {
      setError("Введите тему ролика");
      return;
    }
    setError(null);
    setPhase("storyboard");
    setScenes([]);
    try {
      const res = await fetch(STORYBOARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          duration_sec: duration,
          style,
          subject: subject.trim(),
          age_group: ageGroup,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось сгенерировать сценарий");
        setPhase("idle");
        return;
      }
      setTitle(data.title || topic);
      setScenes(data.scenes || []);
      setPhase("ready");
    } catch {
      setError("Нет связи с сервером");
      setPhase("idle");
    }
  };

  const renderImages = async () => {
    if (scenes.length === 0) return;
    setError(null);
    setPhase("rendering");
    setRenderProgress({ done: 0, total: scenes.length });
    try {
      const res = await fetch(RENDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes, title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось сгенерировать картинки");
        setPhase("ready");
        setRenderProgress(null);
        return;
      }
      setScenes(data.scenes || []);
      setPhase("ready");
      setRenderProgress({ done: data.total_rendered || 0, total: scenes.length });
    } catch {
      setError("Нет связи с сервером");
      setPhase("ready");
      setRenderProgress(null);
    }
  };

  const renderOneScene = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    try {
      const res = await fetch(RENDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes, title, scene_ids: [sceneId] }),
      });
      const data = await res.json();
      if (res.ok) setScenes(data.scenes || []);
    } catch { /* noop */ }
  };

  const updateScene = (idx: number, patch: Partial<VideoScene>) => {
    setScenes((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const removeScene = (idx: number) => {
    setScenes((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveProject = () => {
    const p: Project = {
      id: `proj_${Date.now()}`,
      title: title || topic || "Без названия",
      topic,
      style,
      duration_sec: duration,
      scenes,
      createdAt: Date.now(),
    };
    setProjects([p, ...projects].slice(0, 30));
  };

  const loadProject = (p: Project) => {
    setTopic(p.topic);
    setStyle(p.style);
    setDuration(p.duration_sec);
    setTitle(p.title);
    setScenes(p.scenes);
    setPhase("ready");
  };

  const exportJson = () => {
    const data = JSON.stringify({ title, topic, style, duration_sec: duration, scenes }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-${(title || topic).replace(/\s+/g, "-").slice(0, 40)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Видео-студия — УЧИСЬПРО (админ)" description="Генерация образовательных видеороликов с ИИ." noindex />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide">УЧИСЬПРО</span>
          </Link>
          <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">Админ · Видео-студия</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="inline-flex items-center gap-2 bg-rose-500/15 border border-rose-500/35 rounded-full px-4 py-1.5 mb-5">
          <Icon name="Clapperboard" size={14} className="text-rose-300" />
          <span className="text-sm text-rose-200 font-bold uppercase tracking-wider">Видео-студия УЧИСЬПРО</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Создавай видеоролики <span className="gradient-text-purple">с ИИ</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-3xl mb-8">
          Опиши тему — ИИ напишет сценарий, нарисует кадры (FLUX), озвучит голосом. Получается реалистичный ролик 30 сек – 3 мин для любого курса.
        </p>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Левая колонка — превью и редактор */}
          <div className="space-y-4">
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

            {/* Редактор сцен */}
            {scenes.length > 0 && (
              <div className="bg-card border border-white/10 rounded-3xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Раскадровка ({scenes.length} сцен)</p>
                  <div className="flex gap-2">
                    <button onClick={exportJson} className="inline-flex items-center gap-1 text-xs text-white/75 hover:text-white bg-white/8 hover:bg-white/12 border border-white/15 px-2.5 py-1 rounded-lg">
                      <Icon name="Download" size={11} />
                      JSON
                    </button>
                    <button onClick={saveProject} className="inline-flex items-center gap-1 text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-200 px-2.5 py-1 rounded-lg">
                      <Icon name="Save" size={11} />
                      Сохранить
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {scenes.map((s, i) => (
                    <div key={s.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                          {s.image_url ? (
                            <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Icon name="ImageOff" size={16} className="text-white/30" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white/45 text-[10px] uppercase tracking-wider">Сцена {i + 1} · {s.duration_sec}с</p>
                          <textarea
                            value={s.narration}
                            onChange={(e) => updateScene(i, { narration: e.target.value })}
                            rows={2}
                            className="w-full bg-transparent text-white text-xs mt-0.5 resize-none focus:outline-none focus:bg-white/5 rounded p-1"
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            onClick={() => renderOneScene(s.id)}
                            title="Перегенерировать картинку"
                            className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-200"
                          >
                            <Icon name="RefreshCw" size={11} />
                          </button>
                          <button
                            onClick={() => removeScene(i)}
                            title="Удалить сцену"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-200"
                          >
                            <Icon name="Trash2" size={11} />
                          </button>
                        </div>
                      </div>
                      <details className="text-[10px] text-white/45">
                        <summary className="cursor-pointer hover:text-white/70">Промпт для картинки</summary>
                        <textarea
                          value={s.image_prompt}
                          onChange={(e) => updateScene(i, { image_prompt: e.target.value })}
                          rows={2}
                          className="w-full mt-1 bg-background/40 border border-white/10 rounded p-1.5 text-white/75 text-[10px] font-mono resize-none focus:outline-none"
                        />
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка — настройки */}
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
                onClick={generateStoryboard}
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
                  onClick={renderImages}
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

            {/* Сохранённые проекты */}
            {projects.length > 0 && (
              <div className="bg-card border border-white/10 rounded-3xl p-4">
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Мои проекты ({projects.length})</p>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => loadProject(p)}
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
        </div>
      </div>
    </div>
  );
}
