import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { AGES } from "@/components/kids/kidsData";

interface Progress {
  stars: number;
  streakDays: number;
  completedActivities: string[];
  totalAnswers: number;
  correctAnswers: number;
}

interface Props {
  totalActivities: number;
  progress: Progress;
}

export default function KidsHero({ totalActivities, progress }: Props) {
  return (
    <>
      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="text-base">🐣</span>
              <span className="text-sm text-pink-200 font-bold uppercase tracking-wider">Малыш · от 1 года</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-5 leading-[1.05]">
              УЧИСЬПРО <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">Малыш</span>
            </h1>
            <p className="text-white/75 text-lg md:text-xl mb-3 leading-snug">
              Развивающие занятия для детей <b>от 1 года до 6 лет</b>.
            </p>
            <p className="text-white/55 text-base md:text-lg leading-relaxed max-w-xl mb-7">
              По методикам Монтессори, Никитиных и Домана. Без рекламы, с контролем экранного времени и подробными подсказками для родителя.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Link
                to="/kids/test"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-base font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl shadow-pink-500/30"
              >
                <Icon name="Stethoscope" size={16} />
                Пройти диагностику развития
                <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/kids/library"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/35 text-white text-base font-semibold px-6 py-3.5 rounded-2xl transition-all"
              >
                <Icon name="BookOpen" size={16} />
                Библиотека сказок
              </Link>
              <Link
                to="/kids/songs"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/35 text-white text-base font-semibold px-6 py-3.5 rounded-2xl transition-all"
              >
                <Icon name="Music" size={16} />
                Учим песни и стихи
              </Link>
              <a
                href="#ages"
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-base font-semibold px-6 py-3.5 rounded-2xl transition-colors"
              >
                <Icon name="Library" size={16} />
                Выбрать возраст
              </a>
            </div>
            <p className="text-pink-200/80 text-sm mb-6 inline-flex items-center gap-1.5">
              <Icon name="Sparkles" size={13} />
              Бесплатно · 2 минуты · персональный план занятий
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/55 text-sm">
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> {totalActivities}+ занятий</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> 5 возрастов</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> 6 направлений</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> Без рекламы</span>
            </div>
          </div>

          {/* Декоративная иллюстрация: облако с цветными зверушками */}
          <div className="relative aspect-square max-w-md mx-auto md:ml-auto w-full">
            <div className="absolute -inset-4 bg-gradient-to-br from-pink-400/30 via-rose-400/30 to-orange-400/30 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl p-8 grid grid-cols-3 gap-4 items-center justify-items-center aspect-square">
              {AGES.map((a) => (
                <Link
                  key={a.slug}
                  to={`/kids/${a.slug}`}
                  className="group flex flex-col items-center hover:scale-110 transition-transform"
                  style={{ animation: `float ${3 + AGES.indexOf(a) * 0.3}s ease-in-out infinite alternate` }}
                >
                  <div className="text-5xl md:text-6xl mb-1 drop-shadow-lg">{a.emoji}</div>
                  <p className="text-white text-xs font-black bg-black/30 backdrop-blur px-2 py-0.5 rounded-full">{a.shortLabel}</p>
                </Link>
              ))}
              <div className="text-4xl md:text-5xl">⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Прогресс ребёнка — если уже что-то прошёл */}
      {progress.completedActivities.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-6">
          <div className="bg-gradient-to-br from-pink-500/12 to-rose-500/12 border border-pink-500/30 rounded-3xl p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl">🌟</div>
              <div className="min-w-0 flex-1">
                <p className="font-montserrat font-black text-white text-base md:text-lg leading-tight">Твой прогресс</p>
                <p className="text-white/65 text-xs md:text-sm">Растём каждый день — продолжаем!</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-background/40 border border-white/10 rounded-2xl p-3 text-center">
                <p className="text-2xl">⭐</p>
                <p className="font-montserrat font-black text-white text-lg tabular-nums leading-none mt-1">{progress.stars}</p>
                <p className="text-white/45 text-[10px]">Звёзд</p>
              </div>
              <div className="bg-background/40 border border-white/10 rounded-2xl p-3 text-center">
                <p className="text-2xl">🔥</p>
                <p className="font-montserrat font-black text-white text-lg tabular-nums leading-none mt-1">{progress.streakDays}</p>
                <p className="text-white/45 text-[10px]">Дней подряд</p>
              </div>
              <div className="bg-background/40 border border-white/10 rounded-2xl p-3 text-center">
                <p className="text-2xl">✅</p>
                <p className="font-montserrat font-black text-white text-lg tabular-nums leading-none mt-1">{progress.completedActivities.length}</p>
                <p className="text-white/45 text-[10px]">Занятий</p>
              </div>
              <div className="bg-background/40 border border-white/10 rounded-2xl p-3 text-center">
                <p className="text-2xl">🎯</p>
                <p className="font-montserrat font-black text-white text-lg tabular-nums leading-none mt-1">
                  {progress.totalAnswers > 0 ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100) : 0}%
                </p>
                <p className="text-white/45 text-[10px]">Точность</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Витрина: Песни и стихи + Библиотека */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            to="/kids/songs"
            className="group relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 md:p-7 overflow-hidden hover:scale-[1.01] transition-transform"
          >
            <div className="absolute -right-6 -top-6 text-[140px] opacity-20 group-hover:opacity-30 transition-opacity">🎵</div>
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                <Icon name="Sparkles" size={12} className="text-white" />
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Новое</span>
              </div>
              <h3 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-2 leading-tight">
                Учим песни и стихи 🚜
              </h3>
              <p className="text-white/90 text-sm md:text-base mb-4 leading-relaxed max-w-md">
                Синий трактор, Антошка, Барто, Чуковский. 30+ песен и стихов с движениями и подсказками для родителя.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {["🚜 Синий трактор", "🥔 Антошка", "👧 Барто", "🐊 Чуковский"].map((t) => (
                  <span key={t} className="text-[11px] font-bold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <span className="inline-flex items-center gap-2 bg-white text-orange-600 text-sm font-black px-5 py-2.5 rounded-xl group-hover:gap-3 transition-all">
                Послушать
                <Icon name="Play" size={14} />
              </span>
            </div>
          </Link>

          <Link
            to="/kids/library"
            className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-6 md:p-7 overflow-hidden hover:scale-[1.01] transition-transform"
          >
            <div className="absolute -right-6 -top-6 text-[140px] opacity-20 group-hover:opacity-30 transition-opacity">📚</div>
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                <Icon name="BookOpen" size={12} className="text-white" />
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Библиотека</span>
              </div>
              <h3 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-2 leading-tight">
                Сказки и рассказы 📖
              </h3>
              <p className="text-white/90 text-sm md:text-base mb-4 leading-relaxed max-w-md">
                Народные сказки, Пушкин, Толстой, Крылов, Ушинский. Классика из общественного достояния — слушаем с тёплым голосом ИИ-Лисы.
              </p>
              <span className="inline-flex items-center gap-2 bg-white text-pink-600 text-sm font-black px-5 py-2.5 rounded-xl group-hover:gap-3 transition-all">
                Открыть
                <Icon name="ArrowRight" size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
