import Icon from "@/components/ui/icon";

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

const calendarData = Array.from({ length: 35 }, (_, i) => {
  const types = [0, 0, 1, 1, 2, 2, 3, 4];
  return types[i % types.length];
});

interface CoursesSectionProps {
  activeCourse: number | null;
  onSetActiveCourse: (id: number | null) => void;
}

export default function CoursesSection({ activeCourse, onSetActiveCourse }: CoursesSectionProps) {
  return (
    <>
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
                onClick={() => onSetActiveCourse(activeCourse === course.id ? null : course.id)}
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
                  <p className="text-white/50 text-sm">Уровень 7 · 4 820 опыта</p>
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
    </>
  );
}