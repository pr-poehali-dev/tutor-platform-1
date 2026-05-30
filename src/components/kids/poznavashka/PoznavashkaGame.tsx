import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useZnaika } from "@/context/ZnaikaContext";
import { useAuth } from "@/context/AuthContext";
import { useKsushaVoice } from "./useKsushaVoice";
import {
  POZNAVASHKA_WORLDS,
  KSUSHA_AVATAR,
  ZNAIKI_PER_CORRECT,
  PoznavashkaWorld,
} from "./poznavashkaData";

type Phase = "map" | "play" | "result";
type Verdict = "idle" | "correct" | "wrong";

function KsushaSays({
  text,
  size = "md",
  speaking = false,
  onReplay,
}: {
  text: string;
  size?: "md" | "lg";
  speaking?: boolean;
  onReplay?: () => void;
}) {
  return (
    <div className="flex items-end gap-3">
      <img
        src={KSUSHA_AVATAR}
        alt="Ксюша"
        className={`flex-shrink-0 rounded-full border-4 object-cover transition-all ${
          speaking
            ? "border-amber-300 ring-4 ring-amber-300/40 animate-pulse scale-105"
            : "border-amber-300/60"
        } shadow-lg shadow-amber-500/20 ${size === "lg" ? "w-24 h-24" : "w-16 h-16"}`}
      />
      <div className="relative bg-white text-slate-800 rounded-3xl rounded-bl-md px-5 py-3 pr-12 shadow-xl font-bold text-base md:text-lg leading-snug">
        {text}
        {onReplay && (
          <button
            onClick={onReplay}
            aria-label="Повторить голосом"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 flex items-center justify-center transition-colors"
          >
            <Icon name={speaking ? "Volume2" : "RotateCcw"} size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition-colors ${
        enabled
          ? "bg-amber-400/15 border-amber-400/40 text-amber-200 hover:bg-amber-400/25"
          : "bg-white/5 border-white/15 text-white/50 hover:bg-white/10"
      }`}
    >
      <Icon name={enabled ? "Volume2" : "VolumeX"} size={16} />
      {enabled ? "Голос включён" : "Голос выключен"}
    </button>
  );
}

export default function PoznavashkaGame() {
  const { earn } = useZnaika();
  const { isAuthenticated, openLogin } = useAuth();
  const { speak, stop, toggle, enabled, speaking } = useKsushaVoice();

  const [phase, setPhase] = useState<Phase>("map");
  const [world, setWorld] = useState<PoznavashkaWorld | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<Verdict>("idle");
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedZnaiki, setEarnedZnaiki] = useState(0);

  const startWorld = (w: PoznavashkaWorld) => {
    setWorld(w);
    setQIndex(0);
    setSelected(null);
    setVerdict("idle");
    setShowHint(false);
    setCorrectCount(0);
    setEarnedZnaiki(0);
    setPhase("play");
  };

  const question = world?.questions[qIndex];

  const handleChoose = (i: number) => {
    if (!question || verdict === "correct") return;
    const opt = question.options[i];
    setSelected(i);
    if (opt.correct) {
      setVerdict("correct");
      setCorrectCount((c) => c + 1);
      setEarnedZnaiki((z) => z + ZNAIKI_PER_CORRECT);
    } else {
      setVerdict("wrong");
      setTimeout(() => {
        setVerdict("idle");
        setSelected(null);
        setShowHint(true);
      }, 1000);
    }
  };

  const goNext = async () => {
    if (!world) return;
    if (qIndex + 1 >= world.questions.length) {
      // Финиш — начисляем ЗНАЙКИ за правильные ответы
      if (isAuthenticated && earnedZnaiki > 0) {
        await earn(
          "poznavashka",
          earnedZnaiki,
          `Познавашка: ${world.title}`
        );
      }
      setPhase("result");
      return;
    }
    setQIndex((n) => n + 1);
    setSelected(null);
    setVerdict("idle");
    setShowHint(false);
  };

  const MAP_GREETING =
    "Привет! Я Ксюша. Давай вместе узнаем, как устроен наш волшебный мир! Выбирай страну для приключения.";

  // Озвучка приветствия на карте миров
  useEffect(() => {
    if (phase === "map") speak(MAP_GREETING);
    else stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Озвучка вопроса при его появлении
  useEffect(() => {
    if (phase === "play" && question && verdict === "idle" && !showHint) {
      speak(question.question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex]);

  // Озвучка подсказки после ошибки
  useEffect(() => {
    if (showHint && question && verdict !== "correct") {
      speak(question.hint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHint]);

  // Озвучка интересного факта после правильного ответа
  useEffect(() => {
    if (verdict === "correct" && question) {
      speak(question.fact);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verdict]);

  // ===== ЭКРАН: КАРТА МИРОВ =====
  if (phase === "map") {
    return (
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        <div className="flex justify-end mb-3">
          <SoundToggle enabled={enabled} onToggle={toggle} />
        </div>
        <div className="mb-8">
          <KsushaSays
            text="Привет! Я Ксюша 🌸 Давай вместе узнаем, как устроен наш волшебный мир! Выбирай страну для приключения."
            size="lg"
            speaking={speaking}
            onReplay={enabled ? () => speak(MAP_GREETING) : undefined}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
          {POZNAVASHKA_WORLDS.map((w) => (
            <button
              key={w.slug}
              onClick={() => startWorld(w)}
              className="group text-left bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 hover:translate-y-[-4px] transition-all"
            >
              <div className={`h-2 bg-gradient-to-r ${w.color}`} />
              <div className="p-6 flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${w.color} flex items-center justify-center text-5xl shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {w.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-montserrat font-black text-white text-xl mb-1">{w.title}</h3>
                  <p className="text-white/60 text-sm mb-2">{w.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-full px-2.5 py-1 font-bold">
                    <Icon name="Sparkles" size={11} />
                    до {w.questions.length * ZNAIKI_PER_CORRECT} ЗНАЕК
                  </span>
                </div>
                <Icon name="ChevronRight" size={24} className="text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ===== ЭКРАН: РЕЗУЛЬТАТ =====
  if (phase === "result" && world) {
    const total = world.questions.length;
    const allRight = correctCount === total;
    return (
      <div className="max-w-2xl mx-auto px-5 py-12 text-center">
        <div className="text-7xl mb-4 animate-bounce">{allRight ? "🏆" : "🌟"}</div>
        <h2 className="font-montserrat font-black text-3xl text-white mb-3">
          {allRight ? "Ура! Все ответы верные!" : "Молодец, приключение пройдено!"}
        </h2>

        <div className="bg-card border border-white/10 rounded-3xl p-6 my-6">
          <KsushaSays
            text={
              allRight
                ? "Ты настоящий Познавашка! Я тобой горжусь 💛"
                : "Ты узнал много нового! В следующий раз будет ещё лучше 💪"
            }
          />
          <div className="mt-6 flex items-center justify-center gap-6">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Верных ответов</p>
              <p className="font-montserrat font-black text-white text-3xl">
                {correctCount} / {total}
              </p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Заработано</p>
              <p className="font-montserrat font-black text-amber-300 text-3xl flex items-center gap-1.5 justify-center">
                <Icon name="Sparkles" size={22} />
                {earnedZnaiki}
              </p>
            </div>
          </div>

          {!isAuthenticated && earnedZnaiki > 0 && (
            <button
              onClick={openLogin}
              className="mt-5 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-bold underline underline-offset-4"
            >
              <Icon name="LogIn" size={15} />
              Войди, чтобы сохранить {earnedZnaiki} ЗНАЕК
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => world && startWorld(world)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="RotateCcw" size={18} />
            Сыграть ещё раз
          </button>
          <button
            onClick={() => setPhase("map")}
            className="inline-flex items-center justify-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-white/12 transition-colors"
          >
            <Icon name="Map" size={18} />
            Выбрать другую страну
          </button>
        </div>
      </div>
    );
  }

  // ===== ЭКРАН: ИГРА =====
  if (phase === "play" && world && question) {
    const total = world.questions.length;
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Прогресс */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setPhase("map")}
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors"
          >
            <Icon name="ChevronLeft" size={16} />
            Карта
          </button>
          <div className="flex items-center gap-1.5">
            {world.questions.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < qIndex ? "bg-amber-400" : i === qIndex ? "bg-white scale-125" : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SoundToggle enabled={enabled} onToggle={toggle} />
            <span className="inline-flex items-center gap-1 text-amber-300 text-sm font-bold">
              <Icon name="Sparkles" size={14} />
              {earnedZnaiki}
            </span>
          </div>
        </div>

        {/* Ксюша задаёт вопрос */}
        <div className="mb-6">
          <KsushaSays
            text={question.question}
            speaking={speaking}
            onReplay={enabled ? () => speak(question.question) : undefined}
          />
        </div>

        {/* Подсказка */}
        {showHint && verdict !== "correct" && (
          <div className="mb-4 bg-sky-400/10 border border-sky-400/25 rounded-2xl px-4 py-3 flex items-start gap-2 animate-fade-in">
            <Icon name="Lightbulb" size={18} className="text-sky-300 flex-shrink-0 mt-0.5" />
            <p className="text-sky-100 text-sm">{question.hint}</p>
          </div>
        )}

        {/* Варианты */}
        <div className="grid gap-3">
          {question.options.map((opt, i) => {
            const isSel = selected === i;
            let cls = "bg-card border-white/12 hover:border-white/30 hover:bg-white/[0.06]";
            if (isSel && verdict === "correct") cls = "bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/40";
            else if (isSel && verdict === "wrong") cls = "bg-rose-500/20 border-rose-400 ring-2 ring-rose-400/40 animate-shake";
            return (
              <button
                key={i}
                onClick={() => handleChoose(i)}
                disabled={verdict === "correct"}
                className={`flex items-center gap-4 border rounded-3xl px-5 py-4 text-left transition-all disabled:cursor-default ${cls}`}
              >
                <span className="text-4xl flex-shrink-0">{opt.emoji}</span>
                <span className="font-montserrat font-black text-white text-lg flex-1">{opt.label}</span>
                {isSel && verdict === "correct" && <Icon name="CheckCircle2" size={24} className="text-emerald-400" />}
                {isSel && verdict === "wrong" && <Icon name="XCircle" size={24} className="text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* Факт + кнопка дальше после правильного ответа */}
        {verdict === "correct" && (
          <div className="mt-5 animate-fade-in">
            <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-2xl px-4 py-3 flex items-start gap-2 mb-4">
              <span className="text-xl">💡</span>
              <p className="text-emerald-100 text-sm leading-snug">{question.fact}</p>
            </div>
            <button
              onClick={goNext}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold px-6 py-4 rounded-2xl hover:scale-[1.01] transition-transform text-lg"
            >
              {qIndex + 1 >= total ? "Завершить" : "Дальше"}
              <Icon name="ArrowRight" size={20} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}