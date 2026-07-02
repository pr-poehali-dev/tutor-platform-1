import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  fetchStudents,
  inviteStudent,
  removeStudent,
  type StudentItem,
  type SchoolCourseListItem,
} from "./api";

interface Props {
  courses: SchoolCourseListItem[];
}

const SOURCE_LABEL: Record<string, string> = {
  purchase: "Оплата",
  invite: "Приглашён",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SchoolStudents({ courses }: Props) {
  const [items, setItems] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState<number | "">(courses[0]?.id ?? "");
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    fetchStudents().then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const invite = async () => {
    if (inviting) return;
    if (!courseId) return setMsg({ type: "err", text: "Выберите курс" });
    if (!email.includes("@")) return setMsg({ type: "err", text: "Укажите email" });
    setInviting(true);
    setMsg(null);
    const res = await inviteStudent(Number(courseId), email.trim());
    setInviting(false);
    if (res.ok) {
      setEmail("");
      setMsg({ type: "ok", text: "Ученик добавлен — доступ открыт" });
      load();
    } else {
      setMsg({ type: "err", text: res.error || "Не удалось добавить" });
    }
  };

  const remove = async (id: number) => {
    setItems((prev) => prev.filter((s) => s.id !== id));
    await removeStudent(id);
  };

  return (
    <div className="space-y-5">
      {/* Пригласить */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-montserrat font-bold text-white mb-1">Добавить ученика вручную</h3>
        <p className="text-white/50 text-sm mb-4">Выдайте доступ к курсу по email — например, тем, кто оплатил напрямую.</p>
        {courses.length === 0 ? (
          <p className="text-white/50 text-sm">Сначала создайте курс, чтобы приглашать учеников.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email ученика"
              className="flex-1 min-w-[200px] bg-white/[0.05] border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
            />
            <select
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              className="bg-white/[0.05] border border-white/12 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1a1530]">
                  {c.title}
                </option>
              ))}
            </select>
            <button
              onClick={invite}
              disabled={inviting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {inviting ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="UserPlus" size={16} />}
              Добавить
            </button>
          </div>
        )}
        {msg && (
          <p className={`text-xs mt-2 ${msg.type === "ok" ? "text-emerald-300" : "text-rose-300"}`}>{msg.text}</p>
        )}
      </div>

      {/* Список */}
      {loading ? (
        <div className="text-white/50 text-sm py-8 text-center">Загружаем учеников…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <Icon name="Users" size={26} className="text-white/40 mx-auto mb-2" />
          <p className="text-white/60 text-sm">Пока нет учеников. Они появятся после покупки курса или приглашения.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          {items.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-white/8" : ""}`}
            >
              <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-200 text-sm font-bold flex-shrink-0">
                {(s.name || s.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white text-sm font-medium truncate">{s.name || s.email || "Без имени"}</div>
                <div className="text-white/45 text-xs truncate">
                  {s.course_title} · {SOURCE_LABEL[s.source] || s.source} · {fmtDate(s.created_at)}
                </div>
              </div>
              <button
                onClick={() => remove(s.id)}
                className="text-white/30 hover:text-rose-300 p-1.5 flex-shrink-0"
                title="Убрать доступ"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
