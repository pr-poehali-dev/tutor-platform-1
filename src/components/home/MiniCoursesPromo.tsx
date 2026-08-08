import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { MINI_COURSES, coursesByTrack } from "@/components/minicourse/registry";
import type { CourseAudience } from "@/components/minicourse/registry";

const TRACKS = [
  { id: "adult", label: "Взрослым", icon: "Briefcase" },
  { id: "school", label: "Школьникам", icon: "Backpack" },
] as const;

const TOTAL_LESSONS = MINI_COURSES.reduce((s, c) => s + c.lessons.length, 0);

export default function MiniCoursesPromo() {
  const [track, setTrack] = useState<CourseAudience>("adult");
  const visible = coursesByTrack(track).slice(0, 3);

  return (
    <section
      className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16"
      aria-labelledby="mini-courses-title"
    >
      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-transparent to-purple-500/[0.06] p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-3.5 py-1 mb-3">
              <Icon name="Zap" size={13} className="text-amber-300" />
              <span className="text-[11px] text-amber-200 font-bold uppercase tracking-wider">
                Один вечер — один навык
              </span>
            </div>
            <h2
              id="mini-courses-title"
              className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight"
            >
              Мини-курсы <span className="gradient-text-purple">за один вечер</span>
            </h2>
            <p className="text-white/65 text-sm md:text-base mt-3 max-w-2xl">
              {MINI_COURSES.length} коротких курсов с готовыми шаблонами и заданиями. Без регистрации
              и карты — открывается сразу, проходится за вечер.
            </p>
          </div>
          <Link
            to="/mini-course"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors whitespace-nowrap"
          >
            Все мини-курсы
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
            {TRACKS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTrack(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  track === t.id
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Icon name={t.icon} size={14} />
                {t.label}
              </button>
            ))}
          </div>
          <span className="text-white/40 text-xs">
            {TOTAL_LESSONS} уроков · шаблоны и промпты внутри
          </span>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 list-none p-0 m-0">
          {visible.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/mini-course/${c.slug}`}
                className="group flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-white/25 transition-all hover:-translate-y-1"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={c.cover}
                    alt={c.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                  <span
                    className={`absolute top-2.5 left-2.5 rounded-full bg-gradient-to-r ${c.gradient} px-2.5 py-1 text-[10px] font-black text-white shadow-lg`}
                  >
                    {c.benefit}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-4">
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="text-2xl shrink-0 leading-none">{c.emoji}</span>
                    <h3 className="font-montserrat font-bold text-white text-base leading-snug group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                  </div>
                  <p className="text-white/55 text-xs mb-4 line-clamp-2">{c.subtitle}</p>

                  <div className="mt-auto flex items-center justify-between text-xs">
                    <span className="text-white/40">
                      <Icon name="Clock" size={11} className="inline mr-1" />
                      {c.minutes} мин · {c.lessons.length} уроков
                    </span>
                    <span className="flex items-center gap-1 font-bold text-primary">
                      Начать
                      <Icon name="ArrowRight" size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="flex-1 text-white/70 text-sm">
            <Icon name="Gift" size={14} className="inline mr-1.5 text-emerald-400" />
            Все мини-курсы бесплатны навсегда: без регистрации, карты и ограничений по времени.
          </p>
          <Link
            to="/mini-course"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white hover:scale-[1.02] transition-transform whitespace-nowrap"
          >
            Выбрать курс
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
