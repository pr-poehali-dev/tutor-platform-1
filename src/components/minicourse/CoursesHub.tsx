import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import { CourseAudience, MINI_COURSES, coursesByTrack, loadDone } from "./registry";

const SITE_URL = "https://учисьпро.рф";

/* ─────────────── Хаб: все мини-курсы ─────────────── */
export default function CoursesHub() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [track, setTrack] = useState<CourseAudience>("adult");

  useEffect(() => {
    const map: Record<string, number> = {};
    MINI_COURSES.forEach((c) => {
      map[c.slug] = loadDone(c.slug).length;
    });
    setProgress(map);
  }, []);

  const visible = coursesByTrack(track);
  const totalLessons = MINI_COURSES.reduce((s, c) => s + c.lessons.length, 0);

  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Бесплатные мини-курсы УЧИСЬПРО",
        description:
          "Короткие бесплатные курсы для отработки навыка: каждый проходится за один вечер, без регистрации и оплаты.",
        itemListElement: MINI_COURSES.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.title,
          url: `${SITE_URL}/mini-course/${c.slug}`,
        })),
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Бесплатные мини-курсы — отработка навыка за один вечер | УЧИСЬПРО"
        description="26 бесплатных мини-курсов для взрослых и школьников: нейросети, зарплата, переговоры, права потребителя, сон, здоровье спины, готовка, ремонт, фото, а также математика, физика, английский, литература и астрономия. Без регистрации и оплаты."
        canonical={`${SITE_URL}/mini-course`}
        keywords="бесплатные курсы, мини-курсы, курсы для взрослых, курсы для школьников, навыки, обучение бесплатно, саморазвитие, курсы без регистрации"
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">
              🎓
            </div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link to="/courses" className="text-white/60 hover:text-white text-sm font-bold transition-colors">
            Все курсы
          </Link>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 mb-5">
          <Icon name="Gift" size={13} />
          Бесплатно · без регистрации и карты
        </span>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
          Мини-курсы на один вечер
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-6">
          Каждый курс — это один навык, отработанный до результата. Пять-шесть уроков, готовые
          шаблоны и задание после каждого урока. Отдельные линейки для взрослых и школьников.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
            <Icon name="BookOpen" size={13} className="inline mr-1.5" />
            {MINI_COURSES.length} курсов
          </span>
          <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
            <Icon name="GraduationCap" size={13} className="inline mr-1.5" />
            {totalLessons} уроков
          </span>
          <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
            <Icon name="Sparkles" size={13} className="inline mr-1.5" />
            Шаблоны и промпты
          </span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex justify-center">
          <div className="inline-flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
            {([
              { id: "adult", label: "Взрослым", icon: "Briefcase" },
              { id: "school", label: "Школьникам", icon: "Backpack" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTrack(t.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  track === t.id
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Icon name={t.icon} size={15} />
                {t.label}
                <span className={track === t.id ? "text-white/70" : "text-white/35"}>
                  {coursesByTrack(t.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((c) => {
            const done = progress[c.slug] || 0;
            const pct = Math.round((done / c.lessons.length) * 100);
            return (
              <Link
                key={c.slug}
                to={`/mini-course/${c.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 hover:border-white/25 transition-all hover:-translate-y-1"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={c.cover}
                    alt={c.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <span
                    className={`absolute top-3 left-3 rounded-full bg-gradient-to-r ${c.gradient} px-3 py-1.5 text-xs font-black text-white shadow-lg`}
                  >
                    {c.benefit}
                  </span>
                  {done > 0 && (
                    <span className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur px-2.5 py-1.5 text-xs font-bold text-white">
                      {done === c.lessons.length ? "✓ пройден" : `${done}/${c.lessons.length}`}
                    </span>
                  )}
                </div>

                <div className="p-5 pt-3">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-3xl shrink-0">{c.emoji}</span>
                    <div className="min-w-0">
                      <h2 className="font-montserrat font-black text-lg text-white group-hover:text-primary transition-colors leading-snug">
                        {c.title}
                      </h2>
                      <p className="text-white/50 text-sm">{c.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-white/65 text-sm mb-4 line-clamp-2">{c.promise}</p>

                  {done > 0 && (
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                      <div
                        className={`h-full bg-gradient-to-r ${c.gradient} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-white/45">
                      <span>
                        <Icon name="Clock" size={12} className="inline mr-1" />
                        {c.minutes} мин
                      </span>
                      <span>
                        <Icon name="ListChecks" size={12} className="inline mr-1" />
                        {c.lessons.length} уроков
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-primary">
                      {done > 0 ? "Продолжить" : "Начать"}
                      <Icon name="ArrowRight" size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-6 md:p-8 text-center">
          <h2 className="font-montserrat font-black text-2xl text-white mb-3">
            Не знаете, с какого начать?
          </h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Пройдите профориентацию — сервис подберёт направление под вашу цель и составит план:
            какие навыки осваивать, в каком порядке и за какой срок.
          </p>
          <Link
            to="/career-pro"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition-transform"
          >
            <Icon name="Compass" size={17} />
            Подобрать направление
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}