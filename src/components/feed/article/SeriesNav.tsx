import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Part {
  n: number;
  slug: string;
  title: string;
  /** Дата выхода (МСК). Часть до этой даты показывается как «скоро». */
  date: string;
}

/** Серия «Проект 2036»: даты совпадают с published_at в БД (субботы, 10:00 МСК). */
const PROJECT_2036: Part[] = [
  { n: 1, slug: "proekt-2036-chast-1-pismo-iz-budushchego", title: "Письмо из будущего", date: "2026-10-10T00:00:00+03:00" },
  { n: 2, slug: "proekt-2036-chast-2-ii-naparnik", title: "ИИ — напарник, а не соперник", date: "2026-10-17T10:00:00+03:00" },
  { n: 3, slug: "proekt-2036-chast-3-professii", title: "Профессии, которых ждёт страна", date: "2026-10-24T10:00:00+03:00" },
  { n: 4, slug: "proekt-2036-chast-4-inzhenery", title: "Инженеры большой страны", date: "2026-10-31T10:00:00+03:00" },
  { n: 5, slug: "proekt-2036-chast-5-medicina", title: "Медицина долгой жизни", date: "2026-11-07T10:00:00+03:00" },
  { n: 6, slug: "proekt-2036-chast-6-zemlya-i-energiya", title: "Земля, еда и чистая энергия", date: "2026-11-14T10:00:00+03:00" },
  { n: 7, slug: "proekt-2036-chast-7-kak-uchatsya", title: "Как учатся в 2036 году", date: "2026-11-21T10:00:00+03:00" },
  { n: 8, slug: "proekt-2036-chast-8-geroy", title: "Герой, которым станешь ты", date: "2026-11-28T10:00:00+03:00" },
];

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "Europe/Moscow" });

/** Оглавление серии под статьёй. Показывается только на частях серии. */
export default function SeriesNav({ slug }: { slug: string }) {
  const current = PROJECT_2036.find((p) => p.slug === slug);
  if (!current) return null;

  const now = Date.now();
  const isOut = (p: Part) => new Date(p.date).getTime() <= now;
  const next = PROJECT_2036.find((p) => p.n === current.n + 1);

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Серия · выходит по субботам</p>
          <h2 className="mt-1 text-xl font-bold text-white">Проект 2036</h2>
          <p className="mt-1 text-sm text-white/60">Аналитические записки из будущего — о профессиях, технологиях и людях, на которых стоит равняться.</p>
        </div>
        <Icon name="Rocket" size={22} className="shrink-0 text-primary" />
      </div>

      <ol className="grid gap-2 sm:grid-cols-2">
        {PROJECT_2036.map((p) => {
          const active = p.slug === slug;
          const out = isOut(p);
          const inner = (
            <>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  active ? "bg-primary text-primary-foreground" : out ? "bg-white/10 text-white" : "bg-white/5 text-white/40"
                }`}
              >
                {p.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-semibold ${active ? "text-primary" : out ? "text-white" : "text-white/45"}`}>
                  {p.title}
                </span>
                {!out && <span className="block text-xs text-white/40">выйдет {fmt(p.date)}</span>}
              </span>
              {out && !active && <Icon name="ArrowRight" size={16} className="shrink-0 text-white/40" />}
              {!out && <Icon name="Lock" size={14} className="shrink-0 text-white/30" />}
            </>
          );
          return (
            <li key={p.slug}>
              {out && !active ? (
                <Link
                  to={`/feed/${p.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:border-primary/40 hover:bg-white/[0.05]"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    active ? "border-primary/50 bg-primary/10" : "border-white/5 bg-transparent"
                  }`}
                >
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {next && (
        <p className="mt-5 text-sm text-white/60">
          {isOut(next) ? (
            <>
              Читать дальше:{" "}
              <Link to={`/feed/${next.slug}`} className="font-semibold text-primary hover:underline">
                часть {next.n}. {next.title}
              </Link>
            </>
          ) : (
            <>Следующая часть — «{next.title}» — выйдет {fmt(next.date)}.</>
          )}
        </p>
      )}
    </section>
  );
}
