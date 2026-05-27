import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Track {
  to: string;
  emoji: string;
  badgeText: string;
  badgeIcon: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: { icon: string; label: string }[];
  cta: string;
  gradient: string;
  borderColor: string;
  glow1: string;
  glow2: string;
  badgeColor: string;
  ctaColor: string;
}

const TRACKS: Track[] = [
  {
    to: "/mgu-track",
    emoji: "🎓",
    badgeText: "Премиум-трек · Поступление в МГУ",
    badgeIcon: "Crown",
    title: "МГУ-трек",
    subtitle: "Стратегия поступления с ИИ-стратегом",
    description:
      "Калькулятор шансов по 12 факультетам МГУ. Индивидуальный план до ЕГЭ. БВИ через перечневые олимпиады. ДВИ под каждый факультет.",
    highlights: [
      { icon: "Users", label: "2 850 учеников" },
      { icon: "Trophy", label: "340+ БВИ за 2025" },
      { icon: "BookOpen", label: "12 факультетов" },
    ],
    cta: "Построить план поступления",
    gradient: "from-amber-900/40 via-orange-900/25 to-rose-900/30",
    borderColor: "border-amber-500/30",
    glow1: "bg-amber-500/20",
    glow2: "bg-rose-500/20",
    badgeColor: "bg-amber-500/20 border-amber-500/40 text-amber-200",
    ctaColor: "from-amber-500 to-orange-600",
  },
  {
    to: "/writing-craft",
    emoji: "✍️",
    badgeText: "Премиум-курс · Журфак МГУ, ВШЭ, СПбГУ",
    badgeIcon: "Feather",
    title: "Мастерская слова",
    subtitle: "Сочинение, эссе, журналистика",
    description:
      "Итоговое сочинение и ЕГЭ на 25 баллов. Журналистские жанры: репортаж, очерк, рецензия, интервью, колонка. Разбор Толстого, Чехова, Бунина, Довлатова.",
    highlights: [
      { icon: "FileText", label: "8 модулей · 64 урока" },
      { icon: "PenTool", label: "12 работ в портфолио" },
      { icon: "Target", label: "ДВИ журфака МГУ" },
    ],
    cta: "Открыть программу курса",
    gradient: "from-rose-900/35 via-purple-900/25 to-indigo-900/30",
    borderColor: "border-rose-500/30",
    glow1: "bg-rose-500/20",
    glow2: "bg-purple-500/20",
    badgeColor: "bg-rose-500/20 border-rose-500/40 text-rose-200",
    ctaColor: "from-rose-500 to-purple-600",
  },
  {
    to: "/graduate",
    emoji: "🎓",
    badgeText: "Модуль · Выпускник 11 класса",
    badgeIcon: "GraduationCap",
    title: "Выпускник",
    subtitle: "Подбор вуза и программа поступления",
    description:
      "100 вузов России: МГУ, СПбГУ, МФТИ, Бауман, ВШЭ + военные вузы. 4 шага: регион → вуз → факультет → твоя программа подготовки к ЕГЭ с проходными баллами.",
    highlights: [
      { icon: "MapPin", label: "30 регионов" },
      { icon: "Building2", label: "100 вузов" },
      { icon: "Shield", label: "Военные вузы" },
    ],
    cta: "Подобрать вуз",
    gradient: "from-purple-900/40 via-pink-900/25 to-rose-900/30",
    borderColor: "border-purple-500/30",
    glow1: "bg-purple-500/20",
    glow2: "bg-pink-500/20",
    badgeColor: "bg-purple-500/20 border-purple-500/40 text-purple-200",
    ctaColor: "from-purple-500 to-pink-600",
  },
  {
    to: "/know-yourself",
    emoji: "🪞",
    badgeText: "Модуль · Профориентация",
    badgeIcon: "Compass",
    title: "Познай себя",
    subtitle: "Подробный тест: профессия и вуз",
    description:
      "61 вопрос по методике Холланда (RIASEC) + анализ способностей и ценностей. Покажет тип личности, топ-10 профессий с зарплатами и конкретные вузы, где учат именно на твою специальность.",
    highlights: [
      { icon: "ClipboardList", label: "6 блоков · 61 вопрос" },
      { icon: "Trophy", label: "Топ-10 профессий" },
      { icon: "Building2", label: "Подбор вузов" },
    ],
    cta: "Пройти тест",
    gradient: "from-cyan-900/40 via-blue-900/25 to-indigo-900/30",
    borderColor: "border-cyan-500/30",
    glow1: "bg-cyan-500/20",
    glow2: "bg-indigo-500/20",
    badgeColor: "bg-cyan-500/20 border-cyan-500/40 text-cyan-200",
    ctaColor: "from-cyan-500 to-blue-600",
  },
  {
    to: "/exam-checklist",
    emoji: "⏰",
    badgeText: "Модуль · До ЕГЭ",
    badgeIcon: "AlarmClock",
    title: "До ЕГЭ — чек-лист",
    subtitle: "Пошаговый план выпускника 2026",
    description:
      "Обратный отсчёт по предметам, документы, дедлайны итогового сочинения и подачи в вузы, психологическая подготовка и логистика на день экзамена. Прогресс синхронизируется в личный кабинет.",
    highlights: [
      { icon: "CalendarDays", label: "Календарь 2026" },
      { icon: "ListChecks", label: "30+ задач" },
      { icon: "AlarmClock", label: "Live countdown" },
    ],
    cta: "Создать чек-лист",
    gradient: "from-rose-900/40 via-amber-900/25 to-orange-900/30",
    borderColor: "border-rose-500/30",
    glow1: "bg-rose-500/20",
    glow2: "bg-amber-500/20",
    badgeColor: "bg-rose-500/20 border-rose-500/40 text-rose-200",
    ctaColor: "from-rose-500 to-amber-600",
  },
  {
    to: "/feed",
    emoji: "📡",
    badgeText: "Модуль · Лента",
    badgeIcon: "Newspaper",
    title: "Лента «Хочу всё знать»",
    subtitle: "Наука, культура, ИИ и роботы",
    description:
      "Живой журнал для школьников: научные открытия, новости Минпросвещения, культура, разработки нейросетей и роботов. ИИ-куратор подбирает материалы из проверенных источников. Можешь и сам публиковать свои статьи — после модерации они появятся в общей ленте.",
    highlights: [
      { icon: "Sparkles", label: "ИИ-куратор" },
      { icon: "PenLine", label: "Публикация" },
      { icon: "ShieldCheck", label: "Модерация" },
    ],
    cta: "Открыть ленту",
    gradient: "from-fuchsia-900/40 via-purple-900/25 to-cyan-900/30",
    borderColor: "border-fuchsia-500/30",
    glow1: "bg-fuchsia-500/20",
    glow2: "bg-cyan-500/20",
    badgeColor: "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-200",
    ctaColor: "from-fuchsia-500 to-cyan-600",
  },
];

