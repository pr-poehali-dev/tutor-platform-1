import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/f7a109b5-3a4a-4080-a8ab-a6a4d093b14e.jpg";
const COURSES_IMAGE = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/98ce052d-dd18-41cd-950f-a1514e0988e2.jpg";

const COURSES = [
  { id: 1, title: "Математика", emoji: "📐", color: "from-purple-600 to-blue-500", lessons: 48, rating: 4.9, tag: "Популярный", students: "12к+" },
  { id: 2, title: "Физика", emoji: "⚡", color: "from-cyan-500 to-blue-600", lessons: 36, rating: 4.8, tag: "Новый", students: "8к+" },
  { id: 3, title: "Химия", emoji: "🧪", color: "from-green-500 to-teal-600", lessons: 42, rating: 4.7, tag: "", students: "6к+" },
  { id: 4, title: "Информатика", emoji: "💻", color: "from-pink-500 to-rose-600", lessons: 54, rating: 5.0, tag: "Хит", students: "15к+" },
  { id: 5, title: "История", emoji: "🏛️", color: "from-orange-500 to-amber-500", lessons: 60, rating: 4.6, tag: "", students: "9к+" },
  { id: 6, title: "Английский", emoji: "🌍", color: "from-violet-500 to-purple-600", lessons: 72, rating: 4.9, tag: "Популярный", students: "20к+" },
  { id: 7, title: "Литература", emoji: "📚", color: "from-rose-500 to-pink-600", lessons: 40, rating: 4.7, tag: "", students: "7к+" },
  { id: 8, title: "Биология", emoji: "🧬", color: "from-emerald-500 to-green-600", lessons: 38, rating: 4.8, tag: "Новый", students: "5к+" },
];

const ACHIEVEMENTS = [
  { icon: "🏆", title: "Чемпион знаний", desc: "Завершил 10 курсов", color: "from-yellow-400 to-orange-500" },
  { icon: "⚡", title: "Быстрый старт", desc: "Первый урок за 24ч", color: "from-cyan-400 to-blue-500" },
  { icon: "🔥", title: "На волне", desc: "7 дней подряд", color: "from-red-400 to-pink-500" },
  { icon: "💎", title: "Идеалист", desc: "100% правильных ответов", color: "from-purple-400 to-violet-600" },
  { icon: "🚀", title: "Суперскорость", desc: "Урок за 5 минут", color: "from-green-400 to-emerald-500" },
  { icon: "🌟", title: "Звезда класса", desc: "Топ-1 в рейтинге", color: "from-yellow-300 to-amber-500" },
];

const LEADERBOARD = [
  { rank: 1, name: "Алекс М.", avatar: "🦁", points: 9840, badge: "🥇" },
  { rank: 2, name: "Соня К.", avatar: "🦊", points: 8720, badge: "🥈" },
  { rank: 3, name: "Данил П.", avatar: "🐺", points: 7650, badge: "🥉" },
  { rank: 4, name: "Маша Т.", avatar: "🐱", points: 6430, badge: "" },
  { rank: 5, name: "Артём В.", avatar: "🐸", points: 5890, badge: "" },
];

const NAV_ITEMS = [
  { label: "Курсы", icon: "BookOpen", section: "courses" },
  { label: "Прогресс", icon: "TrendingUp", section: "progress" },
  { label: "Достижения", icon: "Trophy", section: "achievements" },
  { label: "Рейтинг", icon: "BarChart2", section: "leaderboard" },
];

const STATS = [
  { value: "50+", label: "Предметов", icon: "📖", color: "#a855f7" },
  { value: "200к+", label: "Учеников", icon: "👥", color: "#00d4ff" },
  { value: "4.9", label: "Средняя оценка", icon: "⭐", color: "#ffd60a" },
  { value: "98%", label: "Сдают ЕГЭ", icon: "🎯", color: "#06d6a0" },
];

