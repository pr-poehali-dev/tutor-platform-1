import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import SimHeader from "@/components/simulators/SimHeader";
import { TEMPLATES } from "@/components/simulators/templates";
import { AUDIENCE_LABEL, Audience, CATEGORY_LABEL, Category } from "@/components/simulators/types";

const CAT_STYLE: Record<Category, { icon: string; grad: string }> = {
  physics: { icon: "Zap", grad: "from-amber-500/30 to-orange-600/10" },
  safety: { icon: "ShieldAlert", grad: "from-rose-500/30 to-red-700/10" },
  profession: { icon: "HardHat", grad: "from-sky-500/30 to-blue-700/10" },
  biology: { icon: "Microscope", grad: "from-emerald-500/30 to-teal-700/10" },
  chemistry: { icon: "FlaskConical", grad: "from-fuchsia-500/30 to-purple-700/10" },
  other: { icon: "Box", grad: "from-slate-500/30 to-slate-700/10" },
};

const FEATURES = [
  { icon: "Globe", title: "Без шлема и установки", text: "Открывается по ссылке на телефоне, планшете и компьютере. Есть VR-шлем — включается полное погружение." },
  { icon: "Sparkles", title: "ИИ собирает сценарий", text: "Опишите навык словами — ИИ подберёт объекты, шаги, типичные ошибки и подсказки." },
  { icon: "MessageSquareWarning", title: "Объясняет ошибки", text: "Не «неверно», а почему так нельзя. Опасные ошибки — отдельно, как в реальной аттестации." },
  { icon: "BarChart3", title: "Аналитика по классу", text: "Баллы, время и «тепловая карта» шагов, на которых ученики ошибаются чаще всего." },
];

/** Каталог готовых тренажёров + вход в конструктор. */
export default function SimCatalog() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [aud, setAud] = useState<Audience | "all">("all");

  const cats = useMemo(() => Array.from(new Set(TEMPLATES.map((t) => t.category))), []);
  const list = TEMPLATES.filter((t) => (cat === "all" || t.category === cat) && (aud === "all" || t.audience.includes(aud)));

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="3D и VR-тренажёры для школ, колледжей и предприятий — конструктор с ИИ"
        description="Готовые 3D/VR-тренажёры: электрические цепи, пожарная безопасность, первая помощь, электромонтёр, сварщик, микроскоп. Работают в браузере и в VR-шлеме. Конструктор с ИИ без программирования."
        keywords="vr тренажер, 3d тренажер, виртуальная лаборатория, тренажер охрана труда, конструктор vr тренажеров, тренажер для школы"
        canonical="https://xn--h1amcedk2a6b.xn--p1ai/trenazhery"
      />
      <SimHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6">
        <section className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/15 px-4 py-1.5">
            <Icon name="Glasses" size={13} className="text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">Школы · Колледжи · Предприятия</span>
          </div>
          <h1 className="mb-4 font-montserrat text-3xl font-black leading-tight md:text-5xl">
            Практика, которую{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">не провести в кабинете</span>
          </h1>
          <p className="mx-auto mb-7 max-w-2xl text-base text-white/65 md:text-lg">
            3D-тренажёры в браузере и VR-шлеме. Выберите готовый или опишите свой — ИИ соберёт сценарий за минуту.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 font-black text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
            >
              <Icon name="Play" size={18} /> Попробовать тренажёр
            </a>
            <Link
              to="/trenazhery/konstruktor"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10"
            >
              <Icon name="Wand2" size={18} /> Создать свой
            </Link>
          </div>
        </section>

        <section className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Icon name={f.icon} size={22} className="mb-2 text-cyan-300" />
              <p className="mb-1 font-bold">{f.title}</p>
              <p className="text-sm text-white/60">{f.text}</p>
            </div>
          ))}
        </section>

        <section id="catalog" className="scroll-mt-20">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-montserrat text-2xl font-black">Готовые тренажёры</h2>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "school", "college", "company"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAud(a)}
                  className={`rounded-full px-3 py-1 text-sm ${aud === a ? "bg-white text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  {a === "all" ? "Для всех" : AUDIENCE_LABEL[a]}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5 flex flex-wrap gap-1.5">
            <button
              onClick={() => setCat("all")}
              className={`rounded-full px-3 py-1 text-sm ${cat === "all" ? "bg-violet-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
            >
              Все направления
            </button>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${cat === c ? "bg-violet-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
              >
                <Icon name={CAT_STYLE[c].icon} size={13} />
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => {
              const st = CAT_STYLE[t.category];
              return (
                <div key={t.slug} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                  <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${st.grad}`}>
                    <Icon name={st.icon} size={44} className="text-white/85" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/75">{CATEGORY_LABEL[t.category]}</span>
                      {t.audience.map((a) => (
                        <span key={a} className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-cyan-200">
                          {AUDIENCE_LABEL[a]}
                        </span>
                      ))}
                    </div>
                    <p className="mb-1 font-bold leading-snug">{t.title}</p>
                    <p className="mb-3 line-clamp-3 flex-1 text-sm text-white/60">{t.description}</p>
                    <p className="mb-3 flex items-center gap-3 whitespace-nowrap text-xs text-white/45">
                      <span className="flex items-center gap-1">
                        <Icon name="ListChecks" size={12} /> {t.steps.length} шагов
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={12} /> ~{t.minutes} мин
                      </span>
                      {t.grade && <span className="truncate">{t.grade}</span>}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        to={`/trenazhery/t/${t.slug}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
                      >
                        <Icon name="Play" size={14} /> Пройти
                      </Link>
                      <Link
                        to={`/trenazhery/konstruktor?from=${t.slug}`}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                        title="Взять за основу и изменить"
                      >
                        <Icon name="Pencil" size={14} /> Изменить
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link
              to="/trenazhery/konstruktor"
              className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 p-6 text-center text-white/60 transition hover:border-violet-400/60 hover:text-white"
            >
              <Icon name="Plus" size={36} />
              <p className="font-bold">Своего направления нет?</p>
              <p className="text-sm">Опишите навык — ИИ соберёт тренажёр, а вы поправите блоки</p>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
