import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import { STAGES, stageReady, visibleFields } from "@/components/bizlab/stages";
import { BizAnswers, BizField } from "@/components/bizlab/types";
import { buildVerdict, calcMetrics, fmt } from "@/components/bizlab/calc";
import VerdictView from "@/components/bizlab/VerdictView";
import BoardView from "@/components/bizlab/BoardView";
import { localBoard } from "@/components/bizlab/localBoard";

const SITE_URL = "https://учисьпро.рф";
const LS_KEY = "bizlab_answers_v1";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Что делает тренажёр БИЗНЕС 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Вы проходите 8 этапов планирования бизнеса и вводите свои цифры. Сервис считает юнит-экономику, точку безубыточности, запас прочности и проводит стресс-тест — что будет, если продажи упадут на 40%. На выходе — честная оценка жизнеспособности и разбор от ИИ-совета директоров.",
      },
    },
    {
      "@type": "Question",
      name: "Это бесплатно?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да, полностью бесплатно и без регистрации. Все расчёты, вердикт и разбор экспертов доступны сразу.",
      },
    },
    {
      "@type": "Question",
      name: "Чем это отличается от бизнес-курсов?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Здесь нет мотивации и обещаний лёгкого успеха. Задача сервиса — уберечь от потери денег: показать на ваших цифрах, где план не сходится, и отговорить от кредита, если модель его не выдержит.",
      },
    },
  ],
};

type Stage = "intro" | "form" | "result";

