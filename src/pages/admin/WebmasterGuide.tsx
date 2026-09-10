import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { WEBMASTER_PLAN, WM_TIMELINE } from "@/components/playbook/webmaster";

/** Инструкция по Яндекс.Вебмастеру после публикации SEO-правок.
 *  Внутренний документ, от индексации закрыт. */
export default function WebmasterGuide() {
  const [open, setOpen] = useState<string | null>(WEBMASTER_PLAN[0].id);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const toggleDone = (key: string) =>
    setDone((d) => ({ ...d, [key]: !d[key] }));

  const totalSteps = WEBMASTER_PLAN.reduce((n, b) => n + b.steps.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-white">
      <Helmet>
        <title>Инструкция: Яндекс.Вебмастер — внутренний документ</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-5 py-6">
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
            Что сделать в Яндекс.Вебмастере
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-3xl leading-relaxed mb-5">
            Пять шагов после публикации, чтобы поиск быстрее увидел 88 витрин курсов
            и остальные страницы. Идите по порядку — каждый шаг опирается на предыдущий.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                  style={{ width: `${(doneCount / totalSteps) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-white/45 text-xs whitespace-nowrap">
              {doneCount} из {totalSteps} шагов
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        <a
          href="https://webmaster.yandex.ru"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity mb-7"
        >
          <Icon name="ExternalLink" size={15} aria-hidden="true" />
          Открыть Яндекс.Вебмастер
        </a>

        <div className="space-y-3 mb-10">
          {WEBMASTER_PLAN.map((b) => {
            const isOpen = open === b.id;
            return (
              <article key={b.id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : b.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-start gap-3.5 p-5 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon name={b.icon} size={19} className="text-purple-300" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-montserrat font-black text-base md:text-lg mb-1">
                      {b.name}
                    </span>
                    <span className="block text-white/50 text-sm leading-relaxed">{b.when}</span>
                  </span>
                  <Icon
                    name="ChevronDown"
                    size={18}
                    aria-hidden="true"
                    className={`text-white/35 flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 space-y-3 animate-fade-in">
                    {b.steps.map((s, i) => {
                      const key = `${b.id}-${i}`;
                      const isDone = !!done[key];
                      return (
                        <div
                          key={key}
                          className={`rounded-xl border p-4 transition-colors ${
                            isDone
                              ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-2.5">
                            <button
                              onClick={() => toggleDone(key)}
                              aria-pressed={isDone}
                              aria-label={isDone ? "Отменить отметку" : "Отметить выполненным"}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                isDone
                                  ? "bg-emerald-500/30 border-emerald-400/50"
                                  : "border-white/25 hover:border-white/50"
                              }`}
                            >
                              {isDone && <Icon name="Check" size={12} className="text-emerald-200" aria-hidden="true" />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white text-sm">{s.title}</h3>
                              {s.where && (
                                <p className="text-cyan-300/70 text-xs mt-0.5 flex items-center gap-1.5">
                                  <Icon name="MapPin" size={11} aria-hidden="true" />
                                  {s.where}
                                </p>
                              )}
                            </div>
                          </div>

                          <ul className="space-y-1.5 mb-3 pl-8">
                            {s.actions.map((a, j) => (
                              <li key={j} className="text-white/65 text-sm leading-relaxed flex gap-2">
                                <span className="text-white/25 flex-shrink-0">—</span>
                                {a}
                              </li>
                            ))}
                          </ul>

                          <p className="pl-8 text-xs text-emerald-300/85 flex items-start gap-1.5 mb-2">
                            <Icon name="CircleCheck" size={13} className="mt-px flex-shrink-0" aria-hidden="true" />
                            <span className="leading-relaxed">{s.result}</span>
                          </p>

                          {s.pitfall && (
                            <p className="pl-8 text-xs text-amber-200/80 flex items-start gap-1.5">
                              <Icon name="TriangleAlert" size={13} className="mt-px flex-shrink-0" aria-hidden="true" />
                              <span className="leading-relaxed">{s.pitfall}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <section aria-labelledby="timeline">
          <h2 id="timeline" className="font-montserrat font-black text-xl mb-1">
            Чего ждать и когда
          </h2>
          <p className="text-white/50 text-sm mb-4 max-w-2xl">
            Индексация — небыстрый процесс. Эти сроки помогут не делать поспешных выводов
            на третий день.
          </p>
          <div className="space-y-2">
            {WM_TIMELINE.map((t) => (
              <div
                key={t.period}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="font-montserrat font-black text-sm text-purple-300 whitespace-nowrap sm:w-28">
                  {t.period}
                </span>
                <span className="text-white/65 text-sm leading-relaxed">{t.what}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
