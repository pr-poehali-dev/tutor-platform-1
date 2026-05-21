import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const ACHIEVEMENTS = [
  {
    icon: "Trophy",
    title: "Чемпион знаний",
    desc: "Завершил 10 курсов",
    color: "from-yellow-400 to-orange-500",
    unlocked: true,
  },
  {
    icon: "Zap",
    title: "Быстрый старт",
    desc: "Первый урок за 24 ч",
    color: "from-cyan-400 to-blue-500",
    unlocked: true,
  },
  {
    icon: "Flame",
    title: "На волне",
    desc: "7 дней подряд",
    color: "from-red-400 to-pink-500",
    unlocked: true,
  },
  {
    icon: "Gem",
    title: "Идеалист",
    desc: "100% правильных ответов",
    color: "from-purple-400 to-violet-600",
    unlocked: false,
  },
  {
    icon: "Rocket",
    title: "Суперскорость",
    desc: "Урок за 5 минут",
    color: "from-green-400 to-emerald-500",
    unlocked: false,
  },
  {
    icon: "Star",
    title: "Звезда класса",
    desc: "Топ-1 в рейтинге",
    color: "from-yellow-300 to-amber-500",
    unlocked: false,
  },
];

const SUBJECT_PROGRESS = [
  { subject: "Математика", emoji: "📐", progress: 78, color: "#a855f7" },
  { subject: "Информатика", emoji: "💻", progress: 92, color: "#00d4ff" },
  { subject: "Английский", emoji: "🌍", progress: 55, color: "#f72585" },
];

const calendarData = Array.from({ length: 35 }, (_, i) => {
  const types = [0, 0, 1, 1, 2, 2, 3, 4];
  return types[i % types.length];
});

interface CoursesSectionProps {
  activeCourse?: number | null;
  onSetActiveCourse?: (id: number | null) => void;
}

export default function CoursesSection(_props: CoursesSectionProps) {
  return (
    <>
      {/* Progress */}
      <section id="progress" className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-2">
                Прогресс
              </p>
              <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white">
                Ты на <span className="gradient-text-purple">правильном пути</span>
              </h2>
              <p className="text-white/70 text-sm mt-2 max-w-xl">
                Каждый урок — это XP, стрик и шаг к цели. Платформа показывает прогресс
                по каждому предмету и не даёт сбиться с темпа.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Профиль */}
            <div className="bg-card/60 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl flex-shrink-0">
                  🦁
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-black text-xl text-white">
                    Мой профиль
                  </h3>
                  <p className="text-white/70 text-sm">Уровень 7 · 4 820 XP</p>
                </div>
                <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
                  <Icon name="Flame" size={14} className="text-amber-400" />
                  <span className="text-amber-300 text-sm font-bold">7 дней</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/75">До уровня 8</span>
                  <span className="text-purple-300 font-semibold">
                    4 820 / 6 000 XP
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full progress-shine rounded-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>
              </div>

              {SUBJECT_PROGRESS.map((item) => (
                <div key={item.subject} className="mb-3.5 last:mb-0">
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="text-white/80 flex items-center gap-1.5">
                      <span>{item.emoji}</span> {item.subject}
                    </span>
                    <span className="font-bold" style={{ color: item.color }}>
                      {item.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 8px ${item.color}80`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Календарь и метрики */}
            <div className="bg-card/60 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-montserrat font-black text-xl text-white">
                  Активность за месяц
                </h3>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Icon name="TrendingUp" size={12} /> +18%
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 mb-5">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-white/50 text-[10px] pb-1 font-medium"
                  >
                    {d}
                  </div>
                ))}
                {calendarData.map((type, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-md transition-transform hover:scale-110"
                    style={{
                      backgroundColor:
                        type === 0
                          ? "rgba(255,255,255,0.06)"
                          : type === 1
                            ? "rgba(168,85,247,0.3)"
                            : type === 2
                              ? "rgba(168,85,247,0.6)"
                              : type === 3
                                ? "rgba(168,85,247,0.9)"
                                : "rgba(247,37,133,0.85)",
                      boxShadow:
                        type >= 3 ? "0 0 8px rgba(168,85,247,0.5)" : "none",
                    }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Уроков", value: "42", icon: "BookOpen", color: "#a855f7" },
                  { label: "Часов", value: "18", icon: "Clock", color: "#00d4ff" },
                  { label: "Задач", value: "156", icon: "CheckCircle2", color: "#06d6a0" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center"
                  >
                    <Icon
                      name={s.icon}
                      size={18}
                      className="mx-auto mb-1.5"
                      style={{ color: s.color }}
                    />
                    <div
                      className="font-montserrat font-black text-xl"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </div>
                    <div className="text-white/60 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section id="achievements" className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-2">
                Достижения
              </p>
              <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white">
                Собирай <span className="gradient-text-pink">награды</span>
              </h2>
              <p className="text-white/70 text-sm mt-2 max-w-xl">
                Геймификация делает учёбу затягивающей: каждый бейдж — повод гордиться
                собой.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/25">
              <Icon name="Award" size={14} className="text-pink-300" />
              <span className="text-pink-200 text-sm font-semibold">
                3 из 6 открыто
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.title}
                className={`relative bg-card/60 border rounded-2xl p-5 overflow-hidden group transition-all ${
                  ach.unlocked
                    ? "border-white/15 hover:border-white/30 cursor-pointer"
                    : "border-white/8 opacity-65"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${ach.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                ></div>
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ach.color} flex items-center justify-center mb-4 shadow-lg ${
                      !ach.unlocked && "grayscale"
                    }`}
                  >
                    <Icon name={ach.icon} size={26} className="text-white" />
                  </div>
                  <h3 className="font-montserrat font-black text-base text-white mb-1">
                    {ach.title}
                  </h3>
                  <p className="text-white/70 text-sm">{ach.desc}</p>
                  {ach.unlocked ? (
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                      <span className="text-emerald-400 text-xs font-semibold">
                        Получено
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-3">
                      <Icon name="Lock" size={12} className="text-white/40" />
                      <span className="text-white/50 text-xs">Заблокировано</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA-блок вместо дублирующей сетки курсов */}
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            <Link
              to="/exam-bank"
              className="group rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 to-pink-500/10 p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/25 flex items-center justify-center">
                  <Icon name="Library" size={20} className="text-purple-300" />
                </div>
                <h3 className="font-montserrat font-bold text-lg text-white">
                  Тренируйся на реальных заданиях
                </h3>
              </div>
              <p className="text-white/75 text-sm mb-4 leading-relaxed">
                Сборник ОГЭ и ЕГЭ 2020–2025 с пошаговыми разборами, теорией и
                типичными ошибками.
              </p>
              <span className="inline-flex items-center gap-1.5 text-purple-300 text-sm font-semibold group-hover:gap-2.5 transition-all">
                Открыть сборник <Icon name="ArrowRight" size={14} />
              </span>
            </Link>

            <Link
              to="/score-calculator"
              className="group rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-6 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/25 flex items-center justify-center">
                  <Icon name="Calculator" size={20} className="text-cyan-300" />
                </div>
                <h3 className="font-montserrat font-bold text-lg text-white">
                  Узнай свой балл за секунду
                </h3>
              </div>
              <p className="text-white/75 text-sm mb-4 leading-relaxed">
                Калькулятор переведёт первичные баллы в тестовые по официальным
                шкалам ФИПИ 2024–2025.
              </p>
              <span className="inline-flex items-center gap-1.5 text-cyan-300 text-sm font-semibold group-hover:gap-2.5 transition-all">
                Посчитать баллы <Icon name="ArrowRight" size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}