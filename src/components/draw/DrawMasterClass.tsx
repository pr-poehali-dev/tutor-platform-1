import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import { DrawLesson } from "@/components/draw/drawData";

const TTS_URL = (func2url as Record<string, string>)["tts"];

interface Props {
  lesson: DrawLesson;
  currentStep: number;
  onPickColor?: (color: string) => void;
  onPickSize?: (size: number) => void;
  onPickTool?: (tool: "pencil" | "brush" | "marker" | "eraser") => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onFinish: () => void;
}

/** Виджет ИИ-наставника: показывает шаг, озвучивает голосом, рекомендует кисть/цвет. */
export default function DrawMasterClass({
  lesson,
  currentStep,
  onPickColor,
  onPickSize,
  onPickTool,
  onNextStep,
  onPrevStep,
  onFinish,
}: Props) {
  const step = lesson.steps[currentStep];
  const totalSteps = lesson.steps.length;
  const isLast = currentStep + 1 >= totalSteps;
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  const speak = async (text: string) => {
    stopAudio();
    if (!text || !voiceEnabled) return;
    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, teacher_id: "fox" }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const audioData = data.audio || data.audio_base64;
      if (!audioData) return;
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch { /* noop */ }
  };

  // Автоозвучка при смене шага
  useEffect(() => {
    if (step && voiceEnabled) {
      speak(step.voice);
    }
    return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, voiceEnabled]);

  // Применяем рекомендуемые инструмент/цвет/размер
  useEffect(() => {
    if (!step) return;
    if (step.suggestTool) onPickTool?.(step.suggestTool);
    if (step.suggestColor) onPickColor?.(step.suggestColor);
    if (step.suggestSize) onPickSize?.(step.suggestSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  return (
    <div className={`bg-gradient-to-br ${lesson.color} rounded-3xl p-1 shadow-2xl`}>
      <div className="bg-card rounded-[1.4rem] overflow-hidden">
        {/* Шапка */}
        <div className="p-4 border-b border-white/8 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl flex-shrink-0">
            🦊
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/55 text-[10px] uppercase tracking-wider font-bold">Учитель рисования</p>
            <p className="font-montserrat font-black text-white text-sm leading-tight truncate">{lesson.title}</p>
          </div>
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            title={voiceEnabled ? "Выключить голос" : "Включить голос"}
            className={`p-2 rounded-xl transition-colors ${voiceEnabled ? "text-pink-300 bg-pink-500/15" : "text-white/40 hover:text-white hover:bg-white/8"}`}
          >
            <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={16} />
          </button>
        </div>

        {/* Прогресс шагов */}
        <div className="px-4 py-2.5 flex items-center gap-3 border-b border-white/8">
          <p className="text-white/55 text-xs tabular-nums">Шаг {currentStep + 1} / {totalSteps}</p>
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${lesson.color} transition-all duration-500`}
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Тело шага */}
        <div className="p-5">
          {step && (
            <>
              <p className="font-montserrat font-black text-white text-lg leading-tight mb-3">
                {step.title}
              </p>

              {/* Реплика учителя */}
              <div className="bg-pink-500/10 border border-pink-500/25 rounded-2xl p-4 mb-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xl flex-shrink-0">
                  {isPlaying ? "🎤" : "🦊"}
                </div>
                <p className="text-white text-sm leading-relaxed flex-1">{step.voice}</p>
                <button
                  onClick={() => speak(step.voice)}
                  title="Повторить голос"
                  className="p-1.5 rounded-lg text-pink-300 hover:text-white hover:bg-pink-500/20 transition-colors flex-shrink-0"
                >
                  <Icon name="RotateCcw" size={14} />
                </button>
              </div>

              {/* Рекомендации инструмента */}
              {(step.suggestColor || step.suggestSize || step.suggestTool) && (
                <div className="bg-cyan-500/8 border border-cyan-500/25 rounded-2xl p-3 mb-4 flex items-center gap-2 flex-wrap">
                  <Icon name="Wand2" size={14} className="text-cyan-300" />
                  <span className="text-cyan-200 text-xs font-semibold">Я подобрала:</span>
                  {step.suggestColor && (
                    <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-lg px-2 py-1">
                      <span className="w-3 h-3 rounded" style={{ background: step.suggestColor }} />
                      <span className="text-white/85 text-xs">цвет</span>
                    </span>
                  )}
                  {step.suggestTool && (
                    <span className="inline-flex items-center gap-1 bg-white/8 border border-white/15 text-white/85 text-xs px-2 py-1 rounded-lg capitalize">
                      <Icon name={step.suggestTool === "eraser" ? "Eraser" : step.suggestTool === "brush" ? "Brush" : step.suggestTool === "marker" ? "Highlighter" : "Pencil"} size={11} />
                      {step.suggestTool === "pencil" ? "карандаш" : step.suggestTool === "brush" ? "кисть" : step.suggestTool === "marker" ? "маркер" : "ластик"}
                    </span>
                  )}
                  {step.suggestSize && (
                    <span className="inline-flex items-center gap-1 bg-white/8 border border-white/15 text-white/85 text-xs px-2 py-1 rounded-lg">
                      <Icon name="Circle" size={11} />
                      {step.suggestSize}px
                    </span>
                  )}
                </div>
              )}

              {/* Совет */}
              {step.tip && (
                <div className="bg-amber-500/8 border border-amber-500/25 rounded-2xl p-3 mb-4 flex items-start gap-2">
                  <Icon name="Lightbulb" size={13} className="text-amber-300 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-200/90 text-xs leading-relaxed"><b>Совет:</b> {step.tip}</p>
                </div>
              )}
            </>
          )}

          {/* Кнопки навигации */}
          <div className="flex gap-2">
            <button
              onClick={onPrevStep}
              disabled={currentStep === 0}
              className="inline-flex items-center justify-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white/85 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40"
            >
              <Icon name="ArrowLeft" size={14} />
              Назад
            </button>
            {isLast ? (
              <button
                onClick={onFinish}
                className={`flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-br ${lesson.color} text-white text-sm font-bold py-2.5 rounded-xl hover:scale-[1.01] transition-transform shadow-lg`}
              >
                <Icon name="PartyPopper" size={14} />
                Готово!
              </button>
            ) : (
              <button
                onClick={onNextStep}
                className={`flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-br ${lesson.color} text-white text-sm font-bold py-2.5 rounded-xl hover:scale-[1.01] transition-transform shadow-lg`}
              >
                Следующий шаг
                <Icon name="ArrowRight" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
