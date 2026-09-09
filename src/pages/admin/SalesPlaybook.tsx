import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { SEGMENTS } from "@/components/playbook/segments";
import { ALGORITHMS } from "@/components/playbook/algorithms";
import { ROUTINE, METRICS, OBJECTIONS } from "@/components/playbook/routine";

type Tab = "segments" | "algorithms" | "routine" | "objections";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "segments", label: "Кому продаём", icon: "Users" },
  { id: "algorithms", label: "Алгоритмы поиска", icon: "Radar" },
  { id: "routine", label: "Ритм и метрики", icon: "CalendarDays" },
  { id: "objections", label: "Возражения", icon: "MessageCircleQuestion" },
];

const DIFFICULTY_TONE: Record<string, string> = {
  низкая: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  средняя: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  высокая: "bg-rose-500/15 text-rose-200 border-rose-400/30",
};

/** Внутренний регламент отдела продаж: кого искать, где искать и что говорить.
 *  Страница закрыта от индексации — это рабочий документ, не публичная страница. */
export default function SalesPlaybook() {
  const [tab, setTab] = useState<Tab>("segments");
  const [openAlgo, setOpenAlgo] = useState<string | null>(ALGORITHMS[0].id);
  const [openSeg, setOpenSeg] = useState<string | null>(SEGMENTS[0].id);

  return (
    <div className="min-h-screen bg-background text-white">
      <Helmet>
        <title>Стратегия поиска заказчиков — внутренний регламент</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-white/45 hover:text-white text-sm mb-4 transition-colors"
          >
            <Icon name="ArrowLeft" size={14} aria-hidden="true" />
            Админ-хаб
          </Link>
          <p className="text-white/40 text-[11px] uppercase tracking-widest mb-1.5">
            Внутренний документ · не для публикации
          </p>
          <h1 className="font-montserrat font-black text-2xl md:text-4xl leading-tight mb-3">
            Стратегия поиска заказчиков
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-3xl leading-relaxed">
            Шесть сегментов, пять алгоритмов и ритм работы отдела. Документ рабочий: открываем
            каждое утро, ведём по нему день и правим по итогам месяца — если цифры не сходятся,
            меняем алгоритм, а не увеличиваем нагрузку.
          </p>
        </div>
      </header>

      <nav className="border-b border-white/10 bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-purple-400 text-white"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              <Icon name={t.icon} size={16} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {tab === "segments" && (
          <section aria-label="Сегменты заказчиков">
            <p className="text-white/55 text-sm mb-6 max-w-3xl">
              Сегменты отсортированы по приоритету. Начинаем с первого приоритета: там короткий
              цикл сделки и низкий порог входа. Крупные сделки ведём параллельно — они дольше.
            </p>

            <div className="space-y-3">
              {SEGMENTS.map((s) => {
                const open = openSeg === s.id;
                return (
                  <article key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                    <button
                      onClick={() => setOpenSeg(open ? null : s.id)}
                      aria-expanded={open}
                      className="w-full flex items-start gap-3.5 p-5 text-left hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                        <Icon name={s.icon} size={19} className="text-purple-300" aria-hidden="true" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-montserrat font-black text-base md:text-lg">{s.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/8 text-white/50">
                            приоритет {s.priority}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${DIFFICULTY_TONE[s.difficulty]}`}>
                            сложность {s.difficulty}
                          </span>
                        </span>
                        <span className="block text-white/50 text-sm leading-relaxed">{s.who}</span>
                      </span>
                      <Icon
                        name="ChevronDown"
                        size={18}
                        aria-hidden="true"
                        className={`text-white/35 flex-shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
                      <div className="px-5 pb-5 pt-1 space-y-4 animate-fade-in">
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="rounded-xl bg-rose-500/[0.07] border border-rose-500/20 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-200/80 mb-1.5">Боль</p>
                            <p className="text-white/70 text-sm leading-relaxed">{s.pain}</p>
                          </div>
                          <div className="rounded-xl bg-cyan-500/[0.07] border border-cyan-500/20 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-200/80 mb-1.5">Что предлагаем</p>
                            <p className="text-white/70 text-sm leading-relaxed">{s.offer}</p>
                          </div>
                          <div className="rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/80 mb-1.5">Деньги</p>
                            <p className="text-white/70 text-sm leading-relaxed">{s.money}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                              <Icon name="Search" size={15} className="text-purple-300" aria-hidden="true" />
                              Где искать
                            </h3>
                            <ul className="space-y-1.5">
                              {s.where.map((w, i) => (
                                <li key={i} className="text-white/60 text-sm leading-relaxed flex gap-2">
                                  <span className="text-purple-400/60 flex-shrink-0">→</span>
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                              <Icon name="Zap" size={15} className="text-amber-300" aria-hidden="true" />
                              Признаки, что клиент созрел
                            </h3>
                            <ul className="space-y-1.5">
                              {s.signals.map((sig, i) => (
                                <li key={i} className="text-white/60 text-sm leading-relaxed flex gap-2">
                                  <span className="text-amber-400/60 flex-shrink-0">•</span>
                                  {sig}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/12 bg-white/[0.04] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-white/45 mb-1.5">
                            Первая фраза при контакте
                          </p>
                          <p className="text-white/80 text-sm leading-relaxed italic">«{s.hook}»</p>
                        </div>

                        {s.tool && (
                          <Link
                            to={s.tool.path}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                          >
                            <Icon name="ExternalLink" size={15} aria-hidden="true" />
                            Работать здесь: {s.tool.label}
                          </Link>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {tab === "algorithms" && (
          <section aria-label="Алгоритмы поиска">
            <p className="text-white/55 text-sm mb-6 max-w-3xl">
              Пошаговые сценарии. Каждый шаг — с временем и результатом, чтобы день планировался
              по факту, а не на глаз.
            </p>

            <div className="space-y-3">
              {ALGORITHMS.map((a) => {
                const open = openAlgo === a.id;
                return (
                  <article key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                    <button
                      onClick={() => setOpenAlgo(open ? null : a.id)}
                      aria-expanded={open}
                      className="w-full flex items-start gap-3.5 p-5 text-left hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                        <Icon name={a.icon} size={19} className="text-cyan-300" aria-hidden="true" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-montserrat font-black text-base md:text-lg mb-1">{a.name}</span>
                        <span className="block text-white/45 text-xs mb-1.5">{a.segment}</span>
                        <span className="block text-white/60 text-sm leading-relaxed">{a.when}</span>
                      </span>
                      <Icon
                        name="ChevronDown"
                        size={18}
                        aria-hidden="true"
                        className={`text-white/35 flex-shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
                      <div className="px-5 pb-5 pt-1 space-y-4 animate-fade-in">
                        <div className="rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/80 mb-1.5">
                            Чего ждём
                          </p>
                          <p className="text-white/75 text-sm leading-relaxed">{a.expect}</p>
                        </div>

                        <ol className="space-y-3">
                          {a.steps.map((st, i) => (
                            <li key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                              <div className="flex items-start gap-3 mb-2.5">
                                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-200 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-white text-sm">{st.title}</h3>
                                  <p className="text-white/40 text-xs mt-0.5">{st.time}</p>
                                </div>
                              </div>
                              <ul className="space-y-1.5 mb-2.5 pl-9">
                                {st.actions.map((act, j) => (
                                  <li key={j} className="text-white/65 text-sm leading-relaxed flex gap-2">
                                    <span className="text-white/25 flex-shrink-0">—</span>
                                    {act}
                                  </li>
                                ))}
                              </ul>
                              <p className="pl-9 text-xs text-emerald-300/80 flex items-start gap-1.5">
                                <Icon name="CircleCheck" size={13} className="mt-px flex-shrink-0" aria-hidden="true" />
                                Результат: {st.output}
                              </p>
                            </li>
                          ))}
                        </ol>

                        <div className="rounded-xl bg-rose-500/[0.07] border border-rose-500/20 p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-200/80 mb-2">
                            Так делать нельзя
                          </p>
                          <ul className="space-y-1.5">
                            {a.mistakes.map((m, i) => (
                              <li key={i} className="text-white/65 text-sm leading-relaxed flex gap-2">
                                <Icon name="X" size={14} className="text-rose-400/70 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {tab === "routine" && (
          <section aria-label="Ритм работы и метрики" className="space-y-8">
            <div>
              <h2 className="font-montserrat font-black text-xl mb-1">Ритм работы</h2>
              <p className="text-white/55 text-sm mb-5 max-w-3xl">
                Без регулярности алгоритмы не работают. Это распорядок, который держит воронку
                наполненной.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {ROUTINE.map((r) => (
                  <article key={r.period} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="font-bold text-base mb-3.5 flex items-center gap-2">
                      <Icon name={r.icon} size={17} className="text-amber-300" aria-hidden="true" />
                      {r.period}
                    </h3>
                    <ul className="space-y-2.5">
                      {r.tasks.map((t, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-4 h-4 rounded border border-white/20 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-white/75 text-sm leading-snug">{t.task}</span>
                            <span className="text-white/35 text-xs">
                              {t.time}
                              {t.where && (
                                <>
                                  {" · "}
                                  <Link to={t.where} className="text-cyan-400/70 hover:text-cyan-300">
                                    открыть
                                  </Link>
                                </>
                              )}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-montserrat font-black text-xl mb-1">Что считаем</h2>
              <p className="text-white/55 text-sm mb-5 max-w-3xl">
                Если показатель проседает — правим конкретный этап, а не работаем больше.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {METRICS.map((m) => (
                  <article key={m.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <h3 className="font-bold text-sm text-white">{m.name}</h3>
                      <span className="font-montserrat font-black text-lg text-emerald-300 whitespace-nowrap">
                        {m.target}
                      </span>
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed">{m.why}</p>
                    {m.where && (
                      <Link
                        to={m.where}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400/80 hover:text-cyan-300 mt-2"
                      >
                        <Icon name="ExternalLink" size={12} aria-hidden="true" />
                        Смотреть в системе
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "objections" && (
          <section aria-label="Работа с возражениями">
            <p className="text-white/55 text-sm mb-6 max-w-3xl">
              Возражение — это не отказ, а нераскрытое сомнение. Задача не переспорить, а понять,
              что стоит за словами.
            </p>
            <div className="space-y-3">
              {OBJECTIONS.map((o, i) => (
                <article key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-bold text-white text-sm mb-2.5 flex items-start gap-2.5">
                    <Icon name="Quote" size={16} className="text-rose-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    «{o.text}»
                  </p>
                  <p className="text-white/65 text-sm leading-relaxed pl-[26px]">{o.answer}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
