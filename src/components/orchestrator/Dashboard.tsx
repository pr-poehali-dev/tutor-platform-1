import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import {
  proAccess,
  projectsList,
  projectCreate,
  projectDelete,
  ProjectItem,
  Track,
  PRO_COURSE_ID,
} from "./api";
import ProjectBoard from "./ProjectBoard";

const PRO_PRICE = 15000;

interface Props {
  pendingTrack?: Track | null;
  onTrackConsumed?: () => void;
}

export default function Dashboard({ pendingTrack, onTrackConsumed }: Props) {
  const { isAuthenticated, openLogin } = useAuth();
  const { buyCourse } = useAccess();

  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const load = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const acc = await proAccess();
    if (acc.ok) setAccess(!!acc.pro_access);
    if (acc.ok && acc.pro_access) {
      const list = await projectsList();
      if (list.ok) setProjects(list.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Если пришли из трека с готовым результатом и есть доступ — предложим создать проект
  useEffect(() => {
    if (access && pendingTrack && !creating) {
      setNewName(pendingTrack.track_title?.slice(0, 60) || "Новый проект");
      setCreating(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, pendingTrack]);

  const startPay = async () => {
    if (buying) return;
    setBuying(true);
    setError(null);
    const returnUrl = `${window.location.origin}/orchestrator?pro=1`;
    const res = await buyCourse(PRO_COURSE_ID, "adult", "Оркестратор PRO — рабочий дашборд", returnUrl);
    setBuying(false);
    if (!res.ok) return setError(res.message || "Не удалось оформить");
    if (res.alreadyPurchased) {
      setAccess(true);
      load();
      return;
    }
    if (res.paymentUrl) window.location.href = res.paymentUrl;
    else setError("Оплата временно недоступна");
  };

  const createProject = async () => {
    const name = newName.trim();
    if (!name) return;
    const res = await projectCreate({
      name,
      role_title: pendingTrack?.track_title,
      track: pendingTrack || undefined,
    });
    if (res.ok && res.project_id) {
      setCreating(false);
      setNewName("");
      onTrackConsumed?.();
      await load();
      setOpenId(res.project_id);
    } else {
      setError(res.message || "Не удалось создать проект");
    }
  };

  const removeProject = async (id: number) => {
    await projectDelete(id);
    if (openId === id) setOpenId(null);
    load();
  };

  // Открытый проект
  if (openId) {
    return <ProjectBoard projectId={openId} onBack={() => { setOpenId(null); load(); }} />;
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <Gate
          emoji="🔐"
          title="Войдите, чтобы открыть дашборд"
          text="Рабочий дашборд «Оркестратора» доступен в личном кабинете. Войдите — и продолжим."
          buttonLabel="Войти"
          onClick={() => openLogin()}
        />
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <div className="py-10 text-center text-white/50">
          <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-2 text-violet-300" />
          Загружаем дашборд…
        </div>
      </Shell>
    );
  }

  if (!access) {
    return (
      <Shell>
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center text-2xl mx-auto mb-4">
            🎼
          </div>
          <h3 className="font-montserrat font-black text-white text-xl mb-2">Рабочий дашборд «Оркестратор PRO»</h3>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-5">
            Ведите проекты и исполнителей, микрозадачи по статусам, ставьте оценки качества и следите за рисками —
            всё в одном месте, с прозрачными метриками по каждому фрилансеру.
          </p>
          <div className="grid sm:grid-cols-3 gap-2 max-w-lg mx-auto mb-6 text-left">
            {[
              { icon: "Users", t: "Исполнители и скрининг" },
              { icon: "SquareCheckBig", t: "Задачи со статусами" },
              { icon: "Gauge", t: "Метрики качества и риски" },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Icon name={f.icon} size={18} className="text-violet-300 mb-1.5" />
                <div className="text-white/80 text-xs">{f.t}</div>
              </div>
            ))}
          </div>
          <button
            onClick={startPay}
            disabled={buying}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-8 py-3.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {buying ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Lock" size={18} />}
            Открыть дашборд — {PRO_PRICE.toLocaleString("ru-RU")} ₽
          </button>
          {error && <div className="text-rose-300 text-xs mt-3">{error}</div>}
          <p className="text-white/35 text-[11px] mt-3">Разовая оплата. Доступ сохраняется в кабинете.</p>
        </div>
      </Shell>
    );
  }

  // Список проектов
  return (
    <Shell>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-montserrat font-black text-white text-lg flex items-center gap-2">
          <Icon name="LayoutDashboard" size={18} className="text-violet-300" /> Ваши проекты
        </h3>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-white/[0.06] border border-white/15 hover:border-violet-400/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Icon name="Plus" size={15} className="text-violet-300" /> Проект
          </button>
        )}
      </div>

      {creating && (
        <div className="rounded-2xl border border-violet-400/25 bg-violet-500/[0.06] p-4 mb-4">
          {pendingTrack && (
            <p className="text-white/70 text-xs mb-2">
              Создадим проект с готовым треком «{pendingTrack.track_title}» — задачи подставятся автоматически.
            </p>
          )}
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Название проекта"
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
            />
            <button onClick={createProject} className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-4 rounded-xl">
              Создать
            </button>
            <button onClick={() => { setCreating(false); onTrackConsumed?.(); }} className="text-white/50 px-2" aria-label="Отмена">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 && !creating ? (
        <div className="text-center text-white/55 text-sm py-8">
          Пока нет проектов. Нажмите «Проект», чтобы завести первый.
        </div>
      ) : (
        <div className="space-y-2.5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-violet-400/40 transition-colors cursor-pointer"
              onClick={() => setOpenId(p.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{p.name}</div>
                  {p.role_title && <div className="text-white/50 text-xs truncate">{p.role_title}</div>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs text-white/60">
                  <span className="flex items-center gap-1"><Icon name="Users" size={13} /> {p.performers}</span>
                  <span className="flex items-center gap-1"><Icon name="SquareCheckBig" size={13} /> {p.tasks_done}/{p.tasks_total}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeProject(p.id); }}
                    className="text-white/30 hover:text-rose-400 transition-colors"
                    aria-label="Удалить проект"
                  >
                    <Icon name="Trash2" size={15} />
                  </button>
                  <Icon name="ChevronRight" size={16} className="text-violet-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="text-rose-300 text-xs mt-3">{error}</div>}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-500/8 to-cyan-500/6 p-6 md:p-7">
      {children}
    </div>
  );
}

function Gate({
  emoji, title, text, buttonLabel, onClick,
}: {
  emoji: string;
  title: string;
  text: string;
  buttonLabel: string;
  onClick?: () => void;
}) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mx-auto mb-4">{emoji}</div>
      <h3 className="font-montserrat font-black text-white text-xl mb-2">{title}</h3>
      <p className="text-white/70 text-sm max-w-md mx-auto mb-5">{text}</p>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-8 py-3.5 rounded-xl hover:scale-[1.02] transition-transform"
      >
        <Icon name="LogIn" size={18} /> {buttonLabel}
      </button>
    </div>
  );
}
