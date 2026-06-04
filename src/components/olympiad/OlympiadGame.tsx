import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useZnaika, formatZnaika } from "@/context/ZnaikaContext";
import {
  startOlympiad, answerOlympiad, finishOlympiad,
  OlympiadQuestion, AnswerResponse, FinishResponse,
  OLYMPIAD_SUBJECTS, OLYMPIAD_GRADES,
} from "./api";

type Phase = "setup" | "loading" | "playing" | "finished";

export default function OlympiadGame({ onLeaderboard }: { onLeaderboard?: () => void }) {
  const { token, user, isAuthenticated, openLogin } = useAuth();
  const znaika = useZnaika();

  const [phase, setPhase] = useState<Phase>("setup");
  const [subject, setSubject] = useState("mixed");
  const [grade, setGrade] = useState("5-9");

  const [sessionToken, setSessionToken] = useState("");
  const [name, setName] = useState("друг");
  const [question, setQuestion] = useState<OlympiadQuestion | null>(null);
  const [coach, setCoach] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResponse | null>(null);
  const [streak, setStreak] = useState(0);
  const [znaikiTotal, setZnaikiTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [final, setFinal] = useState<FinishResponse | null>(null);
  const [startError, setStartError] = useState("");

  const start = async () => {
    setPhase("loading");
    setStartError("");
    try {
      const res = await startOlympiad(token, subject, grade);
      if (res.error || !res.session_token) {
        setStartError(res.error || "Не удалось запустить олимпиаду");
        setPhase("setup");
        return;
      }
      setSessionToken(res.session_token);
      setName(res.name || "друг");
      setQuestion(res.question);
      setCoach(res.coach);
      setStreak(0);
      setZnaikiTotal(0);
      setSelected(null);
      setAnswerResult(null);
      setPhase("playing");
    } catch {
      setStartError("Сетевая ошибка. Попробуй ещё раз.");
      setPhase("setup");
    }
  };

  const submitAnswer = async () => {
    if (selected === null || !question || submitting) return;
    setSubmitting(true);
    try {
      const res = await answerOlympiad(token, sessionToken, selected);
      if (res.error) { setSubmitting(false); return; }
      setAnswerResult(res);
      setCoach(res.coach);
      setZnaikiTotal(res.znaiki_total);
      setStreak(res.correct ? streak + 1 : 0);
    } catch { /* empty */ }
    setSubmitting(false);
  };

  const next = async () => {
    if (!answerResult) return;
    if (answerResult.finished) {
      setPhase("loading");
      const res = await finishOlympiad(token, sessionToken, user?.name || name);
      setFinal(res);
      setZnaikiTotal(res.znaiki_earned);
      znaika.refresh();
      setPhase("finished");
      return;
    }
    setQuestion(answerResult.question || null);
    setSelected(null);
    setAnswerResult(null);
  };

  const reset = () => {
    setPhase("setup");
    setFinal(null);
    setQuestion(null);
    setAnswerResult(null);
    setSelected(null);
  };

  // ─── SETUP ───
  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border border-purple-400/30 rounded-3xl p-6 md:p-8 text-center mb-5">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-2">
            Мини-<span className="gradient-text-purple">олимпиада</span>
          </h1>
          <p className="text-white/70 max-w-md mx-auto">
            7 задач по нарастающей сложности. За каждый верный ответ — <b className="text-amber-300">50 ЗНАЕК</b>.
            Пройди без ошибок и забери <b className="text-amber-300">главный приз 5000 ЗНАЕК!</b>
          </p>
        </div>

        {!isAuthenticated && (
          <button
            onClick={openLogin}
            className="w-full mb-4 bg-amber-500/15 border border-amber-400/30 rounded-2xl p-3 text-amber-200 text-sm flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-colors"
          >
            <Icon name="LogIn" size={16} /> Войди, чтобы ЗНАЙКИ зачислились на твой счёт
          </button>
        )}

        <div className="bg-card/50 border border-white/10 rounded-2xl p-5 space-y-5">
          <div>
            <p className="text-white font-bold mb-2 text-sm">Выбери предмет</p>
            <div className="grid grid-cols-3 gap-2">
              {OLYMPIAD_SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubject(s.id)}
                  className={`rounded-xl p-2.5 text-center border transition-all ${
                    subject === s.id
                      ? "bg-gradient-to-br from-purple-500 to-cyan-500 border-transparent text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="text-xl mb-0.5">{s.emoji}</div>
                  <div className="text-[11px] font-bold leading-tight">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-bold mb-2 text-sm">Класс</p>
            <div className="flex gap-2">
              {OLYMPIAD_GRADES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGrade(g.id)}
                  className={`flex-1 h-10 rounded-xl text-sm font-bold border transition-all ${
                    grade === g.id
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {startError && (
            <p className="text-red-300 text-sm text-center">{startError}</p>
          )}

          <button
            onClick={start}
            className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            <Icon name="Rocket" size={20} /> Начать олимпиаду
          </button>

          {onLeaderboard && (
            <button
              onClick={onLeaderboard}
              className="w-full text-purple-300 hover:text-purple-200 text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Icon name="Trophy" size={14} /> Таблица лидеров
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── LOADING ───
  if (phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-14 h-14 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mx-auto mb-4" />
        <p className="text-white/70">Тренер готовит для тебя задачи…</p>
      </div>
    );
  }

  // ─── FINISHED ───
  if (phase === "finished" && final) {
    const isPerfect = final.perfect && final.correct_count >= final.total;
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-3xl p-6 md:p-8 text-center border ${
          isPerfect ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-400/40"
                    : "bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border-purple-400/30"
        }`}>
          <div className="text-6xl mb-3">{isPerfect ? "🏆" : "🎉"}</div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
            {isPerfect ? "Идеально!" : "Олимпиада пройдена!"}
          </h2>
          <p className="text-white/80 mb-5">{final.coach}</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="text-2xl font-black text-white">{final.correct_count}/{final.total}</div>
              <div className="text-white/50 text-xs">верных</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="text-2xl font-black text-amber-300">+{formatZnaika(final.znaiki_earned)}</div>
              <div className="text-white/50 text-xs">ЗНАЕК</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="text-2xl font-black text-cyan-300">{final.score}</div>
              <div className="text-white/50 text-xs">очков</div>
            </div>
          </div>

          {final.grand_prize > 0 && (
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-4 mb-5">
              <p className="text-amber-200 font-black text-lg flex items-center justify-center gap-2">
                <Icon name="Award" size={22} /> ГЛАВНЫЙ ПРИЗ: +{formatZnaika(final.grand_prize)} ЗНАЕК!
              </p>
            </div>
          )}

          {!isAuthenticated && (
            <p className="text-amber-200/80 text-sm mb-4">
              Войди в аккаунт, чтобы ЗНАЙКИ сохранились и участвовали в рейтинге.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={reset}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2"
            >
              <Icon name="RotateCcw" size={18} /> Ещё раз
            </button>
            {onLeaderboard && (
              <button
                onClick={onLeaderboard}
                className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold flex items-center justify-center gap-2"
              >
                <Icon name="Trophy" size={18} /> Рейтинг
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAYING ───
  if (!question) return null;
  const showResult = !!answerResult;
  const progress = Math.round((question.index / question.total) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar: progress + znaiki + streak */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Задача {question.index + 1} из {question.total}</span>
            <span>{question.subject}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-400/30 rounded-full px-3 h-8">
          <span className="text-base">💎</span>
          <span className="text-amber-200 font-black text-sm tabular-nums">{formatZnaika(znaikiTotal)}</span>
        </div>
      </div>

      {/* Coach */}
      <div className="flex items-start gap-3 bg-gradient-to-r from-purple-500/15 to-transparent border border-purple-400/25 rounded-2xl p-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg flex-shrink-0">🧑‍🏫</div>
        <div className="flex-1 min-w-0">
          <p className="text-purple-200 text-[11px] font-bold uppercase tracking-wider mb-0.5">Тренер</p>
          <p className="text-white/90 text-sm leading-snug">{coach}</p>
        </div>
        {streak >= 2 && (
          <div className="flex items-center gap-1 bg-orange-500/20 rounded-full px-2 h-7 flex-shrink-0">
            <span className="text-sm">🔥</span>
            <span className="text-orange-200 font-black text-xs">{streak}</span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-card/50 border border-white/10 rounded-2xl p-5 mb-4">
        <p className="text-white font-bold text-lg leading-snug mb-4">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const isPicked = selected === i;
            const isRight = showResult && answerResult!.correct_answer === i;
            const isWrongPick = showResult && isPicked && !answerResult!.correct;
            return (
              <button
                key={i}
                disabled={showResult}
                onClick={() => setSelected(i)}
                className={`w-full text-left rounded-xl p-3.5 border text-sm transition-all flex items-center gap-3 ${
                  isRight ? "bg-green-500/15 border-green-500/50 text-green-200"
                  : isWrongPick ? "bg-red-500/15 border-red-500/50 text-red-200"
                  : isPicked ? "bg-purple-500/20 border-purple-400/50 text-white"
                  : "bg-white/5 border-white/10 text-white/85 hover:bg-white/10 disabled:opacity-60"
                }`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  isPicked || isRight ? "bg-white/20" : "bg-white/10"
                }`}>{String.fromCharCode(65 + i)}</span>
                <span className="flex-1">{opt}</span>
                {isRight && <Icon name="Check" size={16} className="text-green-400" />}
                {isWrongPick && <Icon name="X" size={16} className="text-red-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation after answer */}
      {showResult && answerResult!.explanation && (
        <div className={`rounded-2xl p-4 mb-4 border ${answerResult!.correct ? "bg-green-500/8 border-green-500/30" : "bg-white/5 border-white/15"}`}>
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Разбор</p>
          <p className="text-white/85 text-sm leading-snug">{answerResult!.explanation}</p>
          {answerResult!.correct && answerResult!.znaiki_gained > 0 && (
            <p className="text-amber-300 font-bold text-sm mt-2">+{answerResult!.znaiki_gained} ЗНАЕК 💎</p>
          )}
        </div>
      )}

      {/* Action */}
      {!showResult ? (
        <button
          onClick={submitAnswer}
          disabled={selected === null || submitting}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black disabled:opacity-40 transition-opacity"
        >
          {submitting ? "Проверяю…" : "Ответить"}
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black flex items-center justify-center gap-2"
        >
          {answerResult!.finished ? "Завершить олимпиаду" : "Следующая задача"}
          <Icon name="ArrowRight" size={18} />
        </button>
      )}
    </div>
  );
}
