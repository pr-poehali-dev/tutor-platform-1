import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/f7a109b5-3a4a-4080-a8ab-a6a4d093b14e.jpg";

const STATS = [
  { value: "50+", label: "Предметов", icon: "📖", color: "#a855f7" },
  { value: "200к+", label: "Учеников", icon: "👥", color: "#00d4ff" },
  { value: "4.9", label: "Средняя оценка", icon: "⭐", color: "#ffd60a" },
  { value: "98%", label: "Сдают ЕГЭ", icon: "🎯", color: "#06d6a0" },
];

export default function HeroSection() {
  return (
    <>
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

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 animate-fade-in-up animate-delay-300">
                <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-2xl text-base flex items-center gap-2 hover:opacity-90 transition-all glow-purple">
                  <span>Начать учиться</span>
                  <Icon name="ArrowRight" size={18} />
                </button>
                <Link
                  to="/pricing"
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-purple-500/40 bg-purple-500/10 text-white hover:bg-purple-500/20 hover:border-purple-500/60 transition-all font-bold text-base"
                >
                  <Icon name="Sparkles" size={16} className="text-purple-300" />
                  Перейти к тарифам
                </Link>
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
                    <div className="text-xs font-bold text-white">+120 опыта</div>
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
    </>
  );
}