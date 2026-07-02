import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { fetchCourseStudents, inviteStudent, removeStudent, type StudentItem } from "./api";

interface Props {
  courseId: number;
}

const SOURCE_LABEL: Record<string, string> = {
  purchase: "Оплата",
  invite: "Приглашён",
};

export default function CourseStudents({ courseId }: Props) {
  const [items, setItems] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchCourseStudents(courseId);
    if (res.ok && res.data) setItems(res.data.items);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setNotice("Укажите корректный email");
      return;
    }
    setInviting(true);
    const res = await inviteStudent(courseId, e);
    setInviting(false);
    if (res.ok) {
      setEmail("");
      setNotice(res.data?.linked ? "Ученик добавлен — доступ открыт" : "Приглашение отправлено");
      setTimeout(() => setNotice(null), 2000);
      load();
    } else {
      setNotice(res.error || "Не удалось пригласить");
    }
  };

  const remove = async (id: number) => {
    setItems((prev) => prev.filter((s) => s.id !== id));
    await removeStudent(id);
  };

  return (
    <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      {/* Форма приглашения */}
      <div className="flex items-center gap-2 mb-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && invite()}
          placeholder="email ученика для доступа"
          className="flex-1 bg-white/[0.04] border border-white/12 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/40"
        />
        <button
          onClick={invite}
          disabled={inviting}
          className="inline-flex items-center gap-1.5 text-sm bg-violet-500/20 text-violet-200 border border-violet-500/30 hover:bg-violet-500/30 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-60"
        >
          <Icon name={inviting ? "Loader2" : "UserPlus"} size={14} className={inviting ? "animate-spin" : ""} /> Пригласить
        </button>
      </div>
      {notice && <div className="text-xs text-emerald-300 mb-2">{notice}</div>}

      {/* Список */}
      {loading ? (
        <div className="text-white/45 text-xs py-2 text-center">Загружаем учеников…</div>
      ) : items.length === 0 ? (
        <div className="text-white/45 text-xs py-3 text-center">Пока нет учеников. Пригласите первого по email.</div>
      ) : (
        <div className="space-y-1.5">
          {items.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-sm bg-white/[0.03] rounded-lg px-3 py-2">
              <Icon name="User" size={14} className="text-white/40 flex-shrink-0" />
              <span className="text-white/85 truncate">{s.name || s.email || "—"}</span>
              {s.name && s.email && <span className="text-white/40 text-xs truncate">{s.email}</span>}
              <span className="ml-auto text-[10px] text-white/45 bg-white/8 rounded px-1.5 py-0.5 flex-shrink-0">
                {SOURCE_LABEL[s.source] || s.source}
              </span>
              <button
                onClick={() => remove(s.id)}
                className="text-white/30 hover:text-rose-300 transition-colors flex-shrink-0"
                aria-label="Убрать доступ"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
