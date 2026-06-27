import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

type AnswerMap = Record<string, string>;

interface Question {
  id: string;
  title: string;
  options: { value: string; label: string; icon: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "team",
    title: "Сколько человек обрабатывают заявки?",
    options: [
      { value: "solo", label: "Только я сам", icon: "User" },
      { value: "small", label: "2–5 человек", icon: "Users" },
      { value: "team", label: "Больше 5", icon: "Building2" },
    ],
  },
  {
    id: "source",
    title: "Откуда приходит больше всего заявок?",
    options: [
      { value: "site", label: "Сайт / форма", icon: "Globe" },
      { value: "messengers", label: "Мессенджеры и соцсети", icon: "MessageCircle" },
      { value: "calls", label: "Звонки и сарафан", icon: "Phone" },
    ],
  },
  {
    id: "pain",
    title: "Что болит сильнее всего?",
    options: [
      { value: "lost", label: "Заявки теряются", icon: "AlertTriangle" },
      { value: "forget", label: "Забываем перезвонить", icon: "BellOff" },
      { value: "blind", label: "Не вижу, что работает", icon: "EyeOff" },
    ],
  },
];

interface Recommendation {
  icon: string;
  title: string;
  desc: string;
}

const ALL: Record<string, Recommendation> = {
  crm: {
    icon: "Workflow",
    title: "Связка «Заявка → CRM → Задача»",
    desc: "Все обращения автоматически попадают в одно окно, менеджеру ставится задача с дедлайном. Ничего не теряется.",
  },
  reminders: {
    icon: "Mail",
    title: "Авто-напоминания клиентам",
    desc: "Сценарий «если клиент не ответил → напомнить» возвращает остывших лидов без ручной работы.",
  },
  analytics: {
    icon: "BarChart3",
    title: "Дашборд из 3 метрик",
    desc: "Лиды, конверсия и средний чек в одном экране — видно, какой канал реально приносит деньги.",
  },
  routing: {
    icon: "GitBranch",
    title: "Авто-распределение по менеджерам",
    desc: "Заявка сразу уходит свободному ответственному — никто не сидит без работы и не перегружен.",
  },
};

function recommend(a: AnswerMap): string[] {
  const set = new Set<string>();
  // База: почти всем нужна основная связка
  set.add("crm");
  if (a.pain === "forget" || a.source === "messengers") set.add("reminders");
  if (a.pain === "blind" || a.source === "site") set.add("analytics");
  if (a.team === "small" || a.team === "team") set.add("routing");
  if (a.pain === "lost") set.add("reminders");
  // Ограничим до 3 самых релевантных
  return Array.from(set).slice(0, 3);
}

interface Props {
  onStart?: () => void;
}

export default function ConnectionCalculator({ onStart }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const done = step >= QUESTIONS.length;

  const recs = useMemo(() => (done ? recommend(answers) : []), [done, answers]);

  const pick = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setStep((s) => s + 1);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const progress = Math.min(step, QUESTIONS.length) / QUESTIONS.length;

  return (
    <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-6 md:p-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 mb-3">
        <Icon name="Calculator" size={14} className="text-cyan-300" />
        <span className="text-cyan-300 text-xs font-bold uppercase tracking-wide">Подбор за 30 секунд</span>
      </div>
      <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
        Какие связки нужны именно твоему бизнесу?
      </h2>
      <p className="text-white/60 mb-6 max-w-2xl">
        Ответь на 3 вопроса — покажу персональную карту автоматизации, которую соберёшь на интенсиве.
      </p>

      {/* Прогресс */}
      {!done && (
        <div className="h-1.5 rounded-full bg-white/10 mb-6 overflow-hidden max-w-md">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {!done ? (
        <div key={step} className="animate-fade-in">
          <div className="text-white/40 text-xs font-semibold mb-2">
            Вопрос {step + 1} из {QUESTIONS.length}
          </div>
          <h3 className="font-montserrat font-bold text-lg md:text-xl text-white mb-4">
            {QUESTIONS[step].title}
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {QUESTIONS[step].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => pick(QUESTIONS[step].id, opt.value)}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-cyan-500/40 hover:bg-cyan-500/[0.06] transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
                  <Icon name={opt.icon} size={18} className="text-cyan-300" />
                </div>
                <span className="text-white/85 text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Sparkles" size={18} className="text-cyan-300" />
            <h3 className="font-montserrat font-black text-lg md:text-xl text-white">
              Твоя карта автоматизации готова
            </h3>
          </div>
          <div className="space-y-3 mb-6">
            {recs.map((key, i) => {
              const r = ALL[key];
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 animate-fade-in"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon name={r.icon} size={18} className="text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="font-montserrat font-bold text-white text-sm mb-0.5">{r.title}</h4>
                    <p className="text-white/60 text-sm">{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <Icon name="Rocket" size={18} />
              Собрать эти связки на интенсиве
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm transition-colors"
            >
              <Icon name="RotateCcw" size={15} />
              Пройти заново
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
