import { useState } from "react";
import Icon from "@/components/ui/icon";
import { resourcePlan, ResourcePlan, ResourceItem, Track } from "./api";
import { trackGoal } from "@/components/analytics/YandexMetrika";

interface Props {
  roleTitle?: string;
  brief?: string;
  track?: Track | null;
  onBack: () => void;
  onHire: (item: ResourceItem) => void;
  onAskAI: (item: ResourceItem) => void;
}

const MODE_META: Record<string, { label: string; icon: string; cls: string; badge: string }> = {
  self: { label: "Своими силами", icon: "Users", cls: "border-emerald-400/25 bg-emerald-500/[0.05]", badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
  ai: { label: "Силами ИИ", icon: "Bot", cls: "border-cyan-400/25 bg-cyan-500/[0.05]", badge: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30" },
  external: { label: "Нужен внешний спец", icon: "UserSearch", cls: "border-violet-400/30 bg-violet-500/[0.06]", badge: "bg-violet-500/15 text-violet-200 border-violet-400/30" },
};

export default function ResourcePlanner({ roleTitle = "", brief = "", track, onBack, onHire, onAskAI }: Props) {
  // Предзаполняем задачи из трека, если есть
  const initial =
    track?.tasks?.map((t) => t.title).filter(Boolean).join("\n") || "";
  const [raw, setRaw] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ResourcePlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const tasks = raw.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 20);
    if (tasks.length === 0) {
      setError("Добавьте хотя бы одну задачу");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await resourcePlan(roleTitle, brief, tasks);
    setLoading(false);
    if (!res.ok || !res.plan) {
      setError(res.message || "Не удалось собрать раскладку");
      return;
    }
    setPlan(res.plan);
    trackGoal("orchestrator_resource_plan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center min-h-[280px] flex flex-col items-center justify-center">
        <Icon name="Loader2" size={32} className="text-violet-300 animate-spin mb-4" />
        <h3 className="font-montserrat font-black text-xl text-white mb-2">Распределяем задачи…</h3>
        <p className="text-white/55 text-sm max-w-sm">
          Смотрим, что закрыть своими силами, что — с помощью ИИ, а для чего нужен внешний специалист.
        </p>
      </div>
    );
  }

  if (plan) {
    return <PlanResult plan={plan} onHire={onHire} onAskAI={onAskAI} onRedo={() => setPlan(null)} onBack={onBack} />;
  }

  return (
    <div>
      <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-4 inline-flex items-center gap-1">
        <Icon name="ChevronLeft" size={16} /> Назад
      </button>
      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="Split" size={13} /> Планировщик ресурсов
        </span>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1">
          Что сделать самим, а кого — нанять
        </h2>
        <p className="text-white/55 text-sm">
          Перечислите задачи проекта (по одной на строку). ИИ решит, что закрыть своими силами, что — нейросетью,
          а для чего нужен внешний исполнитель, и соберёт под него готовую вакансию.
        </p>
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={"Например:\nНаписать тексты для лендинга\nСверстать страницу на React\nНастроить рекламу\nСделать логотип"}
        rows={7}
        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50 resize-y"
      />
      {track && initial && (
        <p className="text-white/40 text-xs mt-2">
          <Icon name="Info" size={12} className="inline mr-1" /> Задачи подставлены из сгенерированного трека — можно править.
        </p>
      )}
      {error && <div className="text-rose-300 text-sm mt-3">{error}</div>}

      <button
        onClick={run}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-4 rounded-xl hover:scale-[1.01] transition-transform"
      >
        <Icon name="Sparkles" size={18} /> Распределить задачи
      </button>
    </div>
  );
}

function PlanResult({
  plan, onHire, onAskAI, onRedo, onBack,
}: {
  plan: ResourcePlan;
  onHire: (item: ResourceItem) => void;
  onAskAI: (item: ResourceItem) => void;
  onRedo: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="Split" size={13} /> Раскладка ресурсов
        </span>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Как закрыть проект быстрее</h2>
        {plan.summary && <p className="text-white/70 text-sm md:text-base mt-2 max-w-2xl mx-auto">{plan.summary}</p>}
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-3 gap-2">
        <Stat icon="Users" label="Своими силами" value={plan.self_count} color="text-emerald-300" />
        <Stat icon="Bot" label="Силами ИИ" value={plan.ai_count} color="text-cyan-300" />
        <Stat icon="UserSearch" label="Внешний спец" value={plan.external_count} color="text-violet-300" />
      </div>

      {/* Задачи */}
      <div className="space-y-3">
        {plan.items.map((it, i) => (
          <TaskCard key={i} item={it} onHire={onHire} onAskAI={onAskAI} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button onClick={onRedo} className="flex-1 inline-flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl border border-white/15 hover:border-violet-400/50 transition-colors">
          <Icon name="RotateCcw" size={17} /> Другой список задач
        </button>
        <button onClick={onBack} className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform">
          <Icon name="LayoutDashboard" size={17} /> К треку и дашборду
        </button>
      </div>
      <p className="text-white/30 text-[11px] text-center">
        Оценки цены и сроков ориентировочные. Уточняйте у конкретных исполнителей.
      </p>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <Icon name={icon} size={18} className={`${color} mx-auto mb-1`} />
      <div className={`font-montserrat font-black text-2xl ${color}`}>{value}</div>
      <div className="text-white/45 text-[11px]">{label}</div>
    </div>
  );
}

function TaskCard({ item, onHire, onAskAI }: { item: ResourceItem; onHire: (item: ResourceItem) => void; onAskAI: (item: ResourceItem) => void }) {
  const [open, setOpen] = useState(false);
  const m = MODE_META[item.mode] || MODE_META.self;

  return (
    <div className={`rounded-2xl border p-4 ${m.cls}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-semibold text-[15px]">{item.task}</div>
          {item.reason && <p className="text-white/55 text-xs mt-1">{item.reason}</p>}
        </div>
        <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg border px-2 py-1 ${m.badge}`}>
          <Icon name={m.icon} size={12} /> {m.label}
        </span>
      </div>

      {item.mode === "ai" && (
        <div className="mt-2">
          {item.ai_hint && (
            <div className="flex items-start gap-2 text-sm text-cyan-100/85 bg-cyan-500/[0.06] border border-cyan-400/15 rounded-lg px-3 py-2 mb-2">
              <Icon name="Wand2" size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{item.ai_hint}</span>
            </div>
          )}
          <button
            onClick={() => onAskAI(item)}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-cyan-100 bg-cyan-500/15 border border-cyan-400/30 rounded-lg px-3 py-1.5 hover:bg-cyan-500/25 transition-colors"
          >
            <Icon name="Sparkles" size={13} /> Спросить ИИ-специалиста
          </button>
        </div>
      )}

      {item.mode === "external" && item.hiring && (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {item.hiring.budget && (
              <span className="text-[11px] text-white/80 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1">
                <Icon name="Wallet" size={11} className="inline mr-1 text-violet-300" /> {item.hiring.budget}
              </span>
            )}
            {item.hiring.eta && (
              <span className="text-[11px] text-white/80 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1">
                <Icon name="Clock" size={11} className="inline mr-1 text-violet-300" /> {item.hiring.eta}
              </span>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-auto text-[11px] font-bold text-violet-200 hover:text-white transition-colors"
            >
              {open ? "Свернуть" : "Пакет для найма"} <Icon name={open ? "ChevronUp" : "ChevronDown"} size={12} className="inline" />
            </button>
          </div>

          {open && <HiringDetails item={item} onHire={onHire} />}
        </div>
      )}
    </div>
  );
}

function HiringDetails({ item, onHire }: { item: ResourceItem; onHire: (item: ResourceItem) => void }) {
  const h = item.hiring!;
  const [copied, setCopied] = useState(false);

  const copyVacancy = async () => {
    try {
      await navigator.clipboard.writeText(h.vacancy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-3 border-t border-white/10 pt-3">
      {h.profile && (
        <Block icon="IdCard" title="Профиль исполнителя">
          <p className="text-white/75 text-sm">{h.profile}</p>
        </Block>
      )}
      {h.vacancy && (
        <Block icon="FileText" title="Готовая вакансия / ТЗ">
          <p className="text-white/75 text-sm whitespace-pre-line">{h.vacancy}</p>
          <button
            onClick={copyVacancy}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-2.5 py-1 hover:bg-violet-500/25 transition-colors"
          >
            <Icon name={copied ? "Check" : "Copy"} size={12} /> {copied ? "Скопировано" : "Копировать текст"}
          </button>
        </Block>
      )}
      {h.where?.length > 0 && (
        <Block icon="MapPin" title="Где искать">
          <div className="flex flex-wrap gap-1.5">
            {h.where.map((w, i) => (
              <span key={i} className="text-[11px] text-white/80 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1">{w}</span>
            ))}
          </div>
        </Block>
      )}
      {h.interview?.length > 0 && (
        <Block icon="MessageCircleQuestion" title="Проверить на собесе">
          <ul className="space-y-1">
            {h.interview.map((q, i) => (
              <li key={i} className="text-sm text-white/75 flex gap-2">
                <span className="text-violet-300 font-bold">{i + 1}.</span> {q}
              </li>
            ))}
          </ul>
        </Block>
      )}
      <button
        onClick={() => onHire(item)}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform"
      >
        <Icon name="Send" size={16} /> Доверить подбор нам
      </button>
    </div>
  );
}

function Block({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="flex items-center gap-1.5 text-white font-bold text-sm mb-1">
        <Icon name={icon} size={14} className="text-violet-300" /> {title}
      </h4>
      {children}
    </div>
  );
}