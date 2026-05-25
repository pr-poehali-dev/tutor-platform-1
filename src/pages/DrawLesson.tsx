import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import DrawCanvas, { DrawCanvasRef } from "@/components/draw/DrawCanvas";
import DrawToolbar from "@/components/draw/DrawToolbar";
import DrawMasterClass from "@/components/draw/DrawMasterClass";
import { getLesson } from "@/components/draw/drawData";
import { getTemplate } from "@/components/draw/drawTemplates";
import { useDrawGallery } from "@/components/draw/useDrawGallery";

const SITE_URL = "https://учисьпро.рф";

export default function DrawLesson() {
  const { id = "" } = useParams();
  const lesson = getLesson(id);
  const canvasRef = useRef<DrawCanvasRef>(null);
  const [color, setColor] = useState("#1a1a1a");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<"pencil" | "brush" | "marker" | "eraser">("pencil");
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  // Образец «делай как я» — для beginner-уроков всегда виден,
  // на остальных можно включать/выключать. Пользователь решает.
  const [templateVisible, setTemplateVisible] = useState(true);
  // Счётчик повторов анимации «как рисовать» — увеличивается по кнопке «Показать ещё раз»
  const [animReplayCount, setAnimReplayCount] = useState(0);
  const { add: addToGallery } = useDrawGallery();

  const isBeginner = lesson?.level === "beginner";

  // На каждом новом шаге автовключаем образец для beginner и перезапускаем анимацию
  useEffect(() => {
    if (isBeginner) setTemplateVisible(true);
    setAnimReplayCount(0); // при смене шага — анимация заново
     
  }, [currentStep, isBeginner]);

  if (!lesson) return <Navigate to="/draw" replace />;

  const currentTemplate = getTemplate(lesson.id, currentStep);

  const handleSave = () => {
    const dataUrl = canvasRef.current?.exportPng();
    if (!dataUrl) return;
    addToGallery({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      emoji: lesson.emoji,
      dataUrl,
    });
    setSavedCount((n) => n + 1);
  };

  const handleDownload = () => {
    const dataUrl = canvasRef.current?.exportPng();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `risovashka-${lesson.id}-${Date.now()}.png`;
    a.click();
  };

  const handleFinish = () => {
    handleSave();
    setFinished(true);
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`Как нарисовать: ${lesson.title} — Рисовашка УЧИСЬПРО`}
        description={lesson.description}
        canonical={`${SITE_URL}/draw/${lesson.id}`}
        keywords={`как нарисовать ${lesson.title.toLowerCase()}, ${lesson.skills.join(", ")}, поэтапное рисование`}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[
              { label: "Главная", href: "/" },
              { label: "Рисовашка", href: "/draw" },
              { label: lesson.title },
            ]} />
          </div>
          <Link to="/draw" className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Icon name="ArrowLeft" size={14} />
            К урокам
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-6 pb-12">
        <Link to="/draw" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-4 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          Все уроки рисования
        </Link>

        {/* Шапка урока */}
        <div className="bg-card border border-white/10 rounded-3xl p-5 mb-6 flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-4xl flex-shrink-0`}>
            {lesson.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/45 text-[11px] uppercase tracking-wider font-bold mb-1">{lesson.ageRange} · {lesson.durationMin} мин</p>
            <h1 className="font-montserrat font-black text-white text-xl md:text-2xl leading-tight">{lesson.title}</h1>
            <p className="text-white/55 text-xs mt-1 hidden sm:block">{lesson.description}</p>
          </div>
          {savedCount > 0 && (
            <div className="hidden sm:flex flex-col items-center bg-emerald-500/15 border border-emerald-500/35 rounded-2xl px-3 py-2">
              <p className="text-emerald-200 text-[10px] uppercase tracking-wider">Сохранено</p>
              <p className="font-montserrat font-black text-white text-lg">{savedCount}</p>
            </div>
          )}
        </div>

        {/* Главная композиция: холст + инструменты + мастер-класс */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          {/* Левая колонка — холст */}
          <div className="space-y-4">
            <DrawCanvas
              ref={canvasRef}
              color={color}
              size={size}
              tool={tool}
              template={currentTemplate}
              templateVisible={templateVisible}
              templateAnimKey={`${currentStep}-${animReplayCount}`}
              onChange={() => { /* можно потом отметить «не пустой» */ }}
            />

            {/* Переключатель образца — над холстом, чтобы был всегда виден */}
            {currentTemplate && (
              <div className="flex items-center justify-between gap-3 bg-card border border-white/10 rounded-2xl p-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${templateVisible ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-white/8 text-white/55 border border-white/15"}`}>
                    <Icon name="LayoutTemplate" size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold">Образец «делай как я»</p>
                    <p className="text-white/45 text-[10px] leading-tight mt-0.5">
                      {isBeginner
                        ? "На первых уроках обводи пунктир — это поможет."
                        : "Можно показать или скрыть подсказку."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      setTemplateVisible(true);
                      setAnimReplayCount((n) => n + 1);
                    }}
                    title="Показать как рисовать ещё раз"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:scale-[1.04] transition-transform"
                  >
                    <Icon name="Play" size={12} />
                    Показать как
                  </button>
                  <button
                    onClick={() => setTemplateVisible((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      templateVisible
                        ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
                        : "bg-white/8 border border-white/15 text-white/75 hover:bg-white/12"
                    }`}
                  >
                    <Icon name={templateVisible ? "Eye" : "EyeOff"} size={12} />
                    {templateVisible ? "Виден" : "Скрыт"}
                  </button>
                </div>
              </div>
            )}
            {/* Под холстом — мобильный toolbar и действия */}
            <div className="lg:hidden">
              <DrawToolbar
                color={color}
                size={size}
                tool={tool}
                onColor={setColor}
                onSize={setSize}
                onTool={setTool}
                onUndo={() => canvasRef.current?.undo()}
                onClear={() => canvasRef.current?.clear()}
                onSave={handleSave}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm font-bold py-3 rounded-2xl hover:scale-[1.01] transition-transform"
              >
                <Icon name="Save" size={14} />
                Сохранить в галерею
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-3 rounded-2xl transition-colors"
              >
                <Icon name="Download" size={14} />
                Скачать PNG
              </button>
            </div>
          </div>

          {/* Правая колонка — мастер-класс и инструменты (desktop) */}
          <div className="space-y-4">
            <DrawMasterClass
              lesson={lesson}
              currentStep={currentStep}
              onPickColor={setColor}
              onPickSize={setSize}
              onPickTool={setTool}
              onPrevStep={() => setCurrentStep((s) => Math.max(0, s - 1))}
              onNextStep={() => setCurrentStep((s) => Math.min(lesson.steps.length - 1, s + 1))}
              onFinish={handleFinish}
            />
            <div className="hidden lg:block">
              <DrawToolbar
                color={color}
                size={size}
                tool={tool}
                onColor={setColor}
                onSize={setSize}
                onTool={setTool}
                onUndo={() => canvasRef.current?.undo()}
                onClear={() => canvasRef.current?.clear()}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>

        {/* Финиш */}
        {finished && (
          <div className="mt-6 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/35 rounded-3xl p-6 text-center animate-fadeIn">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="font-montserrat font-black text-white text-xl mb-2">Ура! Урок пройден</h2>
            <p className="text-white/70 text-sm mb-4">Твой рисунок сохранён в галерее. Покажи родителям!</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/draw"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold px-5 py-3 rounded-2xl"
              >
                <Icon name="Sparkles" size={14} />
                Новый урок
              </Link>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors"
              >
                <Icon name="Download" size={14} />
                Скачать
              </button>
              <button
                onClick={() => {
                  setFinished(false);
                  setCurrentStep(0);
                  canvasRef.current?.clear();
                }}
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors"
              >
                <Icon name="RotateCcw" size={14} />
                Рисовать ещё раз
              </button>
            </div>
          </div>
        )}

        {/* Что развили */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
              <Icon name="Target" size={11} />
              Что развиваем
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lesson.skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs font-medium px-2.5 py-1 rounded-full">
                  <Icon name="Check" size={10} />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5">
            <p className="text-amber-200 text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
              <Icon name="Lightbulb" size={11} />
              Главный приём
            </p>
            <p className="text-white/85 text-sm leading-relaxed">{lesson.keyTechnique}</p>
            {lesson.inspiration && (
              <p className="text-white/45 text-xs mt-2 italic">💡 {lesson.inspiration}</p>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}