export default function PremiumTracks() {
  return (
    <section
      className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16"
      aria-label="Премиум-треки: поступление в МГУ и журфак"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-4">
          <Icon name="Crown" size={14} className="text-amber-300" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
            Премиум-треки
          </span>
        </div>
        <h2 className="font-montserrat font-black text-3xl md:text-4xl mb-3">
          Углублённая подготовка к топ-вузам России
        </h2>
        <p className="text-white/65 text-base md:text-lg max-w-3xl mx-auto">
          Авторские программы для тех, кто целится в МГУ, ВШЭ, СПбГУ. ИИ-стратег,
          индивидуальный план, разбор по официальным критериям ФИПИ.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {TRACKS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`group relative bg-gradient-to-br ${t.gradient} border ${t.borderColor} rounded-3xl p-6 md:p-7 overflow-hidden hover:scale-[1.015] transition-transform`}
          >
            <div
              className={`absolute -top-16 -right-16 w-64 h-64 ${t.glow1} rounded-full blur-3xl pointer-events-none`}
            />
            <div
              className={`absolute -bottom-16 -left-16 w-64 h-64 ${t.glow2} rounded-full blur-3xl pointer-events-none`}
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="text-5xl">{t.emoji}</div>
                <div
                  className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 ${t.badgeColor}`}
                >
                  <Icon name={t.badgeIcon} size={11} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {t.badgeText}
                  </span>
                </div>
              </div>

              <h3 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-1">
                {t.title}
              </h3>
              <p className="text-white/75 text-sm font-bold mb-3">{t.subtitle}</p>
              <p className="text-white/65 text-sm leading-relaxed mb-5">
                {t.description}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {t.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-center"
                  >
                    <Icon
                      name={h.icon}
                      size={14}
                      className="text-white/70 mx-auto mb-1"
                    />
                    <p className="text-white/80 text-[11px] font-bold leading-tight">
                      {h.label}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${t.ctaColor} text-white font-black text-sm px-5 py-2.5 rounded-xl group-hover:gap-3 transition-all`}
              >
                {t.cta}
                <Icon name="ArrowRight" size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}