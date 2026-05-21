import { useState } from "react";
import Icon from "@/components/ui/icon";
import { NARRATOR_VOICES } from "@/hooks/useLessonNarrator";

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
}

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
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const isActive = status === "playing" || status === "paused" || status === "loading";
  const voice = NARRATOR_VOICES.find((v) => v.id === voiceId) || NARRATOR_VOICES[0];

  // Свернутая «таблетка» если выключено
  if (!enabled) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
        <button
          onClick={() => setEnabled(true)}
          aria-label="Включить голосового преподавателя"
          className="flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-white/15 hover:border-white/30 rounded-full px-5 py-3 shadow-2xl transition-all"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
          >
            <Icon name="VolumeX" size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">Включить голос</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-50 animate-fade-in"
      role="region"
      aria-label="Голосовой преподаватель"
    >
      <div className="bg-card/95 backdrop-blur-xl border-2 border-white/15 rounded-3xl shadow-2xl overflow-hidden w-[340px] max-w-[calc(100vw-2.5rem)]">
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-3 border-b border-white/10"
          style={{ background: `linear-gradient(135deg, ${accent}25, transparent)` }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
          >
            <Icon
              name={status === "playing" ? "Volume2" : status === "loading" ? "Loader2" : "Mic"}
              size={20}
              className={`text-white ${status === "loading" ? "animate-spin" : ""}`}
            />
            {status === "playing" && (
              <span
                className="absolute -inset-1 rounded-2xl border-2 animate-ping"
                style={{ borderColor: accent }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">Преподаватель {voice.name}</p>
            <p className="text-white/55 text-[11px] leading-tight mt-0.5">
              {status === "playing" && "говорит…"}
              {status === "paused" && "пауза"}
              {status === "loading" && "готовлю голос…"}
              {status === "idle" && "готов читать урок"}
              {status === "error" && (error || "ошибка озвучки")}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Свернуть настройки" : "Развернуть настройки"}
            aria-expanded={expanded}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Icon name={expanded ? "ChevronDown" : "Settings2"} size={16} className="text-white/70" />
          </button>
        </div>

        {/* Текущая фраза (для слабовидящих — большой текст) */}
        {currentText && isActive && (
          <div className="px-4 py-3 bg-white/4 border-b border-white/10 max-h-24 overflow-y-auto">
            <p className="text-white/85 text-sm leading-relaxed" aria-live="polite">
              {currentText.length > 220 ? currentText.slice(0, 220) + "…" : currentText}
            </p>
          </div>
        )}

        {/* Большие кнопки управления */}
        <div className="px-4 py-3 flex items-center gap-2">
          {status === "playing" ? (
            <button
              onClick={onPause}
              aria-label="Пауза"
              className="flex-1 h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="Pause" size={20} />
              <span>Пауза</span>
            </button>
          ) : status === "paused" ? (
            <button
              onClick={onResume}
              aria-label="Продолжить"
              className="flex-1 h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="Play" size={20} />
              <span>Продолжить</span>
            </button>
          ) : (
            <button
              onClick={onReplay}
              aria-label="Озвучить заново"
              disabled={status === "loading"}
              className="flex-1 h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <Icon name="RotateCcw" size={18} />
              <span>Повторить</span>
            </button>
          )}

          <button
            onClick={onStop}
            aria-label="Остановить озвучку"
            disabled={!isActive}
            className="w-12 h-12 rounded-2xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <Icon name="Square" size={16} className="text-white" />
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
