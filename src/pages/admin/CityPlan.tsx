import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { CITIES, NICHES, buildSearchLinks, City, Niche } from "@/components/playbook/cities";
import { listInstitutions, EduInstitution } from "@/components/admin/eduInstitutions/api";
import QuickAddContact from "@/components/admin/eduInstitutions/QuickAddContact";

const WAVE_META: Record<number, { label: string; tone: string; why: string }> = {
  1: {
    label: "Волна 1",
    tone: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    why: "Начинаем отсюда: рынок зрелый, но не перегрет предложениями. Отрабатываем скрипты.",
  },
  2: {
    label: "Волна 2",
    tone: "bg-amber-500/15 text-amber-200 border-amber-400/30",
    why: "Подключаем, когда письма и демо отточены на первой волне. Здесь выше конкуренция.",
  },
  3: {
    label: "Волна 3",
    tone: "bg-slate-500/15 text-slate-300 border-slate-400/30",
    why: "Рынки меньше или сжимаются. Берём после отработки ёмких городов.",
  },
};

/** План обхода городов-миллионников: где искать, сколько собрать и что уже сделано.
 *  Внутренний инструмент, от индексации закрыт. */
export default function CityPlan() {
  const [items, setItems] = useState<EduInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCity, setOpenCity] = useState<string | null>(null);
  const [niche, setNiche] = useState<Niche>(NICHES[0]);

  /** Перечитываем базу после добавления — счётчики по городам обновляются сразу */
  const reload = useCallback(() => {
    listInstitutions({})
      .then((r) => setItems(r.ok && r.data ? r.data.items || [] : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Сколько контактов уже собрано по каждому городу */
  const byCity = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of items) {
      const c = (it.city || "").trim().toLowerCase();
      if (!c) continue;
      m[c] = (m[c] || 0) + 1;
    }
    return m;
  }, [items]);

  const totalTarget = CITIES.reduce((n, c) => n + c.target, 0);
  const totalDone = CITIES.reduce((n, c) => n + (byCity[c.name.toLowerCase()] || 0), 0);

  const waves = [1, 2, 3] as const;

  return (
    <div className="min-h-screen bg-background text-white">
      <Helmet>
        <title>План обхода городов — внутренний документ</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link
              to="/admin/playbook"
              className="inline-flex items-center gap-1.5 text-white/45 hover:text-white text-sm transition-colors"
            >
              <Icon name="ArrowLeft" size={14} aria-hidden="true" />
              Стратегия
            </Link>
            <Link
              to="/admin/edu-institutions"
              className="inline-flex items-center gap-1.5 text-cyan-300/80 hover:text-cyan-200 text-sm transition-colors"
            >
              <Icon name="Database" size={14} aria-hidden="true" />
              База заведений
            </Link>
          </div>

          <p className="text-white/40 text-[11px] uppercase tracking-widest mb-1.5">
            Внутренний документ · не для публикации
          </p>
          <h1 className="font-montserrat font-black text-2xl md:text-4xl leading-tight mb-3">
            База по городам-миллионникам
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-3xl leading-relaxed mb-5">
            16 городов России с населением от миллиона. Работаем волнами: сначала отрабатываем
            скрипты там, где конкуренция ниже, и только потом заходим в Москву и Петербург.
            Один город и одна ниша за раз — так письма получаются точными.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <div>
              <p className="font-montserrat font-black text-2xl">
                {loading ? "…" : totalDone}
                <span className="text-white/30 text-lg"> / {totalTarget}</span>
              </p>
              <p className="text-white/45 text-xs">контактов собрано</p>
            </div>
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                  style={{ width: `${Math.min(100, (totalDone / totalTarget) * 100)}%` }}
                />
              </div>
              <p className="text-white/35 text-xs mt-1.5">
                Цель — {totalTarget} организаций по 16 городам
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Ниша задаётся один раз и подставляется во все ссылки городов */}
        <section className="mb-8" aria-labelledby="niche">
          <h2 id="niche" className="font-montserrat font-black text-lg mb-1">
            Шаг 1. Выберите нишу
          </h2>
          <p className="text-white/50 text-sm mb-4">
            Ссылки ниже подстроятся под выбранную нишу. Не смешивайте ниши в одном заходе —
            письмо должно попадать в конкретную боль.
          </p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n.id}
                onClick={() => setNiche(n)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  niche.id === n.id
                    ? "bg-purple-500/20 border-purple-400/40 text-white"
                    : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/25"
                }`}
              >
                {n.label}
                {n.hot === "высокая" && (
                  <span className="ml-1.5 text-[10px] text-amber-300" title="Приоритетная ниша">
                    ●
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-200/80 mb-1">
              Что предлагаем нише «{niche.label}»
            </p>
            <p className="text-white/70 text-sm leading-relaxed">{niche.offer}</p>
          </div>
        </section>

        <section aria-labelledby="cities">
          <h2 id="cities" className="font-montserrat font-black text-lg mb-1">
            Шаг 2. Откройте город и соберите контакты
          </h2>
          <p className="text-white/50 text-sm mb-5">
            Ссылки открывают поиск по выбранной нише сразу в нужном городе. Собранное заносим в
            базу через импорт — дубли система отсеет сама.
          </p>

          {waves.map((w) => {
            const cities = CITIES.filter((c) => c.wave === w);
            const meta = WAVE_META[w];
            return (
              <div key={w} className="mb-8">
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${meta.tone}`}>
                    {meta.label}
                  </span>
                  <span className="text-white/40 text-xs">{cities.length} городов</span>
                </div>
                <p className="text-white/45 text-sm mb-3.5 max-w-3xl">{meta.why}</p>

                <div className="space-y-2.5">
                  {cities.map((c) => (
                    <CityRow
                      key={c.name}
                      city={c}
                      niche={niche}
                      done={byCity[c.name.toLowerCase()] || 0}
                      open={openCity === c.name}
                      onToggle={() => setOpenCity(openCity === c.name ? null : c.name)}
                      onAdded={reload}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5" aria-labelledby="how">
          <h2 id="how" className="font-montserrat font-black text-lg mb-3">
            Шаг 3. Как заносить в базу
          </h2>
          <ol className="space-y-2.5 text-sm text-white/70">
            {[
              "Собираем в таблицу колонки: название, город, телефон, email, сайт, заметка",
              "В заметку сразу пишем зацепку: «оплата на карту», «нет личного кабинета», «жалобы в отзывах» — без неё письмо будет общим",
              "Открываем базу заведений и жмём «Радар (импорт)»",
              "Вставляем таблицу — система отсеет дубли по email и по паре название+город",
              "Дальше работаем по алгоритму: статусы, касания, демо",
            ].map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-200 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-px">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2.5 mt-4">
            <Link
              to="/admin/edu-institutions"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Icon name="Radar" size={15} aria-hidden="true" />
              Открыть импорт
            </Link>
            <Link
              to="/admin/playbook"
              className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/12 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Icon name="Compass" size={15} aria-hidden="true" />
              Алгоритм работы с контактами
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function CityRow({
  city,
  niche,
  done,
  open,
  onToggle,
  onAdded,
}: {
  city: City;
  niche: Niche;
  done: number;
  open: boolean;
  onToggle: () => void;
  onAdded: () => void;
}) {
  const pct = Math.min(100, (done / city.target) * 100);
  const links = buildSearchLinks(city, niche);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="flex-1 min-w-0">
          <span className="flex flex-wrap items-baseline gap-2 mb-1">
            <span className="font-montserrat font-black text-base">{city.name}</span>
            <span className="text-white/35 text-xs">{city.pop} млн</span>
            <span className="text-white/25 text-xs">· {city.district} ФО</span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className="h-1.5 w-24 rounded-full bg-white/8 overflow-hidden flex-shrink-0">
              <span
                className={`block h-full transition-all ${pct >= 100 ? "bg-emerald-400" : "bg-purple-400"}`}
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className={`text-xs ${done > 0 ? "text-white/60" : "text-white/30"}`}>
              {done} / {city.target} собрано
            </span>
          </span>
        </span>
        <Icon
          name="ChevronDown"
          size={17}
          aria-hidden="true"
          className={`text-white/35 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 animate-fade-in">
          <p className="text-white/55 text-sm leading-relaxed">{city.note}</p>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
              Искать «{niche.query}» в городе {city.name}
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/25 hover:bg-white/[0.06] transition-all"
                >
                  <Icon name={l.icon} size={16} className="text-cyan-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{l.label}</span>
                    <span className="block text-white/45 text-xs leading-snug">{l.note}</span>
                  </span>
                  <Icon name="ExternalLink" size={13} className="text-white/25 flex-shrink-0 mt-1" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Нашли организацию в 2ГИС — заносим здесь же, не уходя со страницы */}
          <QuickAddContact city={city.name} nicheLabel={niche.label} onAdded={onAdded} />
        </div>
      )}
    </article>
  );
}