import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import { Activity, AREAS } from "@/components/kids/kidsData";
import { Scene, getInteractive } from "@/components/kids/interactiveData";
import { useKidsProgress } from "@/components/kids/useKidsProgress";

const TTS_URL = (func2url as Record<string, string>)["tts"];

interface Props {
  activity: Activity;
  onClose: () => void;
}

export default function ActivityRunner({ activity, onClose }: Props) {
  const lesson = getInteractive(activity.id);
  const scenes: Scene[] = lesson?.scenes ?? [];
  const area = AREAS.find((a) => a.id === activity.areaId);

  const [sceneIdx, setSceneIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<"idle" | "correct" | "wrong">("idle");
  const [sortPlaced, setSortPlaced] = useState<Record<number, string>>({});
  const [songStepIdx, setSongStepIdx] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionStars, setSessionStars] = useState(0);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { addStars, recordAnswer, completeActivity } = useKidsProgress();

  const scene = scenes[sceneIdx];
  const totalScenes = scenes.length;

  // Озвучка реплики Лисы при смене сцены
  useEffect(() => {
    if (!scene || !voiceEnabled) return;
    let cancelled = false;
    const text = scene.voice;
    if (!text) return;
    const speak = async () => {
      try {
        // Остановить предыдущий
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const res = await fetch(TTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, teacher_id: "fox" }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const audioData = data.audio || data.audio_base64;
        if (!audioData || cancelled) return;
        const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
        audioRef.current = audio;
        audio.play().catch(() => { /* пользователь не взаимодействовал */ });
      } catch {
        /* noop */
      }
    };
    speak();
    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sceneIdx, voiceEnabled, scene]);

  // Очистка при закрытии
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const replayVoice = async () => {
    if (!scene) return;
    try {
      if (audioRef.current) audioRef.current.pause();
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scene.voice, teacher_id: "fox" }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const audioData = data.audio || data.audio_base64;
      if (!audioData) return;
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audioRef.current = audio;
      await audio.play();
    } catch { /* noop */ }
  };

  const nextScene = () => {
    setSelected(null);
    setVerdict("idle");
    setSortPlaced({});
    setSongStepIdx(0);
    if (sceneIdx + 1 >= totalScenes) {
      // Финиш — записываем прогресс
      completeActivity(activity.id);
      addStars(sessionStars);
      setFinished(true);
      return;
    }
    setSceneIdx(sceneIdx + 1);
  };

  // ─── Обработчик выбора (choose / emotion / counting) ─────────────────
  const handleChoose = (i: number) => {
    if (!scene || !scene.options) return;
    if (verdict === "correct") return;
    setSelected(i);
    const opt = scene.options[i];
    const isCorrect = !!opt.correct;
    setVerdict(isCorrect ? "correct" : "wrong");
    recordAnswer(isCorrect);
    if (isCorrect) {
      const r = scene.reward ?? 1;
      setSessionStars((s) => s + r);
      // Авто-переход после успеха
      setTimeout(() => nextScene(), 1200);
    } else {
      // Дать попробовать ещё
      setTimeout(() => {
        setVerdict("idle");
        setSelected(null);
      }, 900);
    }
  };

  // ─── Обработчик сортировки ───────────────────────────────────────────
  const handleSortPlace = (itemIdx: number, bucketId: string) => {
    if (!scene || !scene.options) return;
    setSortPlaced((prev) => ({ ...prev, [itemIdx]: bucketId }));
    const opt = scene.options[itemIdx];
    const isCorrect = opt.bucketId === bucketId;
    recordAnswer(isCorrect);
    // Когда все размещены — проверяем
    const newPlaced = { ...sortPlaced, [itemIdx]: bucketId };
    if (Object.keys(newPlaced).length === scene.options.length) {
      const allCorrect = scene.options.every((o, idx) => newPlaced[idx] === o.bucketId);
      if (allCorrect) {
        setSessionStars((s) => s + (scene.reward ?? 2));
        setVerdict("correct");
        setTimeout(() => nextScene(), 1500);
      } else {
        setVerdict("wrong");
        setTimeout(() => {
          setSortPlaced({});
          setVerdict("idle");
        }, 1200);
      }
    }
  };

  const handleSongAdvance = () => {
    if (!scene || !scene.songSteps) return;
    if (songStepIdx + 1 >= scene.songSteps.length) {
      setSessionStars((s) => s + (scene.reward ?? 2));
      nextScene();
    } else {
      setSongStepIdx(songStepIdx + 1);
    }
  };

  // ─── Нет интерактивного контента — fallback ─────────────────────────
  if (!lesson || scenes.length === 0) {
    return (
      <Modal onClose={onClose}>
        <div className="p-6">
          <p className="text-white/65 text-sm">Интерактивная версия этого занятия скоро появится. Используйте инструкцию ниже.</p>
        </div>
      </Modal>
    );
  }

  // ─── Финальная сцена результатов ─────────────────────────────────────
  if (finished) {
    return (
      <Modal onClose={onClose} hideHeader>
        <div className="p-8 text-center bg-gradient-to-br from-emerald-500/15 to-teal-500/15">
          <div className="text-7xl mb-3 animate-bounce">🎉</div>
          <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-2">Занятие пройдено!</h2>
          <p className="text-white/75 text-sm mb-5">Ты заработал звёзды:</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[...Array(Math.min(sessionStars, 5))].map((_, i) => (
              <span key={i} className="text-4xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>⭐</span>
            ))}
            <span className="ml-2 font-montserrat font-black text-white text-3xl">+{sessionStars}</span>
          </div>
          {activity.benefits.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-left">
              <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-2">Что развили</p>
              <div className="flex flex-wrap gap-1.5">
                {activity.benefits.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs font-medium px-2.5 py-1 rounded-full">
                    <Icon name="Check" size={11} />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.01] transition-transform"
          >
            <Icon name="Home" size={16} />
            Вернуться к занятиям
          </button>
        </div>
      </Modal>
    );
  }

  // ─── Текущая сцена ───────────────────────────────────────────────────
  return (
    <Modal onClose={onClose}>
      {/* Шапка */}
      <div className={`bg-gradient-to-br ${area?.color ?? "from-purple-500 to-pink-500"} p-4 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl">
          🦊
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold">{activity.typeLabel}</p>
          <p className="font-montserrat font-black text-white text-sm leading-tight truncate">{activity.title}</p>
        </div>
        <button
          onClick={() => setVoiceEnabled((v) => !v)}
          title={voiceEnabled ? "Отключить голос" : "Включить голос"}
          className={`p-2 rounded-xl transition-colors ${voiceEnabled ? "text-white bg-white/15" : "text-white/55 hover:bg-white/10"}`}
        >
          <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={16} />
        </button>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="p-2 rounded-xl text-white/75 hover:text-white hover:bg-white/15 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      {/* Прогресс */}
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-3">
        <p className="text-white/55 text-xs tabular-nums">Шаг {sceneIdx + 1} / {totalScenes}</p>
        <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500"
            style={{ width: `${((sceneIdx + 1) / totalScenes) * 100}%` }}
          />
        </div>
        <p className="text-amber-300 text-xs font-bold inline-flex items-center gap-1">
          <span>⭐</span>
          {sessionStars}
        </p>
      </div>

      {/* Сцена */}
      <div className="p-5 md:p-6">
        {scene.title && (
          <h3 className="font-montserrat font-black text-white text-xl md:text-2xl text-center mb-4 leading-tight">
            {scene.title}
          </h3>
        )}

        {/* Большое эмодзи или текст */}
        {scene.bigText && (
          <div className="text-center mb-5">
            <div className="font-montserrat font-black text-white text-5xl md:text-7xl mb-2 leading-none">
              {scene.bigText}
            </div>
            {scene.emoji && <div className="text-5xl">{scene.emoji}</div>}
          </div>
        )}
        {!scene.bigText && scene.emoji && (scene.kind === "intro" || scene.kind === "flashcard" || scene.kind === "song" || scene.kind === "emotion" || scene.kind === "counting" || scene.kind === "letter") && (
          <div className="text-center mb-5">
            <div className="text-7xl md:text-8xl mb-3">{scene.emoji}</div>
          </div>
        )}

        {/* Реплика Лисы */}
        <div className="bg-pink-500/10 border border-pink-500/25 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xl flex-shrink-0">
            🦊
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm leading-relaxed">{scene.voice}</p>
          </div>
          <button
            onClick={replayVoice}
            title="Послушать ещё раз"
            className="p-1.5 rounded-lg text-pink-300 hover:text-white hover:bg-pink-500/20 transition-colors flex-shrink-0"
          >
            <Icon name="RotateCcw" size={14} />
          </button>
        </div>

        {/* Песенка */}
        {scene.kind === "song" && scene.songSteps && (
          <div className="space-y-2 mb-5">
            {scene.songSteps.map((step, i) => (
              <div
                key={i}
                className={`rounded-xl px-4 py-2.5 text-center transition-all ${
                  i === songStepIdx
                    ? "bg-gradient-to-r from-pink-500/25 to-rose-500/25 border-2 border-pink-500/45 text-white font-semibold scale-105"
                    : i < songStepIdx
                    ? "bg-white/5 border border-white/10 text-white/45"
                    : "bg-white/5 border border-white/10 text-white/65"
                }`}
              >
                {step}
              </div>
            ))}
            <button
              onClick={handleSongAdvance}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:scale-[1.01] transition-transform"
            >
              {songStepIdx + 1 >= scene.songSteps.length ? "Готово!" : "Следующая строчка"}
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>
        )}

        {/* Варианты выбора (choose / emotion / counting / letter с выбором) */}
        {(scene.kind === "choose" || scene.kind === "emotion" || scene.kind === "counting" || scene.kind === "letter") && scene.options && (
          <div className={`grid gap-2.5 ${scene.options.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            {scene.options.map((opt, i) => {
              const isSelected = selected === i;
              const showVerdict = isSelected && verdict !== "idle";
              return (
                <button
                  key={i}
                  onClick={() => handleChoose(i)}
                  disabled={verdict === "correct"}
                  className={`group relative bg-white/5 hover:bg-white/10 border-2 rounded-2xl p-4 transition-all ${
                    showVerdict && verdict === "correct"
                      ? "border-emerald-500/70 bg-emerald-500/20 scale-105"
                      : showVerdict && verdict === "wrong"
                      ? "border-rose-500/70 bg-rose-500/15"
                      : "border-white/10 hover:border-pink-500/40 hover:scale-105"
                  }`}
                >
                  <div className="text-5xl md:text-6xl mb-2">{opt.emoji}</div>
                  <p className="text-white/85 text-xs md:text-sm font-semibold">{opt.label}</p>
                  {showVerdict && verdict === "correct" && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Icon name="Check" size={14} className="text-white" />
                    </div>
                  )}
                  {showVerdict && verdict === "wrong" && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                      <Icon name="X" size={14} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Сортировка */}
        {scene.kind === "sort" && scene.buckets && scene.options && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {scene.buckets.map((bucket) => {
                const placedItems = scene.options!
                  .map((o, idx) => ({ o, idx }))
                  .filter(({ idx }) => sortPlaced[idx] === bucket.id);
                return (
                  <div
                    key={bucket.id}
                    className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-3 min-h-[120px]"
                  >
                    <p className="text-white text-xs font-bold text-center mb-2 inline-flex items-center justify-center gap-1 w-full">
                      <span className="text-base">{bucket.emoji}</span>
                      {bucket.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {placedItems.map(({ o, idx }) => (
                        <span key={idx} className="text-3xl">{o.emoji}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-white/45 text-[11px] text-center mb-3">Нажми на предмет, потом — на нужную корзинку</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {scene.options.map((opt, i) => {
                const placed = sortPlaced[i];
                if (placed) return null;
                return (
                  <div key={i} className="bg-white/5 border border-white/15 rounded-2xl p-3 text-center">
                    <div className="text-4xl mb-1">{opt.emoji}</div>
                    <p className="text-white/65 text-[10px] mb-2 truncate">{opt.label}</p>
                    <div className="flex gap-1 justify-center">
                      {scene.buckets!.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => handleSortPlace(i, b.id)}
                          className="text-lg p-1 rounded-lg bg-white/5 hover:bg-pink-500/25 transition-colors"
                          title={`В ${b.label}`}
                        >
                          {b.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {verdict === "correct" && (
              <p className="mt-3 text-center text-emerald-300 font-bold animate-pulse">✅ Всё верно!</p>
            )}
            {verdict === "wrong" && (
              <p className="mt-3 text-center text-rose-300 font-bold">Не совсем — попробуем ещё раз</p>
            )}
          </div>
        )}

        {/* Кнопка «Дальше» для intro/flashcard/finish */}
        {(scene.kind === "intro" || scene.kind === "flashcard" || scene.kind === "finish") && (
          <button
            onClick={nextScene}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-base font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.01] transition-transform shadow-lg shadow-pink-500/30"
          >
            {scene.kind === "finish" ? "Завершить" : sceneIdx === 0 ? "Начнём!" : "Дальше"}
            <Icon name="ArrowRight" size={16} />
          </button>
        )}

        {/* Подсказка для родителя */}
        {scene.hintForParent && (
          <div className="mt-4 bg-amber-500/8 border border-amber-500/25 rounded-xl p-3 flex items-start gap-2">
            <Icon name="Lightbulb" size={13} className="text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200/90 text-[11px] leading-relaxed"><b>Совет родителю:</b> {scene.hintForParent}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Modal({ children, onClose, hideHeader = false }: { children: React.ReactNode; onClose: () => void; hideHeader?: boolean }) {
  // Закрытие по Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg bg-card border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fadeIn max-h-[92vh] overflow-y-auto scrollbar-hide">
        {!hideHeader && null}
        {children}
      </div>
    </div>
  );
}
