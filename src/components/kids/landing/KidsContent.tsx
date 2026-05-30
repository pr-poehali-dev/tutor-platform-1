import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { AGES, AREAS, ACTIVITIES } from "@/components/kids/kidsData";
import { PRINCIPLES, REVIEWS, FAQ_ITEMS } from "./kidsLandingData";

export default function KidsContent() {
  return (
    <>
      {/* Познавашка — игровой раздел с Ксюшей */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-4">
        <Link
          to="/kids/poznavashka"
          className="group block relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-emerald-500/15 hover:border-amber-400/50 transition-all"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 p-6 md:p-8">
            <img
              src="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/bd414e9f-28a3-45ca-a1e3-27e06993a99f.png"
              alt="Ксюша"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-300/60 shadow-xl shadow-amber-500/20 object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-block text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Игра · Новинка
              </span>
              <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-2">
                Познавашка с Ксюшей
              </h2>
              <p className="text-white/70 text-sm md:text-base max-w-xl">
                Весёлое путешествие по сказочной стране: узнаём, как устроен окружающий мир, и собираем
                <span className="text-amber-300 font-bold"> ЗНАЙКИ</span> за правильные ответы.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black px-6 py-3.5 rounded-2xl group-hover:scale-105 transition-transform flex-shrink-0">
              Играть
              <Icon name="ArrowRight" size={18} />
            </div>
          </div>
        </Link>
      </section>

      {/* Игротека с Ксюшей — настольные и логические игры */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-4">
        <Link
          to="/kids/games"
          className="group block relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-purple-500/15 hover:border-cyan-400/50 transition-all"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 p-6 md:p-8">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-5xl shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
              ♟️
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-block text-cyan-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Игротека · Новинка
              </span>
              <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-2">
                Игротека с Ксюшей
              </h2>
              <p className="text-white/70 text-sm md:text-base max-w-xl">
                Ксюша научит играть в крестики-нолики, пятнашки, шашки, шахматы и морской бой — и сыграет
                вместе с тобой. За победу — <span className="text-amber-300 font-bold">ЗНАЙКИ</span>.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black px-6 py-3.5 rounded-2xl group-hover:scale-105 transition-transform flex-shrink-0">
              Играть
              <Icon name="ArrowRight" size={18} />
            </div>
          </div>
        </Link>
      </section>

      {/* Возрастные ступени */}
      <section id="ages" className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Возрастные ступени</p>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
          Выбери возраст ребёнка
        </h2>
        <p className="text-white/55 text-base text-center max-w-2xl mx-auto mb-10">
          Каждая ступень — это занятия, подобранные под актуальные задачи развития. Не торопимся, не пропускаем.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AGES.map((a) => {
            const count = ACTIVITIES.filter((act) => act.ageSlug === a.slug).length;
            return (
              <Link
                key={a.slug}
                to={`/kids/${a.slug}`}
                className="group relative bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/25 hover:translate-y-[-4px] transition-all"
              >
                <div className={`h-2 bg-gradient-to-r ${a.color}`} />
                <div className="p-5 text-center">
                  <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${a.color} flex items-center justify-center text-5xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {a.emoji}
                  </div>
                  <p className="font-montserrat font-black text-white text-xl mb-1">{a.label}</p>
                  <p className="text-white/65 text-xs mb-3 italic">«{a.motto}»</p>
                  <div className="inline-flex items-center gap-1 text-[10px] text-white/45 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                    <Icon name="Sparkles" size={10} />
                    {count} занятий
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Направления развития */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Что развиваем</p>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
          6 направлений развития
        </h2>
        <p className="text-white/55 text-base text-center max-w-2xl mx-auto mb-10">
          Гармоничное развитие — это когда не только буквы и счёт, но и эмоции, моторика, творчество.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AREAS.map((a) => (
            <div key={a.id} className="bg-card border border-white/10 rounded-3xl p-5 hover:border-white/20 transition-colors">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {a.emoji}
              </div>
              <h3 className="font-montserrat font-black text-white text-lg mb-2">{a.label}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Принципы */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Принципы</p>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-10">
          Почему родители выбирают нас
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="bg-card border border-white/10 rounded-3xl p-6 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0`}>
                <Icon name={p.icon} size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-montserrat font-black text-white text-lg mb-1.5">{p.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Отзывы */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Отзывы родителей</p>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-10">
          Что говорят семьи
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-card border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/30 to-rose-500/30 border border-pink-500/30 flex items-center justify-center text-2xl">
                  {r.avatar}
                </div>
                <div>
                  <p className="font-montserrat font-bold text-white text-sm">{r.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon key={s} name="Star" size={11} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">«{r.text}»</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">FAQ</p>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-8">Частые вопросы</h2>

        <div className="space-y-3">
          {FAQ_ITEMS.map((f, i) => (
            <details key={i} className="group bg-card border border-white/10 rounded-2xl overflow-hidden">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-5 hover:bg-white/[0.03] transition-colors">
                <span className="font-montserrat font-bold text-white text-sm md:text-base">{f.q}</span>
                <Icon name="Plus" size={18} className="text-white/55 flex-shrink-0 group-open:rotate-45 transition-transform" />
              </summary>
              <div className="px-5 pb-5 text-white/65 text-sm leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="text-6xl mb-4">🐣</div>
            <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3 leading-tight">
              Начни первое занятие сегодня
            </h2>
            <p className="text-white/90 text-base md:text-lg mb-6 max-w-xl mx-auto">
              Бесплатно: 1 занятие для каждой возрастной ступени. Без регистрации и оплаты.
            </p>
            <a
              href="#ages"
              className="inline-flex items-center gap-2 bg-white text-rose-600 text-sm md:text-base font-black px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl"
            >
              <Icon name="Rocket" size={16} />
              Выбрать возраст
            </a>
          </div>
        </div>
      </section>
    </>
  );
}