export default function BizLab() {
  const [stage, setStage] = useState<Stage>("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<BizAnswers>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const step = STAGES[stepIdx];
  const metrics = useMemo(() => calcMetrics(answers), [answers]);
  const verdict = useMemo(() => buildVerdict(metrics, answers), [metrics, answers]);
  const review = useMemo(
    () => localBoard(metrics, answers, verdict.score),
    [metrics, answers, verdict.score],
  );

  const set = (key: string, value: string) => {
    setAnswers((a) => {
      const next = { ...a, [key]: value };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {
        /* приватный режим — просто не сохраняем */
      }
      return next;
    });
  };

  const ready = stageReady(step, answers);

  const next = () => {
    if (stepIdx < STAGES.length - 1) {
      setStepIdx(stepIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStage("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStage("intro");
    }
  };

  const restart = () => {
    setAnswers({});
    setStepIdx(0);
    setStage("intro");
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="БИЗНЕС 2026 — проверьте свою бизнес-идею на прочность бесплатно"
        description="Виртуальное моделирование бизнеса: 8 этапов, честный расчёт юнит-экономики, точки безубыточности и стресс-тест. ИИ-совет директоров разберёт план и убережёт от дорогих ошибок. Бесплатно, без регистрации."
        canonical={`${SITE_URL}/bizlab`}
        keywords="бизнес план расчет, открыть свое дело, юнит экономика, точка безубыточности, стоит ли брать кредит на бизнес, проверить бизнес идею, финансовая модель бизнеса, бизнес 2026"
        jsonLd={[FAQ_JSON_LD]}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-lg">
              🏗️
            </div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          {stage !== "intro" && (
            <button
              onClick={restart}
              className="text-white/50 hover:text-white text-sm font-bold transition-colors"
            >
              Начать заново
            </button>
          )}
        </div>
        {stage === "form" && (
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${((stepIdx + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: "Главная", href: "/" }, { label: "БИЗНЕС 2026" }]}
        />

        {stage === "intro" && <Intro onStart={() => setStage("form")} hasDraft={Object.keys(answers).length > 3} />}

        {stage === "form" && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-white/45 mb-3">
                <span>
                  Этап {step.index} из {STAGES.length}
                </span>
                <span>{Math.round((stepIdx / STAGES.length) * 100)}%</span>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <span className="text-4xl shrink-0">{step.emoji}</span>
                <div>
                  <h1 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight">
                    {step.title}
                  </h1>
                  <p className="text-white/55">{step.subtitle}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/8 p-4 mb-3">
                <div className="flex gap-2.5">
                  <Icon name="Info" size={16} className="text-cyan-300 shrink-0 mt-0.5" />
                  <p className="text-white/80 text-sm">{step.why}</p>
                </div>
              </div>

              {step.trap && (
                <div className="rounded-2xl border border-rose-500/25 bg-rose-500/8 p-4">
                  <div className="flex gap-2.5">
                    <Icon name="TriangleAlert" size={16} className="text-rose-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-rose-200 text-xs font-bold uppercase tracking-wide block mb-1">
                        Здесь ошибаются чаще всего
                      </span>
                      <p className="text-white/80 text-sm">{step.trap}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7 space-y-4">
              {visibleFields(step, answers).map((f) => (
                <Field key={f.key} field={f} value={answers[f.key] || ""} onSet={set} />
              ))}
            </div>

            {/* Живой расчёт — человек сразу видит последствия своих цифр */}
            {stepIdx >= 2 && metrics.unitMargin !== 0 && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-white/45 text-xs font-bold uppercase tracking-wide mb-2.5">
                  Считаем на лету
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-white/40 text-xs">Маржа с продажи</div>
                    <div
                      className={`font-bold ${metrics.unitMargin > 0 ? "text-emerald-300" : "text-rose-300"}`}
                    >
                      {fmt(metrics.unitMargin)} ₽
                    </div>
                  </div>
                  {stepIdx >= 4 && (
                    <>
                      <div>
                        <div className="text-white/40 text-xs">Нужно продаж</div>
                        <div className="font-bold text-white">
                          {Number.isFinite(metrics.breakEvenUnits) ? fmt(metrics.breakEvenUnits) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">Прибыль/мес</div>
                        <div
                          className={`font-bold ${metrics.plannedProfit > 0 ? "text-emerald-300" : "text-rose-300"}`}
                        >
                          {fmt(metrics.plannedProfit)} ₽
                        </div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">Запас прочности</div>
                        <div
                          className={`font-bold ${metrics.safetyMarginPct >= 30 ? "text-emerald-300" : metrics.safetyMarginPct >= 0 ? "text-amber-300" : "text-rose-300"}`}
                        >
                          {metrics.safetyMarginPct.toFixed(0)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={back}
                className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm px-4 py-3.5 rounded-xl border border-white/10 transition-colors"
              >
                <Icon name="ChevronLeft" size={16} /> Назад
              </button>
              <button
                onClick={next}
                disabled={!ready}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform"
              >
                {stepIdx === STAGES.length - 1 ? (
                  <>
                    <Icon name="Gauge" size={18} /> Проверить жизнеспособность
                  </>
                ) : (
                  <>
                    Далее <Icon name="ChevronRight" size={18} />
                  </>
                )}
              </button>
            </div>
            {!ready && (
              <p className="text-white/35 text-xs text-center mt-3">
                Заполните все поля — от них зависит точность расчёта
              </p>
            )}
          </div>
        )}

        {stage === "result" && (
          <div className="space-y-8">
            <VerdictView verdict={verdict} m={metrics} />

            <BoardView r={review} />

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-montserrat font-black text-lg text-white mb-3">Что дальше</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/mini-course/business-2026"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors group"
                >
                  <span className="text-2xl">📚</span>
                  <div className="min-w-0">
                    <div className="font-bold text-white group-hover:text-primary transition-colors">
                      Курс «БИЗНЕС 2026»
                    </div>
                    <div className="text-white/50 text-sm">Налоги, найм, договоры, учёт</div>
                  </div>
                </Link>
                <Link
                  to="/fin-advisor"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors group"
                >
                  <span className="text-2xl">💰</span>
                  <div className="min-w-0">
                    <div className="font-bold text-white group-hover:text-primary transition-colors">
                      Финансовый консультант
                    </div>
                    <div className="text-white/50 text-sm">Разбор действующего бизнеса</div>
                  </div>
                </Link>
              </div>
              <button
                onClick={restart}
                className="mt-4 w-full rounded-xl border border-white/10 py-3 text-white/60 hover:text-white hover:bg-white/5 text-sm font-bold transition-colors"
              >
                Пересчитать с другими цифрами
              </button>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({
  field,
  value,
  onSet,
}: {
  field: BizField;
  value: string;
  onSet: (k: string, v: string) => void;
}) {
  const base =
    "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-amber-500/50 transition-colors";

  return (
    <div>
      <label className="block text-white/85 text-sm font-semibold mb-1">
        {field.label}
        {field.optional && <span className="text-white/35 font-normal"> — необязательно</span>}
      </label>
      {field.hint && <p className="text-white/40 text-xs mb-2 leading-snug">{field.hint}</p>}

      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onSet(field.key, e.target.value)}
          className={`${base} appearance-none`}
        >
          <option value="" className="bg-[#140f28]">
            Выберите…
          </option>
          {field.options!.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#140f28]">
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onSet(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          className={`${base} resize-y`}
        />
      ) : field.type === "number" ? (
        <div className="relative">
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => onSet(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`${base} pr-16`}
          />
          {field.suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              {field.suffix}
            </span>
          )}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onSet(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      )}
    </div>
  );
}

function Intro({ onStart, hasDraft }: { onStart: () => void; hasDraft: boolean }) {
  const blocks = [
    {
      icon: "Calculator",
      title: "Считает честно",
      text: "Юнит-экономика, точка безубыточности, запас прочности, окупаемость — по вашим цифрам, без округлений в приятную сторону.",
    },
    {
      icon: "ShieldAlert",
      title: "Проверяет на прочность",
      text: "Стресс-тест: что будет, если продажи упадут на 40%. И отдельно — выдержит ли бизнес платёж по кредиту.",
    },
    {
      icon: "Users",
      title: "Совет директоров",
      text: "Финансист, маркетолог, операционист, юрист и скептик разбирают план каждый со своей стороны — по вашим цифрам.",
    },
  ];

  const kills = [
    "Продукт, который никто не купил до вложений",
    "Кредит под модель, которая его не тянет",
    "Забытые налоги и взносы: минус 30% сверх зарплат",
    "Оптимистичный план продаж без обоснования",
    "Нулевая подушка: закрылись на третий месяц",
    "Своя зарплата не заложена — работа в минус",
  ];

  return (
    <div>
      <div className="text-center mb-9">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-amber-200 bg-amber-500/15 border border-amber-500/25 rounded-lg px-3 py-1 mb-4">
          <Icon name="Gift" size={14} /> Бесплатно · без регистрации
        </span>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.05] mb-4">
          БИЗНЕС 2026:{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            проверьте идею до того, как вложили деньги
          </span>
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
          Пройдите 8 этапов виртуального моделирования — и увидите, выживет ли ваш бизнес на бумаге.
          Здесь не продают мечту и не мотивируют. Задача одна: показать реальные цифры и уберечь от
          ошибок, которые стоят квартиры.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {blocks.map((b, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3">
              <Icon name={b.icon} size={20} className="text-amber-300" />
            </div>
            <h3 className="font-bold text-white mb-1">{b.title}</h3>
            <p className="text-white/55 text-sm">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-rose-500/25 bg-rose-500/8 p-6 mb-8">
        <h2 className="font-montserrat font-black text-xl text-white mb-1.5 flex items-center gap-2">
          <Icon name="TriangleAlert" size={20} className="text-rose-300" />
          Почему закрываются молодые бизнесы
        </h2>
        <p className="text-white/60 text-sm mb-4">
          Почти всегда — не из-за конкурентов, а из-за ошибок, которые видно на бумаге заранее:
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {kills.map((k, i) => (
            <div key={i} className="flex gap-2.5 text-white/75 text-sm">
              <Icon name="X" size={15} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{k}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8">
        <h2 className="font-montserrat font-black text-lg text-white mb-4">8 этапов моделирования</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {STAGES.map((s) => (
            <div key={s.id} className="flex gap-3">
              <span className="text-2xl shrink-0">{s.emoji}</span>
              <div className="min-w-0">
                <div className="font-bold text-white text-sm">
                  {s.index}. {s.title}
                </div>
                <div className="text-white/45 text-xs">{s.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-600/15 to-orange-500/10 p-6 md:p-8 text-center">
        <p className="text-white/80 mb-1">Полный расчёт и разбор экспертов</p>
        <div className="font-montserrat font-black text-3xl text-white mb-1">бесплатно</div>
        <p className="text-white/45 text-xs mb-5">
          Без регистрации и карты. Ответы сохраняются в браузере — можно вернуться и дозаполнить.
        </p>
        <button
          onClick={onStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="Rocket" size={18} />
          {hasDraft ? "Продолжить расчёт" : "Начать моделирование"}
        </button>
        <p className="text-white/35 text-xs mt-4">
          Займёт 15-20 минут. Приготовьте примерные цифры по ценам и расходам.
        </p>
      </div>
    </div>
  );
}