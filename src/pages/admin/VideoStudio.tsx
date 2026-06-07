import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import func2url from "../../../backend/func2url.json";
import { VideoScene } from "@/components/video/VideoStudioPlayer";
import VideoStudioPreview from "@/components/admin/video-studio/VideoStudioPreview";
import VideoStudioSceneEditor from "@/components/admin/video-studio/VideoStudioSceneEditor";
import VideoStudioSidebar from "@/components/admin/video-studio/VideoStudioSidebar";
import VideoStudioFinalize from "@/components/admin/video-studio/VideoStudioFinalize";
import { Project, loadProjects, saveProjects } from "@/components/admin/video-studio/types";
import { LESSON_TEMPLATES, LessonTemplate } from "@/components/admin/video-studio/templates";

const STORYBOARD_URL = (func2url as Record<string, string>)["video-storyboard"];
const RENDER_URL = (func2url as Record<string, string>)["video-render"];

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

  /** Рендерим картинку для ОДНОЙ сцены — отдельный вызов бэка. */
  const renderSingleScene = async (scene: VideoScene): Promise<{ url: string | null; error?: string }> => {
    try {
      const res = await fetch(RENDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scene.image_prompt,
          scene_id: scene.id,
          title: title || topic,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.image_url) {
        return { url: null, error: data.error || `HTTP ${res.status}` };
      }
      return { url: data.image_url };
    } catch (e) {
      return { url: null, error: e instanceof Error ? e.message : "network error" };
    }
  };

  const renderImages = async () => {
    if (scenes.length === 0) return;
    setError(null);
    setPhase("rendering");
    setRenderProgress({ done: 0, total: scenes.length });

    // Параллельный пул из 3 одновременных запросов — чтобы не положить Pollinations
    const POOL_SIZE = 3;
    const queue = [...scenes.map((s, i) => ({ scene: s, idx: i }))];
    const errors: string[] = [];
    let done = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const task = queue.shift();
        if (!task) break;
        const result = await renderSingleScene(task.scene);
        if (result.url) {
          setScenes((prev) => prev.map((s, i) => (i === task.idx ? { ...s, image_url: result.url! } : s)));
        } else {
          errors.push(`Сцена ${task.idx + 1}: ${result.error}`);
          setScenes((prev) => prev.map((s, i) => (i === task.idx ? { ...s, image_url: null, error: result.error } : s)));
        }
        done += 1;
        setRenderProgress({ done, total: scenes.length });
      }
    };

    await Promise.all(Array.from({ length: POOL_SIZE }, () => worker()));

    setPhase("ready");
    if (errors.length > 0) {
      setError(`Не все картинки сгенерированы (${errors.length} из ${scenes.length}). Попробуйте «🔄» на проблемных сценах. ${errors[0]}`);
    }
  };

  const renderOneScene = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const result = await renderSingleScene(scene);
    if (result.url) {
      setScenes((prev) => prev.map((s) => (s.id === sceneId ? { ...s, image_url: result.url!, error: undefined } : s)));
    } else if (result.error) {
      setError(`Сцена ${sceneId}: ${result.error}`);
    }
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

  const applyTemplate = (t: LessonTemplate) => {
    setDuration(t.duration);
    setStyle(t.style);
    setVoice(t.voice);
    setAgeGroup(t.ageGroup);
    setTopic((prev) => (prev.trim() ? prev : t.topicHint));
    setError(null);
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
        <p className="text-white/65 text-base md:text-lg max-w-3xl mb-6">
          Опиши тему — ИИ напишет сценарий, нарисует кадры (FLUX), озвучит голосом. Получается реалистичный ролик 30 сек – 3 мин для любого курса.
        </p>

        {/* Шаблоны — быстрый старт */}
        <div className="mb-8">
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Быстрый старт по шаблону</p>
          <div className="flex flex-wrap gap-2">
            {LESSON_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                title={t.description}
                className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-white/80 text-xs font-medium px-3 py-2 rounded-xl transition-all"
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Левая колонка — превью и редактор */}
          <div className="space-y-4">
            <VideoStudioPreview
              scenes={scenes}
              phase={phase}
              title={title}
              voice={voice}
              renderProgress={renderProgress}
            />

            <VideoStudioSceneEditor
              scenes={scenes}
              onExportJson={exportJson}
              onSaveProject={saveProject}
              onUpdateScene={updateScene}
              onRenderOneScene={renderOneScene}
              onRemoveScene={removeScene}
            />

            {scenes.length > 0 && phase === "ready" && (
              <VideoStudioFinalize
                scenes={scenes}
                title={title || topic}
                topic={topic}
                subject={subject}
                ageGroup={ageGroup}
                style={style}
                voice={voice}
                duration={duration}
              />
            )}
          </div>

          {/* Правая колонка — настройки */}
          <VideoStudioSidebar
            topic={topic}
            setTopic={setTopic}
            subject={subject}
            setSubject={setSubject}
            ageGroup={ageGroup}
            setAgeGroup={setAgeGroup}
            duration={duration}
            setDuration={setDuration}
            style={style}
            setStyle={setStyle}
            voice={voice}
            setVoice={setVoice}
            error={error}
            phase={phase}
            scenes={scenes}
            title={title}
            projects={projects}
            onGenerateStoryboard={generateStoryboard}
            onRenderImages={renderImages}
            onLoadProject={loadProject}
          />
        </div>
      </div>
    </div>
  );
}