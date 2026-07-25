import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  dashboard,
  performerAdd,
  performerUpdate,
  taskAdd,
  taskUpdate,
  feedbackAdd,
  Dashboard as DashboardData,
  Performer,
  Task,
} from "./api";

const STATUS_META: Record<string, { label: string; cls: string; next?: string }> = {
  todo: { label: "К работе", cls: "bg-white/[0.06] text-white/70 border-white/15", next: "in_progress" },
  in_progress: { label: "В работе", cls: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30", next: "review" },
  review: { label: "На проверке", cls: "bg-amber-500/15 text-amber-200 border-amber-400/30", next: "done" },
  revision: { label: "Правки", cls: "bg-rose-500/15 text-rose-200 border-rose-400/30", next: "review" },
  done: { label: "Готово", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
};

const SCREEN_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Проверка", cls: "bg-white/[0.06] text-white/60 border-white/15" },
  ok: { label: "Одобрен", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
  train: { label: "Дообучить", cls: "bg-amber-500/15 text-amber-200 border-amber-400/30" },
  reject: { label: "Отклонён", cls: "bg-rose-500/15 text-rose-200 border-rose-400/30" },
};

const RISK_META: Record<string, { label: string; cls: string }> = {
  low: { label: "Риск низкий", cls: "text-emerald-300" },
  medium: { label: "Риск средний", cls: "text-amber-300" },
  high: { label: "Риск высокий", cls: "text-rose-300" },
};

export default function ProjectBoard({ projectId, onBack }: { projectId: number; onBack: () => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"tasks" | "performers">("tasks");
  const [fbFor, setFbFor] = useState<Performer | null>(null);

  const load = async () => {
    const res = await dashboard(projectId);
    if (res.ok) setData(res as unknown as DashboardData);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (loading || !data) {
    return (
      <Shell>
        <div className="py-10 text-center text-white/50">
          <Icon name="Loader2" size={26} className="animate-spin mx-auto mb-2 text-violet-300" /> Загрузка проекта…
        </div>
      </Shell>
    );
  }

  const m = data.metrics;
  const perfName = (id: number | null) => data.performers.find((p) => p.id === id)?.name;

  return (
    <Shell>
      <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-3 inline-flex items-center gap-1">
        <Icon name="ChevronLeft" size={16} /> К проектам
      </button>
      <h3 className="font-montserrat font-black text-white text-xl mb-1">{data.project.name}</h3>
      {data.project.role_title && <p className="text-white/50 text-sm mb-4">{data.project.role_title}</p>}

      {/* Метрики */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <Metric icon="CircleCheckBig" label="Выполнено" value={`${m.tasks_done}/${m.tasks_total}`} sub={`${m.completion_pct}%`} />
        <Metric icon="Loader" label="В работе" value={m.tasks_in_progress} />
        <Metric icon="RefreshCw" label="Правок" value={m.revisions_total} warn={m.revisions_total > 0} />
        <Metric icon="Users" label="Исполнителей" value={m.performers_total} />
      </div>
      {m.high_risk_performers.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-rose-200 bg-rose-500/[0.08] border border-rose-400/25 rounded-xl px-4 py-2.5 mb-5">
          <Icon name="ShieldAlert" size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <span>Высокий риск: {m.high_risk_performers.join(", ")}. Стоит вмешаться.</span>
        </div>
      )}

      {/* Табы */}
      <div className="flex gap-2 mb-4">
        {(["tasks", "performers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
              tab === t ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "text-white/60 bg-white/[0.05] hover:text-white"
            }`}
          >
            {t === "tasks" ? "Задачи" : "Исполнители"}
          </button>
        ))}
      </div>

      {tab === "tasks" ? (
        <TasksTab data={data} projectId={projectId} onChange={load} perfName={perfName} />
      ) : (
        <PerformersTab data={data} projectId={projectId} onChange={load} onFeedback={setFbFor} />
      )}

      {fbFor && <FeedbackModal performer={fbFor} onClose={() => setFbFor(null)} onSaved={() => { setFbFor(null); load(); }} />}
    </Shell>
  );
}

function Metric({ icon, label, value, sub, warn }: { icon: string; label: string; value: string | number; sub?: string; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <Icon name={icon} size={16} className={warn ? "text-amber-400" : "text-violet-300"} />
      <div className="font-montserrat font-black text-white text-lg mt-1">{value}{sub && <span className="text-white/40 text-xs font-normal ml-1">{sub}</span>}</div>
      <div className="text-white/45 text-[11px]">{label}</div>
    </div>
  );
}

// ─── ЗАДАЧИ ───
function TasksTab({
  data, projectId, onChange, perfName,
}: {
  data: DashboardData;
  projectId: number;
  onChange: () => void;
  perfName: (id: number | null) => string | undefined;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [criteria, setCriteria] = useState("");
  const [perfId, setPerfId] = useState<string>("");

  const add = async () => {
    if (!title.trim()) return;
    await taskAdd({
      project_id: projectId,
      title: title.trim(),
      done_criteria: criteria.trim() || undefined,
      performer_id: perfId ? Number(perfId) : undefined,
    });
    setTitle(""); setCriteria(""); setPerfId(""); setAdding(false);
    onChange();
  };

  const move = async (t: Task) => {
    const next = STATUS_META[t.status].next;
    if (next) { await taskUpdate({ task_id: t.id, status: next }); onChange(); }
  };
  const revise = async (t: Task) => { await taskUpdate({ task_id: t.id, status: "revision" }); onChange(); };

  const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50";

  return (
    <div>
      {!adding ? (
        <button onClick={() => setAdding(true)} className="w-full mb-3 text-sm font-bold text-white/80 border border-dashed border-white/20 hover:border-violet-400/50 rounded-xl py-2.5 transition-colors">
          <Icon name="Plus" size={15} className="inline mr-1 text-violet-300" /> Добавить задачу
        </button>
      ) : (
        <div className="rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-3 mb-3 space-y-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что нужно сделать?" className={inputCls} />
          <input value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="Критерий «готово» (необязательно)" className={inputCls} />
          <select value={perfId} onChange={(e) => setPerfId(e.target.value)} className={`${inputCls} appearance-none`}>
            <option value="" className="bg-[#1a1230]">Без исполнителя</option>
            {data.performers.map((p) => <option key={p.id} value={p.id} className="bg-[#1a1230]">{p.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-2 rounded-lg text-sm">Добавить</button>
            <button onClick={() => setAdding(false)} className="text-white/50 px-3" aria-label="Отмена"><Icon name="X" size={18} /></button>
          </div>
        </div>
      )}

      {data.tasks.length === 0 ? (
        <div className="text-center text-white/50 text-sm py-6">Задач пока нет.</div>
      ) : (
        <div className="space-y-2">
          {data.tasks.map((t) => {
            const st = STATUS_META[t.status];
            return (
              <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold">{t.title}</div>
                    {t.done_criteria && <div className="text-white/50 text-xs mt-0.5">Готово: {t.done_criteria}</div>}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {t.performer_id && <span className="text-[11px] text-white/60"><Icon name="User" size={11} className="inline" /> {perfName(t.performer_id)}</span>}
                      {t.revisions > 0 && <span className="text-[11px] text-amber-300">правок: {t.revisions}</span>}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-[11px] font-bold rounded-lg border px-2 py-0.5 ${st.cls}`}>{st.label}</span>
                </div>
                {t.status !== "done" && (
                  <div className="flex gap-2 mt-2">
                    {st.next && (
                      <button onClick={() => move(t)} className="text-[11px] font-bold text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-2.5 py-1 hover:bg-violet-500/25 transition-colors">
                        → {STATUS_META[st.next].label}
                      </button>
                    )}
                    {(t.status === "review" || t.status === "in_progress") && (
                      <button onClick={() => revise(t)} className="text-[11px] font-bold text-rose-200 bg-rose-500/10 border border-rose-400/20 rounded-lg px-2.5 py-1 hover:bg-rose-500/20 transition-colors">
                        Вернуть на правки
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ИСПОЛНИТЕЛИ ───
function PerformersTab({
  data, projectId, onChange, onFeedback,
}: {
  data: DashboardData;
  projectId: number;
  onChange: () => void;
  onFeedback: (p: Performer) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    await performerAdd({ project_id: projectId, name: name.trim(), contact: contact.trim() || undefined });
    setName(""); setContact(""); setAdding(false);
    onChange();
  };
  const setScreen = async (p: Performer, screening: string) => {
    await performerUpdate({ performer_id: p.id, screening });
    onChange();
  };

  const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50";

  return (
    <div>
      {!adding ? (
        <button onClick={() => setAdding(true)} className="w-full mb-3 text-sm font-bold text-white/80 border border-dashed border-white/20 hover:border-violet-400/50 rounded-xl py-2.5 transition-colors">
          <Icon name="UserPlus" size={15} className="inline mr-1 text-violet-300" /> Добавить исполнителя
        </button>
      ) : (
        <div className="rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-3 mb-3 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя исполнителя" className={inputCls} />
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Контакт (необязательно)" className={inputCls} />
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-2 rounded-lg text-sm">Добавить</button>
            <button onClick={() => setAdding(false)} className="text-white/50 px-3" aria-label="Отмена"><Icon name="X" size={18} /></button>
          </div>
        </div>
      )}

      {data.performers.length === 0 ? (
        <div className="text-center text-white/50 text-sm py-6">Исполнителей пока нет.</div>
      ) : (
        <div className="space-y-2.5">
          {data.performers.map((p) => {
            const sc = SCREEN_META[p.screening];
            const risk = RISK_META[p.risk_level];
            const hasScores = p.quality_avg != null;
            return (
              <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-white font-semibold">{p.name}</div>
                    {p.contact && <div className="text-white/45 text-xs">{p.contact}</div>}
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-bold rounded-lg border px-2 py-0.5 ${sc.cls}`}>{sc.label}</span>
                    {hasScores && <div className={`text-[11px] font-semibold mt-1 ${risk.cls}`}>{risk.label}</div>}
                  </div>
                </div>

                {hasScores && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <Score label="Качество" v={p.quality_avg} />
                    <Score label="Скорость" v={p.speed_avg} />
                    <Score label="Связь" v={p.comm_avg} />
                    <Score label="Сроки" v={p.deadline_avg} />
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/40 text-[11px]">Скрининг:</span>
                  {(["ok", "train", "reject"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setScreen(p, s)}
                      className={`text-[11px] font-bold rounded-lg border px-2 py-0.5 transition-colors ${
                        p.screening === s ? SCREEN_META[s].cls : "text-white/50 border-white/10 hover:border-white/25"
                      }`}
                    >
                      {SCREEN_META[s].label}
                    </button>
                  ))}
                  <button
                    onClick={() => onFeedback(p)}
                    className="ml-auto text-[11px] font-bold text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-2.5 py-1 hover:bg-violet-500/25 transition-colors"
                  >
                    <Icon name="Star" size={11} className="inline mr-0.5" /> Оценить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Score({ label, v }: { label: string; v: number | null }) {
  const color = v == null ? "text-white/40" : v >= 4 ? "text-emerald-300" : v >= 3 ? "text-cyan-300" : "text-rose-300";
  return (
    <div className="text-center rounded-lg bg-white/[0.04] py-1.5">
      <div className={`font-montserrat font-black text-sm ${color}`}>{v != null ? v.toFixed(1) : "—"}</div>
      <div className="text-white/40 text-[10px]">{label}</div>
    </div>
  );
}

// ─── МОДАЛКА ОЦЕНКИ ───
function FeedbackModal({ performer, onClose, onSaved }: { performer: Performer; onClose: () => void; onSaved: () => void }) {
  const [scores, setScores] = useState({ quality: 0, speed: 0, communication: 0, deadline: 0 });
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const fields: { key: keyof typeof scores; label: string }[] = [
    { key: "quality", label: "Качество" },
    { key: "speed", label: "Скорость" },
    { key: "communication", label: "Коммуникация" },
    { key: "deadline", label: "Соблюдение сроков" },
  ];

  const save = async () => {
    setSaving(true);
    await feedbackAdd({
      performer_id: performer.id,
      quality: scores.quality || undefined,
      speed: scores.speed || undefined,
      communication: scores.communication || undefined,
      deadline: scores.deadline || undefined,
      comment: comment.trim() || undefined,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#161022] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-black text-white text-lg">Оценка: {performer.name}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white" aria-label="Закрыть"><Icon name="X" size={20} /></button>
        </div>
        <div className="space-y-3 mb-4">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center justify-between">
              <span className="text-white/75 text-sm">{f.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setScores((s) => ({ ...s, [f.key]: n }))}
                    aria-label={`${f.label}: ${n}`}
                    className="p-0.5"
                  >
                    <Icon name="Star" size={20} className={n <= scores[f.key] ? "text-amber-400" : "text-white/20"} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий (необязательно)"
          rows={2}
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50 resize-none mb-4"
        />
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3 rounded-xl disabled:opacity-60"
        >
          {saving ? <Icon name="Loader2" size={18} className="animate-spin inline" /> : "Сохранить оценку"}
        </button>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-500/8 to-cyan-500/6 p-6 md:p-7">
      {children}
    </div>
  );
}