const calendarData = Array.from({ length: 35 }, (_, i) => {
  const types = [0, 0, 1, 1, 2, 2, 3, 4];
  return types[i % types.length];
});

export default function Index() {
  const [activeSection, setActiveSection] = useState("courses");
  const [activeCourse, setActiveCourse] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + 'px',
              height: (i % 3) + 1 + 'px',
              left: ((i * 137.5) % 100) + '%',
              top: ((i * 97.3) % 100) + '%',
              opacity: 0.15 + (i % 4) * 0.1,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i % 5) * 0.6}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg animate-pulse-glow">
                🚀
              </div>
              <span className="font-montserrat font-black text-lg gradient-text-purple">УчисьПро</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.section}
                  onClick={() => scrollTo(item.section)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeSection === item.section
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <Icon name={item.icon} size={15} />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2">
                Войти
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity glow-purple">
                Начать бесплатно
              </button>
            </div>

            <button
              className="md:hidden text-white/70 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 animate-fade-in">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.section}
                  onClick={() => scrollTo(item.section)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-all"
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2">
                <button className="text-sm text-white/70 py-2">Войти</button>
                <button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl">
                  Начать бесплатно
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse inline-block"></span>
                <span className="text-sm text-purple-300 font-medium">200 000+ школьников уже учатся</span>
              </div>

              <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5 animate-fade-in-up animate-delay-100">
                Учись{" "}
                <span className="gradient-text-purple text-glow-purple">ярко</span>,<br />
                расти{" "}
                <span className="gradient-text-pink text-glow-pink">быстро</span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-md animate-fade-in-up animate-delay-200">
                Интерактивные уроки, реальные задачи и крутые достижения — всё, чтобы ты кайфовал от учёбы
              </p>

              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animate-delay-300">
                <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-2xl text-base flex items-center gap-2 hover:opacity-90 transition-all glow-purple">
                  <span>Начать учиться</span>
                  <Icon name="ArrowRight" size={18} />
                </button>
                <button className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all font-medium">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Icon name="Play" size={14} />
                  </div>
                  Посмотреть урок
                </button>
              </div>

              <div className="flex gap-6 mt-10 animate-fade-in-up animate-delay-400">
                {STATS.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <div className="font-montserrat font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-up animate-delay-200">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 glow-purple">
                <img src={HERO_IMAGE} alt="Образовательная платформа" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
              </div>

              <div className="absolute -left-6 top-1/4 bg-card/90 backdrop-blur-sm border border-white/15 rounded-2xl p-3 animate-float shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <div className="text-xs font-bold text-white">+120 XP</div>
                    <div className="text-xs text-white/50">за урок</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 bottom-1/3 bg-card/90 backdrop-blur-sm border border-white/15 rounded-2xl p-3 animate-float-delayed shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <div className="text-xs font-bold text-white">7 дней подряд</div>
                    <div className="text-xs text-white/50">стрик!</div>
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl px-5 py-2.5 shadow-xl animate-float-slow">
                <div className="flex items-center gap-2 text-white text-sm font-bold">
                  <span>🎯</span> Следующий урок через 2 минуты
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none"></div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-card/50 backdrop-blur-sm border border-white/8 rounded-2xl p-5 text-center card-hover">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="font-montserrat font-black text-2xl md:text-3xl" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-white/50 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">Предметы</p>
              <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white">
                Выбери свой <span className="gradient-text-purple">курс</span>
              </h2>
            </div>
            <button className="hidden md:flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              Все курсы <Icon name="ArrowRight" size={16} />
            </button>
          </div>

          <div className="mb-8 rounded-3xl overflow-hidden border border-white/10 relative">
            <img src={COURSES_IMAGE} alt="Курсы" className="w-full h-48 md:h-64 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent flex items-center px-8">
              <div>
                <p className="text-white/60 text-sm mb-1">Выбирай из</p>
                <p className="font-montserrat font-black text-3xl text-white">50+ предметов</p>
                <p className="text-purple-300 text-sm mt-1">для 5–11 класса</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COURSES.map((course) => (
              <div
                key={course.id}
                className={`relative bg-card border rounded-2xl overflow-hidden card-hover cursor-pointer transition-all duration-300 ${
                  activeCourse === course.id ? "border-purple-500/50 glow-purple" : "border-white/8 hover:border-white/20"
                }`}
                onClick={() => setActiveCourse(activeCourse === course.id ? null : course.id)}
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${course.color}`}></div>
                <div className="p-4">
                  {course.tag && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-3 inline-block ${
                      course.tag === "Хит" ? "bg-pink-500/20 text-pink-400" :
                      course.tag === "Новый" ? "bg-cyan-500/20 text-cyan-400" :
                      "bg-purple-500/20 text-purple-400"
                    }`}>
                      {course.tag}
                    </span>
                  )}
                  <div className="text-4xl mb-3">{course.emoji}</div>
                  <h3 className="font-montserrat font-black text-base text-white mb-1">{course.title}</h3>
                  <p className="text-white/40 text-xs">{course.lessons} уроков</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/8">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-white/70 text-xs font-medium">{course.rating}</span>
                    </div>
                    <span className="text-white/40 text-xs">{course.students}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress */}
      <section id="progress" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-2">Прогресс</p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white">
              Ты на <span className="gradient-text-purple">правильном пути</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card/60 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl">
                  🦁
                </div>
                <div>
                  <h3 className="font-montserrat font-black text-xl text-white">Мой профиль</h3>
                  <p className="text-white/50 text-sm">Уровень 7 · 4 820 XP</p>
                </div>
                <div className="ml-auto bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-3 py-1.5">
                  <span className="text-yellow-400 text-sm font-bold">🔥 7 дней</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">До уровня 8</span>
                  <span className="text-purple-400 font-semibold">4 820 / 6 000 XP</span>
                </div>
                <div className="h-3 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full progress-shine rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              {[
                { subject: "📐 Математика", progress: 78, color: "#a855f7" },
                { subject: "💻 Информатика", progress: 92, color: "#00d4ff" },
                { subject: "🌍 Английский", progress: 55, color: "#f72585" },
              ].map((item) => (
                <div key={item.subject} className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/70">{item.subject}</span>
                    <span className="font-bold" style={{ color: item.color }}>{item.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.progress}%`, backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card/60 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <h3 className="font-montserrat font-black text-xl text-white mb-5">Активность за месяц</h3>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => (
                  <div key={d} className="text-center text-white/30 text-xs pb-1">{d}</div>
                ))}
                {calendarData.map((type, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg transition-transform hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: type === 0 ? 'rgba(255,255,255,0.05)' :
                        type === 1 ? 'rgba(168,85,247,0.3)' :
                        type === 2 ? 'rgba(168,85,247,0.6)' :
                        type === 3 ? 'rgba(168,85,247,0.9)' : 'rgba(247,37,133,0.8)',
                      boxShadow: type >= 3 ? '0 0 8px rgba(168,85,247,0.5)' : 'none',
                    }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Уроков", value: "42", icon: "📖", color: "#a855f7" },
                  { label: "Часов", value: "18", icon: "⏱️", color: "#00d4ff" },
                  { label: "Задач", value: "156", icon: "✅", color: "#06d6a0" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-2xl p-3 text-center">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="font-montserrat font-black text-xl" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-white/40 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section id="achievements" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-2">Достижения</p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white">
              Собирай <span className="gradient-text-pink">награды</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((ach, i) => (
              <div
                key={ach.title}
                className={`relative bg-card/60 border border-white/10 rounded-2xl p-5 card-hover overflow-hidden cursor-pointer group ${i < 3 ? '' : 'opacity-60'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${ach.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ach.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                    {ach.icon}
                  </div>
                  <h3 className="font-montserrat font-black text-base text-white mb-1">{ach.title}</h3>
                  <p className="text-white/50 text-sm">{ach.desc}</p>
                  {i < 3 ? (
                    <div className="flex items-center gap-1 mt-3">
                      <span className="w-2 h-2 rounded-full bg-neon-green inline-block"></span>
                      <span className="text-neon-green text-xs font-semibold">Получено!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-3">
                      <Icon name="Lock" size={12} className="text-white/30" />
                      <span className="text-white/30 text-xs">Заблокировано</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">Рейтинг</p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white">
              Топ <span className="gradient-text-purple">лидеров</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card/60 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-4 border-b border-white/8 flex gap-2">
                {["Неделя", "Месяц", "Всё время"].map((period) => (
                  <button key={period} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    period === "Неделя" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-white/40 hover:text-white/70"
                  }`}>
                    {period}
                  </button>
                ))}
              </div>
              <div className="divide-y divide-white/5">
                {LEADERBOARD.map((user) => (
                  <div key={user.rank} className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/3 ${user.rank === 1 ? 'bg-yellow-500/5' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-montserrat font-black text-sm ${
                      user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      user.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                      user.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/5 text-white/40'
                    }`}>
                      {user.badge || user.rank}
                    </div>
                    <div className="text-2xl">{user.avatar}</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{user.name}</p>
                      <p className="text-white/40 text-xs">{user.rank === 1 ? '👑 Лидер недели' : `#${user.rank} место`}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-montserrat font-black text-base text-white">{user.points.toLocaleString()}</p>
                      <p className="text-purple-400 text-xs">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-purple-600/30 to-cyan-600/20 border border-purple-500/30 rounded-3xl p-6">
                <p className="text-purple-300 text-sm font-semibold mb-4">Моё место в рейтинге</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl">🦁</div>
                  <div>
                    <p className="font-montserrat font-black text-2xl text-white">#12</p>
                    <p className="text-white/50 text-sm">из 1 247 учеников</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">До #11 места</span>
                  <span className="text-purple-300 font-semibold">+180 XP</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div className="bg-card/60 border border-white/10 rounded-3xl p-6">
                <p className="text-white/60 text-sm mb-4">Как зарабатывать XP?</p>
                <div className="flex flex-col gap-3">
                  {[
                    { action: "Пройти урок", xp: "+50 XP", emoji: "📖" },
                    { action: "Тест без ошибок", xp: "+100 XP", emoji: "🎯" },
                    { action: "Ежедневный стрик", xp: "+20 XP", emoji: "🔥" },
                    { action: "Помочь однокласснику", xp: "+30 XP", emoji: "🤝" },
                  ].map((item) => (
                    <div key={item.action} className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-white/70 text-sm flex-1">{item.action}</span>
                      <span className="text-neon-green text-sm font-bold">{item.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-purple-600/40 via-pink-600/30 to-cyan-600/30 border border-white/15 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
            </div>
            <div className="relative">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-4">Готов взлететь?</h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Зарегистрируйся бесплатно и начни первый урок прямо сейчас
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold px-10 py-4 rounded-2xl text-base hover:opacity-90 transition-all glow-purple">
                  Начать бесплатно 🎉
                </button>
                <button className="border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-medium px-8 py-4 rounded-2xl transition-all">
                  Узнать больше
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
              <span className="font-montserrat font-black text-lg gradient-text-purple">УчисьПро</span>
            </div>
            <div className="flex gap-6 text-white/40 text-sm">
              <a href="#" className="hover:text-white/70 transition-colors">О нас</a>
              <a href="#" className="hover:text-white/70 transition-colors">Тарифы</a>
              <a href="#" className="hover:text-white/70 transition-colors">Помощь</a>
              <a href="#" className="hover:text-white/70 transition-colors">Контакты</a>
            </div>
            <p className="text-white/25 text-sm">© 2025 УчисьПро</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
