import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import AvatarHelper from "@/components/silent/AvatarHelper";
import SignPanel from "@/components/silent/SignPanel";
import { findLesson, LESSONS } from "@/components/silent/silentCourseData";
import { findSign } from "@/components/silent/signLibrary";

export default function SilentLesson() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = findLesson(slug);
  const [idx, setIdx] = useState(0);

  // При переходе к другому уроку — начинаем с первого шага.
  useEffect(() => {
    setIdx(0);
    window.scrollTo(0, 0);
  }, [lesson.slug]);

  const steps = lesson.steps;
  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const progress = ((idx + 1) / steps.length) * 100;
  const sign = findSign(step.caption);

  const lessonPos = LESSONS.findIndex((l) => l.slug === lesson.slug);
  const nextLesson = lessonPos >= 0 ? LESSONS[lessonPos + 1] : undefined;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`${lesson.title} — курс для глухих детей | УЧИСЬПРО`}
        description="Урок с полными субтитрами, визуальной подачей и аватаром-помощником. Учимся без звука — всё показано текстом и картинками."
        canonical={`https://xn--h1agdcde2c.xn--p1ai/silent/lesson/${lesson.slug}`}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/silent" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-bold transition-colors">
            <Icon name="ArrowLeft" size={14} />
            К курсу
          </Link>
          <span className="text-white/60 text-sm font-semibold">
            Шаг {idx + 1} из {steps.length}
          </span>
        </div>
        <div className="h-1 bg-white/8">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <h1 className="sr-only">{lesson.title}</h1>

        {/* Аватар-помощник ведёт урок */}
        <div className="mb-6">
          <AvatarHelper line={step.avatar} />
        </div>

        {/* Главный слайд: визуал + крупный субтитр */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/[0.1] via-transparent to-cyan-500/[0.08] p-6 md:p-10 text-center mb-6">
          <div className="text-7xl md:text-8xl mb-5 select-none" aria-hidden="true">
            {step.visual}
          </div>
          <p className="font-montserrat font-black text-4xl md:text-5xl text-white leading-tight mb-4">
            {step.caption}
          </p>
          <p className="text-white/75 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
            {step.detail}
          </p>
        </div>

        {/* Авто-панель жеста РЖЯ — всегда видна под субтитром */}
        {sign && (
          <div className="mb-6">
            <SignPanel sign={sign} />
          </div>
        )}

        {/* Навигация */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed border border-white/15 text-white font-bold px-5 py-3.5 rounded-2xl transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>

          {isLast ? (
            nextLesson ? (
              <Link
                to={`/silent/lesson/${nextLesson.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.01] transition-transform"
              >
                <Icon name="ArrowRight" size={18} />
                Следующий урок
              </Link>
            ) : (
              <Link
                to="/silent"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.01] transition-transform"
              >
                <Icon name="CircleCheck" size={18} />
                Урок пройден!
              </Link>
            )
          ) : (
            <button
              onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.01] transition-transform glow-purple"
            >
              Дальше
              <Icon name="ArrowRight" size={18} />
            </button>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
