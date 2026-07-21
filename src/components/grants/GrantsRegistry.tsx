import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { fetchGrantsRegistry, type RegistryGrant, type GrantStatus } from "./registryApi";

const CATEGORY_LABEL: Record<string, string> = {
  social: "Социальные проекты",
  education: "Образование",
  culture: "Культура",
  science: "Наука",
  other: "Другое",
};

const STATUS_META: Record<GrantStatus, { label: string; cls: string; icon: string }> = {
  open: { label: "Приём открыт", cls: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30", icon: "CircleCheck" },
  soon: { label: "Скоро откроется", cls: "text-amber-300 bg-amber-500/15 border-amber-400/30", icon: "Clock" },
  closed: { label: "Приём завершён", cls: "text-white/50 bg-white/5 border-white/15", icon: "CircleSlash" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function deadlineNote(g: RegistryGrant): { text: string; urgent: boolean } {
  if (g.status === "closed") return { text: "Приём заявок завершён", urgent: false };
  if (g.status === "soon") return { text: `Старт приёма — ${formatDate(g.starts_on)}`, urgent: false };
  const d = g.days_left;
  if (d === null) return { text: "Приём открыт", urgent: false };
  if (d === 0) return { text: "Последний день приёма!", urgent: true };
  if (d <= 7) return { text: `Осталось ${d} дн. до дедлайна`, urgent: true };
  return { text: `До дедлайна — ${d} дн.`, urgent: false };
}

function GrantCard({ g }: { g: RegistryGrant }) {
  const s = STATUS_META[g.status];
  const note = deadlineNote(g);
  const dimmed = g.status === "closed";

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col transition-colors ${
        dimmed ? "border-white/8 bg-white/[0.02] opacity-70" : "border-white/12 bg-white/[0.04] hover:border-violet-400/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>
          <Icon name={s.icon} size={12} /> {s.label}
        </span>
        {g.source_verified && (
          <span className="inline-flex items-center gap-1 text-[11px] text-cyan-300/80" title="Данные сверены с официальным источником">
            <Icon name="BadgeCheck" size={13} /> проверено
          </span>
        )}
      </div>

      <h3 className="font-montserrat font-bold text-white text-base leading-snug mb-1.5">{g.name}</h3>
      <p className="text-white/55 text-xs mb-3">{g.organizer}</p>
      <p className="text-white/70 text-sm leading-relaxed mb-4 flex-1">{g.description}</p>

      <div className="space-y-2 text-sm mb-4">
        {g.amount_text && (
          <div className="flex items-center gap-2 text-white/80">
            <Icon name="Wallet" size={15} className="text-emerald-300 flex-shrink-0" />
            <span className="font-semibold">{g.amount_text}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-white/80">
          <Icon name="CalendarClock" size={15} className="text-violet-300 flex-shrink-0" />
          <span>Дедлайн: <span className="font-semibold">{formatDate(g.deadline_on)}</span></span>
        </div>
        {g.region && (
          <div className="flex items-center gap-2 text-white/65">
            <Icon name="MapPin" size={15} className="text-cyan-300 flex-shrink-0" />
            <span>{g.region}</span>
          </div>
        )}
      </div>

      <div
        className={`text-xs font-bold rounded-lg px-3 py-2 mb-4 ${
          note.urgent ? "text-rose-200 bg-rose-500/15 border border-rose-400/30" : "text-white/60 bg-white/5"
        }`}
      >
        {note.urgent && <Icon name="TriangleAlert" size={12} className="inline mr-1 -mt-0.5" />}
        {note.text}
      </div>

      <a
        href={g.official_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-violet-200 hover:text-violet-100 border border-violet-400/30 hover:border-violet-400/60 rounded-xl py-2.5 transition-colors"
      >
        Условия на сайте фонда
        <Icon name="ExternalLink" size={14} />
      </a>
    </div>
  );
}

export default function GrantsRegistry() {
  const [grants, setGrants] = useState<RegistryGrant[]>([]);
  const [today, setToday] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchGrantsRegistry()
      .then((r) => {
        if (!alive) return;
        setGrants(r.items);
        setToday(r.today);
      })
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || grants.length === 0) return null;

  const todayLabel = today
    ? new Date(today + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <section className="mt-16 mb-4" aria-label="Актуальные гранты">
      <div className="text-center mb-2">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Актуальные гранты и конкурсы</h2>
      </div>
      <p className="text-white/60 text-sm text-center mb-8 max-w-2xl mx-auto">
        Сроки сверены с официальными сайтами фондов и обновляются автоматически.
        {todayLabel && <> Данные на {todayLabel}.</>}
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grants.map((g) => (
          <GrantCard key={g.slug} g={g} />
        ))}
      </div>
      <p className="text-white/35 text-xs text-center mt-6">
        Статусы «открыт / скоро / завершён» рассчитываются автоматически по текущей дате.
        Перед подачей проверяйте условия на официальном сайте фонда.
      </p>
    </section>
  );
}
