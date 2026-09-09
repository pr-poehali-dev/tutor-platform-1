import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Card {
  to: string;
  icon: string;
  title: string;
  desc: string;
  meta: string;
}

interface Goal {
  id: string;
  label: string;
  icon: string;
  headline: string;
  timing: string;
  risk: string;
  cards: Card[];
}

const GOALS: Goal[] = [
  {
    id: "boost",
    label: "Усилить текущую работу",
    icon: "TrendingUp",
    headline: "Не меняя профессию — добавить инструмент, который делает вас дороже",
    timing: "Первый эффект — за 2–3 недели",
    risk: "Ничем не рискуете: работу менять не нужно",
    cards: [
      {
        to: "/courses/ai",
        icon: "Sparkles",
        title: "Нейросети для работы",
        desc: "Рутина, отчёты и переписка — за минуты вместо часов",
        meta: "4 курса · от 5 990 ₽",
      },
      {
        to: "/courses/marketing",
        icon: "Megaphone",
        title: "Нейросети в маркетинге",
        desc: "Контент, креативы и воронки без подрядчиков",
        meta: "от 4 990 ₽",
      },
      {
        to: "/courses/personalbrand",
        icon: "BadgeCheck",
        title: "Личный бренд эксперта",
        desc: "Чтобы клиенты приходили сами, а не по холодной базе",
        meta: "3 курса",
      },
    ],
  },
  {
    id: "extra",
    label: "Вторая профессия для подработки",
    icon: "Wallet",
    headline: "Навык, который можно продавать отдельно — по вечерам и выходным",
    timing: "Первые деньги — через 2–4 месяца",
    risk: "Тратится личное время, первые заказы приходят не сразу",
    cards: [
      {
        to: "/courses/prompteng",
        icon: "Terminal",
        title: "Промпт-инженер",
        desc: "Новая профессия на стыке ИИ и текста — с нуля до заказов",
        meta: "от 4 990 ₽",
      },
      {
        to: "/courses/neuroincome",
        icon: "Video",
        title: "Заработок на нейросетях",
        desc: "Контент, Reels и фриланс из дома, без программирования",
        meta: "от 3 990 ₽ · есть бесплатный",
      },
      {
        to: "/courses/marketing",
        icon: "Target",
        title: "Интернет-маркетолог",
        desc: "Реклама и рассылки — навык, который покупают всегда",
        meta: "от 4 990 ₽",
      },
    ],
  },
  {
    id: "change",
    label: "Сменить профессию",
    icon: "Route",
    headline: "Полный вход в новую сферу — там, где сейчас реальный дефицит кадров",
    timing: "6–12 месяцев до первого оффера",
    risk: "Нужен финансовый запас на период перехода",
    cards: [
      {
        to: "/courses/ved",
        icon: "Ship",
        title: "ВЭД и таможня",
        desc: "Дефицитная профессия с высоким доходом",
        meta: "130 000–208 000 ₽ на рынке",
      },
      {
        to: "/courses/tenders",
        icon: "FileCheck",
        title: "Тендеры и госзакупки",
        desc: "Стабильный спрос, полностью удалённая работа",
        meta: "40 000–130 000 ₽ на рынке",
      },
      {
        to: "/courses/analyst",
        icon: "ChartBar",
        title: "Аналитик данных",
        desc: "Вход в IT с готовым портфолио проектов",
        meta: "80 000–250 000 ₽ на рынке",
      },
    ],
  },
  {
    id: "business",
    label: "Своё дело",
    icon: "Rocket",
    headline: "Сначала считаем на калькуляторе, потом учимся, только потом вкладываем",
    timing: "От 3 месяцев",
    risk: "Максимальный: вкладываются собственные деньги",
    cards: [
      {
        to: "/bizlab",
        icon: "Calculator",
        title: "Проверить идею бесплатно",
        desc: "Юнит-экономика и точка безубыточности — без регистрации",
        meta: "Бесплатно · начните отсюда",
      },
      {
        to: "/courses/business",
        icon: "Briefcase",
        title: "MBA для предпринимателей",
        desc: "Управление, финансы и стратегия под реалии РФ",
        meta: "64 урока · есть бесплатный",
      },
      {
        to: "/courses/business",
        icon: "FileText",
        title: "Запуск бизнеса с нуля",
        desc: "ИП, налоги и расчётный счёт — по шагам, без юриста",
        meta: "от 5 990 ₽",
      },
    ],
  },
];

export default function AdultTracks() {
  const [active, setActive] = useState(GOALS[0].id);
  const goal = GOALS.find((g) => g.id === active) || GOALS[0];

  return (
    <section
      className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16"
      aria-labelledby="adult-tracks-title"
    >
      <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.08] via-transparent to-violet-500/[0.07] p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 rounded-full px-3.5 py-1 mb-3">
              <Icon name="Briefcase" size={13} className="text-cyan-300" />
              <span className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider">
                Взрослым · 35 курсов
              </span>
            </div>
            <h2
              id="adult-tracks-title"
              className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight"
            >
              Учиться, чтобы <span className="gradient-text-purple">зарабатывать больше</span>
            </h2>
            <p className="text-white/65 text-sm md:text-base mt-3 max-w-2xl">
              Это не только про школу. Взрослым — профессии, нейросети и бизнес. Выберите свою цель,
              а мы покажем короткий путь к ней.
            </p>
          </div>
          <Link
            to="/remote-professions"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors whitespace-nowrap"
          >
            Удалённые профессии
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>

        <div
          className="flex flex-wrap gap-2 mb-6"
          role="tablist"
          aria-label="Цель обучения"
        >
          {GOALS.map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={active === g.id}
              onClick={() => setActive(g.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                active === g.id
                  ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg"
                  : "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon name={g.icon} size={15} />
              {g.label}
            </button>
          ))}
        </div>

        <p className="text-white/80 text-sm md:text-base font-semibold mb-4">{goal.headline}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goal.cards.map((c) => (
            <Link
              key={c.title + c.to}
              to={c.to}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/35 p-5 transition-all flex flex-col"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/25 to-violet-500/25 border border-white/10 flex items-center justify-center mb-3">
                <Icon name={c.icon} size={18} className="text-cyan-200" />
              </div>
              <h3 className="font-montserrat font-bold text-white text-base leading-snug mb-1.5">
                {c.title}
              </h3>
              <p className="text-white/60 text-[13px] leading-relaxed mb-3 flex-1">{c.desc}</p>
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/8">
                <span className="text-[11px] text-cyan-200/90 font-semibold">{c.meta}</span>
                <Icon
                  name="ArrowRight"
                  size={14}
                  className="text-white/40 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20 px-4 py-3">
            <Icon name="Clock" size={15} className="text-emerald-300 mt-0.5 shrink-0" />
            <span className="text-emerald-100/85 text-[13px] leading-relaxed">{goal.timing}</span>
          </div>
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 px-4 py-3">
            <Icon name="TriangleAlert" size={15} className="text-amber-300 mt-0.5 shrink-0" />
            <span className="text-amber-100/85 text-[13px] leading-relaxed">{goal.risk}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white/[0.04] border border-white/10 px-5 py-4">
          <p className="text-white/70 text-[13px] text-center sm:text-left">
            Не уверены, что подойдёт? Пройдите бесплатный тест — он покажет, где ваши сильные стороны
            станут преимуществом.
          </p>
          <div className="flex gap-2.5 shrink-0">
            <Link
              to="/know-yourself"
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              Пройти тест
            </Link>
            <Link
              to="/kursy-dlya-vzroslyh"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-opacity"
            >
              Все 35 курсов
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
