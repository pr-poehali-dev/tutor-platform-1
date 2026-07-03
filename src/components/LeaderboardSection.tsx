import SectionHeading from "@/components/home/SectionHeading";

const LEADERBOARD = [
  { rank: 1, name: "Алекс М.", avatar: "🦁", points: 9840, badge: "🥇" },
  { rank: 2, name: "Соня К.", avatar: "🦊", points: 8720, badge: "🥈" },
  { rank: 3, name: "Данил П.", avatar: "🐺", points: 7650, badge: "🥉" },
  { rank: 4, name: "Маша Т.", avatar: "🐱", points: 6430, badge: "" },
  { rank: 5, name: "Артём В.", avatar: "🐸", points: 5890, badge: "" },
];

export default function LeaderboardSection() {
  return (
    <>
      {/* Leaderboard */}
      <section id="leaderboard" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            accent="amber"
            badgeIcon="Trophy"
            badge="Рейтинг"
            title={<>Топ <span className="gradient-text-purple">лидеров</span></>}
            subtitle="Зарабатывай XP за уроки и задания, поднимайся в таблице и соревнуйся с учениками со всей России."
          />

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
                      <p className="text-purple-400 text-xs">опыт</p>
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
                  <span className="text-purple-300 font-semibold">+180 опыта</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div className="bg-card/60 border border-white/10 rounded-3xl p-6">
                <p className="text-white/60 text-sm mb-4">Как зарабатывать опыт?</p>
                <div className="flex flex-col gap-3">
                  {[
                    { action: "Пройти урок", xp: "+50 опыта", emoji: "📖" },
                    { action: "Тест без ошибок", xp: "+100 опыта", emoji: "🎯" },
                    { action: "Ежедневная серия", xp: "+20 опыта", emoji: "🔥" },
                    { action: "Помочь однокласснику", xp: "+30 опыта", emoji: "🤝" },
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
Открой каталог и выбери курс — и начни обучение уже сегодня
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/courses"
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold px-10 py-4 rounded-2xl text-base hover:opacity-90 transition-all glow-purple"
                >
                  Начать учиться 🚀
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}