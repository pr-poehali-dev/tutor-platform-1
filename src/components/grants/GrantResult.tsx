import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { payGrant, type GrantApplication } from "./api";
import { downloadGrantDoc } from "./downloadDoc";

interface Props {
  app: GrantApplication;
  onRestart: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "text-emerald-400" : score >= 45 ? "text-amber-400" : "text-rose-400";
  return (
    <div className="flex items-center gap-3">
      <div className={`text-4xl font-black ${color}`}>{score}</div>
      <div className="text-white/60 text-sm leading-tight">
        баллов
        <br />
        оценка шансов
      </div>
    </div>
  );
}

export default function GrantResult({ app, onRestart }: Props) {
  const { isAuthenticated, openLogin } = useAuth();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const p = app.preview;
  const full = app.full;
  const priceRub = Math.round(app.price_kopecks / 100);

  const pay = async () => {
    if (paying) return;
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setPaying(true);
    setError(null);
    const returnUrl = `${window.location.origin}/grants?paid=1&app=${app.id}`;
    const res = await payGrant(app.id, returnUrl);
    setPaying(false);
    if (res.ok && res.data) {
      if (res.data.already_paid) {
        window.location.reload();
        return;
      }
      if (res.data.confirmation_url) {
        window.location.href = res.data.confirmation_url;
        return;
      }
    }
    setError(res.error || "Не удалось начать оплату");
  };

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1">
            <Icon name="Check" size={12} /> Заявка подготовлена
          </span>
          <span className="text-white/45 text-xs">{app.grant_name}</span>
          {app.deadline && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-200 bg-amber-500/15 border border-amber-500/30 rounded-full px-2.5 py-1">
              <Icon name="CalendarClock" size={12} /> Срок подачи: {app.deadline}
            </span>
          )}
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-3">
          {p.project_title || app.project_title || "Ваш проект"}
        </h2>
        {p.annotation && <p className="text-white/75 text-sm md:text-base mb-4">{p.annotation}</p>}
        <div className="flex flex-wrap items-center gap-6">
          {p.expert_score != null && <ScoreRing score={p.expert_score} />}
          {p.expert_verdict && (
            <p className="text-white/60 text-sm max-w-md flex-1 min-w-[200px]">
              <span className="text-white/80 font-medium">Вывод эксперта: </span>
              {p.expert_verdict}
            </p>
          )}
        </div>
      </div>

      {/* Предупреждение об упрощённой генерации */}
      {p.is_fallback && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-4 flex items-start gap-3">
          <Icon name="TriangleAlert" size={18} className="text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-amber-200 font-medium text-sm mb-0.5">Черновик собран в упрощённом режиме</div>
            <p className="text-white/65 text-sm">
              ИИ не смог подготовить полноценную заявку — попробуйте сформировать её заново, добавив больше деталей о проекте.
              Оплата такого черновика недоступна.
            </p>
          </div>
        </div>
      )}

      {/* Цель */}
      {p.goal && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-white/45 text-xs uppercase tracking-wider mb-1.5">Цель проекта</div>
          <p className="text-white/85">{p.goal}</p>
        </div>
      )}

      {full ? (
        /* ---------- ОПЛАЧЕНО: полный пакет ---------- */
        <FullPackage full={full} />
      ) : (
        /* ---------- ПРЕВЬЮ: замок ---------- */
        <>
          {p.relevance_teaser && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-white/45 text-xs uppercase tracking-wider mb-1.5">Актуальность (фрагмент)</div>
              <p className="text-white/70 text-sm">{p.relevance_teaser}…</p>
            </div>
          )}
          {p.tasks_preview?.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-white/45 text-xs uppercase tracking-wider mb-2">Задачи (первые из списка)</div>
              <ul className="space-y-1.5">
                {p.tasks_preview.map((tsk, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/75 text-sm">
                    <Icon name="Dot" size={16} className="text-violet-400 mt-0.5" />
                    {tsk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Платный блок — недоступен для упрощённого (fallback) черновика */}
          {p.is_fallback ? (
            <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 md:p-8 text-center">
              <Icon name="RefreshCw" size={22} className="text-violet-300 mx-auto mb-3" />
              <p className="text-white/70 text-sm mb-5 max-w-md mx-auto">
                Полный пакет откроется, когда ИИ подготовит полноценную заявку. Добавьте деталей и попробуйте снова.
              </p>
              <button
                onClick={onRestart}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3 rounded-xl hover:scale-[1.02] transition-transform"
              >
                <Icon name="Wand2" size={16} /> Сформировать заново
              </button>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-700/30 via-fuchsia-600/15 to-cyan-700/25 p-6 md:p-8">
              <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Lock" size={18} className="text-violet-200" />
                  <h3 className="font-montserrat font-black text-xl md:text-2xl text-white">
                    Откройте полный пакет заявки
                  </h3>
                </div>
                <p className="text-white/75 text-sm md:text-base mb-4 max-w-xl">
                  ИИ уже подготовил профессиональную заявку целиком. После оплаты вы получите готовые к подаче блоки:
                </p>
                <div className="grid sm:grid-cols-2 gap-2 mb-6">
                  {p.sections_locked.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-white/80 text-sm">
                      <Icon name="CircleCheck" size={15} className="text-emerald-400 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
                {error && <p className="text-rose-300 text-sm mb-3">{error}</p>}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
                  <button
                    onClick={pay}
                    disabled={paying}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paying ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Unlock" size={18} />}
                    Открыть за {priceRub.toLocaleString("ru-RU")} ₽
                  </button>
                  <span className="text-white/45 text-xs">
                    На рынке подготовка заявки стоит от 150 000 ₽. Оплата через ЮKassa.
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white border border-white/15 px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Icon name="Plus" size={15} /> Новая заявка
        </button>
        {full && (
          <>
            <button
              onClick={() => downloadGrantDoc(app)}
              className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25 border border-emerald-500/30 px-5 py-2.5 rounded-xl transition-colors text-sm font-medium"
            >
              <Icon name="FileDown" size={15} /> Скачать в Word
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white border border-white/15 px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Icon name="Printer" size={15} /> Печать / PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <h3 className="font-montserrat font-bold text-lg text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}

function FullPackage({ full }: { full: NonNullable<GrantApplication["full"]> }) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-bold">
        <Icon name="ShieldCheck" size={16} /> Полный пакет открыт
      </div>

      {full.relevance && (
        <Section title="Актуальность и проблема">
          <p className="text-white/80 text-sm whitespace-pre-line">{full.relevance}</p>
        </Section>
      )}

      {full.tasks?.length > 0 && (
      <Section title="Задачи проекта">
        <ul className="space-y-1.5">
          {full.tasks?.map((tsk, i) => (
            <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
              <span className="w-5 h-5 rounded bg-violet-500/20 text-violet-200 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {tsk}
            </li>
          ))}
        </ul>
      </Section>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Целевая аудитория">
          <p className="text-white/80 text-sm">{full.target_audience}</p>
        </Section>
        <Section title="Социальный эффект">
          <p className="text-white/80 text-sm">{full.social_effect}</p>
        </Section>
      </div>

      {full.team?.length > 0 && (
        <Section title="Команда проекта">
          <div className="space-y-2">
            {full.team.map((m, i) => (
              <div key={i} className="flex flex-wrap gap-x-2 text-sm">
                <span className="text-white font-medium">{m.role}:</span>
                <span className="text-white/70">{m.responsibility}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {full.calendar_plan?.length > 0 && (
        <Section title="Календарный план">
          <div className="space-y-2.5">
            {full.calendar_plan.map((s, i) => (
              <div key={i} className="border-l-2 border-violet-500/40 pl-3">
                <div className="text-white text-sm font-medium">{s.stage}</div>
                <div className="text-white/50 text-xs">{s.period}</div>
                <div className="text-white/70 text-sm">{s.result}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {full.budget?.length > 0 && (
        <Section title="Смета и бюджет">
          <div className="space-y-1.5">
            {full.budget.map((b, i) => (
              <div key={i} className="flex flex-wrap items-baseline justify-between gap-2 text-sm border-b border-white/8 pb-1.5">
                <span className="text-white/85">{b.item}</span>
                <span className="text-violet-200 font-medium">{b.amount}</span>
                <span className="text-white/45 text-xs w-full">{b.justification}</span>
              </div>
            ))}
          </div>
          {full.budget_total && (
            <div className="mt-3 flex justify-between items-center text-white font-bold">
              <span>Итого:</span>
              <span className="text-emerald-300">{full.budget_total}</span>
            </div>
          )}
        </Section>
      )}

      {full.kpi?.length > 0 && (
        <Section title="Показатели результата (KPI)">
          <div className="grid sm:grid-cols-2 gap-2">
            {full.kpi.map((k, i) => (
              <div key={i} className="flex items-start gap-2 text-white/80 text-sm">
                <Icon name="Target" size={15} className="text-cyan-300 mt-0.5 flex-shrink-0" />
                {k}
              </div>
            ))}
          </div>
        </Section>
      )}

      {full.risks?.length > 0 && (
        <Section title="Риски и их минимизация">
          <div className="space-y-2">
            {full.risks.map((r, i) => (
              <div key={i} className="text-sm">
                <div className="text-amber-200/90">⚠ {r.risk}</div>
                <div className="text-white/70">→ {r.mitigation}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {full.expert_review && (
        <Section title="Разбор экспертом">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-emerald-300 text-sm font-medium mb-1.5">Сильные стороны</div>
              <ul className="space-y-1">
                {full.expert_review.strengths?.map((s, i) => (
                  <li key={i} className="text-white/75 text-sm">+ {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-amber-300 text-sm font-medium mb-1.5">Что усилить перед подачей</div>
              <ul className="space-y-1">
                {full.expert_review.weaknesses?.map((w, i) => (
                  <li key={i} className="text-white/75 text-sm">− {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {full.cover_letter && (
        <Section title="Сопроводительное письмо">
          <p className="text-white/80 text-sm whitespace-pre-line">{full.cover_letter}</p>
        </Section>
      )}
    </div>
  );
}