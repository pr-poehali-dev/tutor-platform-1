import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { McKoSet, SUBJECT_META } from "./types";
import { Answer, correctLabel, isCorrect } from "./sets";

interface Props {
  set: McKoSet;
  onExit: () => void;
}

const storeKey = (id: string) => `mcko_result_${id}`;

export function savedResult(id: string): { score: number; total: number } | null {
  try {
    const raw = localStorage.getItem(storeKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function McKoRunner({ set, onExit }: Props) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [checked, setChecked] = useState(false);
  const meta = SUBJECT_META[set.subject];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    trackGoal("mcko_start", { set: set.id });
  }, [set.id]);

  const setAnswer = (i: number, v: Answer) => {
    if (checked) return;
    setAnswers((a) => {
      const n = [...a];
      n[i] = v;
      return n;
    });
  };

  const results = useMemo(() => set.tasks.map((t, i) => isCorrect(t, answers[i])), [set, answers]);
  const score = results.filter(Boolean).length;
  const answered = set.tasks.filter((_, i) => {
    const a = answers[i];
    return a !== undefined && a !== "" && !(Array.isArray(a) && a.length === 0);
  }).length;

  const check = () => {
    setChecked(true);
    try {
      localStorage.setItem(storeKey(set.id), JSON.stringify({ score, total: set.tasks.length }));
    } catch {
      /* noop */
    }
    trackGoal("mcko_check", { set: set.id, score });
    setTimeout(() => document.getElementById("mcko-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const weakSkills = Array.from(new Set(set.tasks.filter((_, i) => !results[i]).map((t) => t.skill)));
  const pct = Math.round((score / set.tasks.length) * 100);

  return (
    <div>
      <button onClick={onExit} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4">
        <Icon name="ArrowLeft" size={15} /> Все варианты
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
          <Icon name={meta.icon} size={22} className="text-white" />
        </div>
        <div>
          <h2 className="font-montserrat font-black text-xl md:text-2xl text-white">{set.title}</h2>
          <p className="text-white/50 text-sm">{set.tasks.length} заданий · {set.grade}</p>
        </div>
      </div>

      {set.context && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-6 mb-6 md:sticky md:top-20 z-10 md:max-h-[45vh] md:overflow-y-auto backdrop-blur-xl">
          <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">{set.context.title}</p>
          {set.context.body.map((p) => (
            <p key={p.slice(0, 30)} className="text-white/85 leading-relaxed mb-2 last:mb-0">{p}</p>
          ))}
          {set.context.table && (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/[0.06]">
                  <tr>{set.context.table.head.map((h) => <th key={h} className="text-left px-3 py-2 text-white font-semibold whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {set.context.table.rows.map((r) => (
                    <tr key={r[0]} className="border-t border-white/5">
                      {r.map((c, i) => <td key={i} className="px-3 py-2 text-white/85 whitespace-nowrap">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {set.tasks.map((t, i) => {
          const ok = results[i];
          const a = answers[i];
          return (
            <div
              key={t.id}
              className={`rounded-3xl border p-5 md:p-6 ${
                checked ? (ok ? "border-emerald-400/40 bg-emerald-500/[0.06]" : "border-rose-400/40 bg-rose-500/[0.06]") : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center font-bold text-white text-sm">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-white font-medium leading-relaxed">{t.question}</p>
                  {t.type === "multi" && <p className="text-white/45 text-xs mt-1">Несколько верных ответов</p>}
                </div>
                {checked && <Icon name={ok ? "CircleCheck" : "CircleX"} size={22} className={ok ? "text-emerald-300" : "text-rose-300"} />}
              </div>

              {t.type === "input" && (
                <div className="flex items-center gap-2 pl-11">
                  <input
                    value={(a as string) || ""}
                    onChange={(e) => setAnswer(i, e.target.value)}
                    disabled={checked}
                    placeholder="Ваш ответ"
                    className="w-full max-w-xs bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-400/60 disabled:opacity-80"
                  />
                  {t.unit && <span className="text-white/60 text-sm">{t.unit}</span>}
                </div>
              )}

              {(t.type === "single" || t.type === "multi") && (
                <div className="grid sm:grid-cols-2 gap-2 pl-11">
                  {t.options.map((o, oi) => {
                    const selected = t.type === "single" ? a === oi : Array.isArray(a) && a.includes(oi);
                    const isRight = t.type === "single" ? t.correct === oi : t.correct.includes(oi);
                    return (
                      <button
                        key={o}
                        disabled={checked}
                        onClick={() => {
                          if (t.type === "single") setAnswer(i, oi);
                          else {
                            const cur = Array.isArray(a) ? a : [];
                            setAnswer(i, cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi]);
                          }
                        }}
                        className={`text-left flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm transition-colors ${
                          checked && isRight
                            ? "border-emerald-400/60 bg-emerald-500/15 text-white"
                            : checked && selected
                              ? "border-rose-400/60 bg-rose-500/15 text-white"
                              : selected
                                ? "border-violet-400/60 bg-violet-500/20 text-white"
                                : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/25"
                        }`}
                      >
                        <Icon
                          name={t.type === "multi" ? (selected ? "SquareCheck" : "Square") : selected ? "CircleDot" : "Circle"}
                          size={16}
                          className="flex-shrink-0 mt-0.5"
                        />
                        {o}
                      </button>
                    );
                  })}
                </div>
              )}

              {checked && (
                <div className="mt-4 ml-11 rounded-2xl bg-white/[0.05] border border-white/10 p-4">
                  {!ok && (
                    <p className="text-white text-sm mb-2">
                      Правильный ответ: <b className="text-emerald-300">{correctLabel(t)}</b>
                    </p>
                  )}
                  <p className="text-white/75 text-sm leading-relaxed">{t.explanation}</p>
                  <p className="text-white/40 text-xs mt-2">Навык: {t.skill}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!checked ? (
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={check}
            disabled={answered === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-2xl disabled:opacity-40"
          >
            <Icon name="ListChecks" size={18} /> Проверить ответы
          </button>
          <p className="text-white/50 text-sm">Отвечено {answered} из {set.tasks.length}</p>
        </div>
      ) : (
        <div id="mcko-result" className="mt-8 scroll-mt-24 rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/20 to-cyan-600/10 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-5 mb-4">
            <p className="font-montserrat font-black text-5xl text-white">{score}/{set.tasks.length}</p>
            <div>
              <p className="text-white font-bold text-lg">
                {pct >= 85 ? "Отличный результат!" : pct >= 60 ? "Хороший результат" : "Есть над чем поработать"}
              </p>
              <p className="text-white/60 text-sm">{pct}% верных ответов</p>
            </div>
          </div>
          {weakSkills.length > 0 && (
            <div className="mb-5">
              <p className="text-white/70 text-sm mb-2">Темы, которые стоит повторить:</p>
              <div className="flex flex-wrap gap-2">
                {weakSkills.map((s) => (
                  <span key={s} className="bg-rose-500/15 border border-rose-400/30 text-rose-100 text-xs rounded-full px-3 py-1.5">{s}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setAnswers([]);
                setChecked(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/15 text-white font-bold px-5 py-3 rounded-xl"
            >
              <Icon name="RotateCcw" size={16} /> Решить заново
            </button>
            <Link to="/tutor" className="inline-flex items-center gap-2 bg-white text-[#1a1033] font-bold px-5 py-3 rounded-xl">
              <Icon name="GraduationCap" size={16} /> Разобрать темы с ИИ-репетитором
            </Link>
            {set.subject === "reading" && (
              <Link to="/test-skorosti-chteniya" className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-white font-bold px-5 py-3 rounded-xl">
                <Icon name="Timer" size={16} /> Проверить скорость чтения
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
