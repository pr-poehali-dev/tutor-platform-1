import { useState } from "react";
import Icon from "@/components/ui/icon";
import { NARRATOR_VOICES } from "@/hooks/useLessonNarrator";
import SpeakingTutorAvatar from "@/components/courses/detail/SpeakingTutorAvatar";

interface Props {
  status: "idle" | "loading" | "playing" | "paused" | "error";
  currentText: string;
  error: string | null;
  voiceId: string;
  setVoiceId: (v: string) => void;
  rate: number;
  setRate: (r: number) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReplay: () => void;
  accent?: string;
  /** Число для выбора видео-ведущего (обычно id курса). */
  avatarSeed?: number;
}

type ViewMode = "mini" | "full";

/**
 * Плавающая панель «Говорящий преподаватель» — версия для слабовидящих.
 * Большие кнопки, высокий контраст, ARIA-метки, клавиатурная навигация.
 */
export default function LessonNarratorBar({
  status,
  currentText,
  error,
  voiceId,
  setVoiceId,
  rate,
  setRate,
  enabled,
  setEnabled,
  onPause,
  onResume,
  onStop,
  onReplay,
  accent = "#a855f7",
  avatarSeed = 0,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<ViewMode>("mini"); // по умолчанию компактный режим

  const isActive = status === "playing" || status === "paused" || status === "loading";
  const speaking = status === "playing";
  const voice = NARRATOR_VOICES.find((v) => v.id === voiceId) || NARRATOR_VOICES[0];

  // Свернутая «таблетка» если выключено — маленькая
  if (!enabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
        <button
          onClick={() => setEnabled(true)}
          aria-label="Включить голосового преподавателя"
          title="Включить голос преподавателя"
          className="w-11 h-11 rounded-full bg-card/85 backdrop-blur-xl border border-white/15 hover:bg-card/95 hover:border-white/30 flex items-center justify-center shadow-xl transition-all"
        >
          <Icon name="VolumeX" size={16} className="text-white/70" />
        </button>
      </div>
    );
  }

  // ─── КОМПАКТНЫЙ РЕЖИМ — маленькая плавающая кнопка, не перекрывает контент ───
  if (mode === "mini") {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 animate-fade-in"
        role="region"
        aria-label="Голосовой преподаватель (свёрнут)"
      >
        <div
          className="flex items-center gap-1.5 bg-card/85 backdrop-blur-xl border border-white/15 rounded-full shadow-xl p-1 pl-1.5 hover:bg-card/95 transition-colors"
        >
          {/* Говорящий видео-аватар ведущего — оживает во время речи */}
          <SpeakingTutorAvatar speaking={speaking} seed={avatarSeed} size={40} round />

          {/* Главная кнопка play/pause */}
          {status === "playing" ? (
            <button
              onClick={onPause}
              aria-label="Пауза"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 relative"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="Pause" size={16} className="text-white" />
              <span
                className="absolute -inset-0.5 rounded-full border-2 animate-ping pointer-events-none"
                style={{ borderColor: accent }}
              />
            </button>
          ) : status === "paused" ? (
            <button
              onClick={onResume}
              aria-label="Продолжить"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="Play" size={16} className="text-white ml-0.5" />
            </button>
          ) : status === "loading" ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="Loader2" size={16} className="text-white animate-spin" />
            </div>
          ) : (
            <button
              onClick={onReplay}
              aria-label="Озвучить заново"
              title="Озвучить заново"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="Volume2" size={15} className="text-white" />
            </button>
          )}

          {/* Кнопка развернуть */}
          <button
            onClick={() => setMode("full")}
            aria-label="Развернуть панель преподавателя"
            title={`Преподаватель ${voice.name}`}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Icon name="ChevronUp" size={14} className="text-white/65" />
          </button>
        </div>
      </div>
    );
  }

  // ─── ПОЛНЫЙ РЕЖИМ ───
  return (
    <div
      className="fixed bottom-4 right-4 z-50 animate-fade-in"
      role="region"
      aria-label="Голосовой преподаватель"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden w-[280px] max-w-[calc(100vw-2rem)]">
        {/* Header */}
        <div
          className="px-3 py-2 flex items-center gap-2 border-b border-white/10"
          style={{ background: `linear-gradient(135deg, ${accent}25, transparent)` }}
        >
          <SpeakingTutorAvatar speaking={speaking} seed={avatarSeed} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-xs leading-tight truncate">Ведущий · {voice.name}</p>
            <p className="text-white/55 text-[10px] leading-tight mt-0.5 truncate">
              {status === "playing" && "говорит…"}
              {status === "paused" && "пауза"}
              {status === "loading" && "готовлю голос…"}
              {status === "idle" && "готов"}
              {status === "error" && (error || "ошибка")}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Свернуть настройки" : "Развернуть настройки"}
            aria-expanded={expanded}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Icon name={expanded ? "ChevronDown" : "Settings2"} size={14} className="text-white/70" />
          </button>
          <button
            onClick={() => setMode("mini")}
            aria-label="Свернуть панель"
            title="Свернуть"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Icon name="Minus" size={14} className="text-white/70" />
          </button>
        </div>

        {/* Текущая фраза — компактнее */}
        {currentText && isActive && expanded && (
          <div className="px-3 py-2 bg-white/4 border-b border-white/10 max-h-16 overflow-y-auto">
            <p className="text-white/85 text-xs leading-relaxed" aria-live="polite">
              {currentText.length > 140 ? currentText.slice(0, 140) + "…" : currentText}
            </p>
          </div>
        )}

        {/* Компактные кнопки управления */}
        <div className="px-3 py-2 flex items-center gap-1.5">
          {status === "playing" ? (
            <button
              onClick={onPause}
              aria-label="Пауза"
              className="flex-1 h-9 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="Pause" size={14} />
              <span>Пауза</span>
            </button>
          ) : status === "paused" ? (
            <button
              onClick={onResume}
              aria-label="Продолжить"
              className="flex-1 h-9 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="Play" size={14} />
              <span>Дальше</span>
            </button>
          ) : (
            <button
              onClick={onReplay}
              aria-label="Озвучить заново"
              disabled={status === "loading"}
              className="flex-1 h-9 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="RotateCcw" size={13} />
              <span>Повторить</span>
            </button>
          )}

          <button
            onClick={onStop}
            aria-label="Остановить озвучку"
            disabled={!isActive}
            className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <Icon name="Square" size={12} className="text-white" />
          </button>
        </div>

        {/* Расширенные настройки */}
        {expanded && (
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/10 animate-fade-in">
            {/* Выбор голоса */}
            <div>
              <label className="text-white/70 text-xs font-bold uppercase tracking-wider block mb-2">
                Голос преподавателя
              </label>
              <div className="grid grid-cols-2 gap-2">
                {NARRATOR_VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoiceId(v.id)}
                    aria-label={`Выбрать голос ${v.name}`}
                    aria-pressed={voiceId === v.id}
                    className={`px-3 py-2 rounded-xl text-left transition-all border ${
                      voiceId === v.id
                        ? "border-white/30 bg-white/10"
                        : "border-white/8 bg-white/3 hover:bg-white/6"
                    }`}
                    style={voiceId === v.id ? { borderColor: accent + "80" } : {}}
                  >
                    <p className="text-white font-bold text-sm leading-tight">{v.name}</p>
                    <p className="text-white/45 text-[10px] leading-tight mt-0.5">{v.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Скорость */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-xs font-bold uppercase tracking-wider">
                  Скорость речи
                </label>
                <span className="text-white font-mono text-sm font-bold tabular-nums">{rate.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRate(rate - 0.1)}
                  aria-label="Медленнее"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <Icon name="Minus" size={14} className="text-white" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  aria-label="Скорость речи"
                  className="flex-1 h-2 bg-white/10 rounded-full appearance-none accent-purple-500"
                  style={{ accentColor: accent }}
                />
                <button
                  onClick={() => setRate(rate + 0.1)}
                  aria-label="Быстрее"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <Icon name="Plus" size={14} className="text-white" />
                </button>
              </div>
            </div>

            {/* Выключить */}
            <button
              onClick={() => setEnabled(false)}
              className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Icon name="VolumeX" size={14} />
              Выключить голосового преподавателя
            </button>
          </div>
        )}
      </div>
    </div>
  );
}