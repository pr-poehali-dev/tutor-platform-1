import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { TUTOR_FEATURES, HERO_FEATURE } from "./tutorHubData";

const LearningJourney = lazy(() => import("@/components/LearningJourney"));

const ALL_FEATURES = [HERO_FEATURE, ...TUTOR_FEATURES];

/** Рабочее пространство модуля «Репетитор» — открыто после оплаты. */
export default function TutorWorkspace() {
  const { user } = useAuth();

  return (
    <main className="max-w-6xl mx-auto px-4 pt-10 pb-16">
      {/* Приветствие */}
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
          <Icon name="Check" size={12} /> Доступ открыт
        </span>
      </div>
      <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white">
        Репетитор{user?.name ? `, ${user.name}` : ""} 🎓
      </h1>
      <p className="text-white/60 text-sm md:text-base mt-2 max-w-2xl">
        Твой личный модуль обучения. Наставник ведёт по плану, объясняет голосом, проверяет домашку и готовит к экзаменам — всё в одном месте.
      </p>

      {/* Инструменты модуля */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {ALL_FEATURES.map((f) => (
          <Link
            key={f.id}
            to={f.href}
            className="group relative rounded-3xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 p-5 transition-all overflow-hidden"
          >
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"
              style={{ background: f.accent }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border"
                  style={{ background: `${f.accent}1e`, borderColor: `${f.accent}40` }}
                >
                  {f.emoji}
                </span>
                {f.badge && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    {f.badge}
                  </span>
                )}
              </div>
              <h3 className="text-white font-bold text-base leading-snug">{f.title}</h3>
              <p className="text-white/45 text-xs mt-0.5">{f.subtitle}</p>
              <p className="text-white/55 text-sm mt-2 leading-relaxed">{f.description}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all" style={{ color: f.accent }}>
                {f.cta}
                <Icon name="ArrowRight" size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Наставник + персональный план */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Route" size={18} className="text-purple-300" />
          <h2 className="font-montserrat font-black text-2xl text-white">Твой план обучения</h2>
        </div>
        <p className="text-white/55 text-sm mb-2">
          Наставник тестирует, находит пробелы и ведёт тебя модуль за модулем к результату.
        </p>
      </div>
      <Suspense fallback={<div className="py-12 text-center text-white/40 text-sm">Готовлю наставника…</div>}>
        <LearningJourney />
      </Suspense>
    </main>
  );
}
