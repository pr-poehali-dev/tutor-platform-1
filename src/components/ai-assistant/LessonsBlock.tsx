import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import TrainerChat from "@/components/intensive/TrainerChat";
import HomeworkBox from "@/components/intensive/HomeworkBox";
import { getSavedAccess } from "@/components/intensive/api";
import { AI_LESSONS } from "./lessons";
import { COURSE_META } from "./data";

interface Props {
  /** Доступ подтверждён баннером оплаты на этой странице. */
  granted: boolean;
  onBuy: () => void;
}

/** Уроки курса «ИИ-ассистент»: день 1 открыт всем, остальные — после оплаты. */
export default function LessonsBlock({ granted, onBuy }: Props) {
  const [active, setActive] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    setHasAccess(granted || !!getSavedAccess(COURSE_META.track));
  }, [granted]);

  useEffect(() => {
    const fromHash = () => {
      const m = /day(\d)/.exec(window.location.hash);
      if (m) setActive(Math.min(AI_LESSONS.length - 1, Math.max(0, Number(m[1]) - 1)));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const lesson = AI_LESSONS[active];
  const locked = active > 0 && !hasAccess;

  return (
    <section id="lessons" className="mb-14 scroll-mt-24">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 mb-3">
        <Icon name={hasAccess ? "Unlock" : "Gift"} size={14} className="text-cyan-300" />
        <span className="text-cyan-300 text-xs font-bold uppercase tracking-wide">
          {hasAccess ? "Курс открыт полностью" : "День 1 — бесплатно"}
        </span>
      </div>
      <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">Уроки курса</h2>
      <p className="text-white/60 mb-6 max-w-2xl">
        Выберите день: короткая теория, готовые промпты, тренажёр с ИИ и задание с проверкой.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {AI_LESSONS.map((l, i) => {
          const isLocked = i > 0 && !hasAccess;
          return (
            <button
              key={l.key}
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                i === active
                  ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/50"
                  : "bg-white/5 text-white/65 border border-white/10 hover:text-white"
              }`}
            >
              {isLocked && <Icon name="Lock" size={13} className="text-white/40" />}
              День {l.num}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-7">
        <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
          <Icon name="Clock" size={13} />
          {lesson.duration}
        </div>
        <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-4">
          День {lesson.num}. {lesson.title}
        </h3>

        {locked ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-6 text-center">
            <Icon name="Lock" size={28} className="text-amber-300 mx-auto mb-2" />
            <p className="text-white font-bold mb-1">Этот день откроется после оплаты</p>
            <p className="text-white/60 text-sm mb-4">
              Уже оплатили? Проверьте доступ по email в блоке выше или войдите в личный кабинет: покупка появится в разделе «Мои покупки».
            </p>
            <button
              onClick={onBuy}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <Icon name="CreditCard" size={16} />
              Открыть все 5 дней
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {lesson.theory.map((p, i) => (
                <p key={i} className="text-white/75 text-sm md:text-base leading-relaxed">{p}</p>
              ))}
            </div>

            <div className="rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="FileText" size={16} className="text-amber-300" />
                <h4 className="font-montserrat font-bold text-white text-sm">{lesson.template.title}</h4>
              </div>
              <ul className="space-y-2">
                {lesson.template.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/75 text-sm">
                    <Icon name="ChevronRight" size={15} className="text-amber-300 mt-0.5 flex-shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`grid gap-5 ${lesson.trainerScenario ? "lg:grid-cols-2" : ""}`}>
              {lesson.trainerScenario && (
                <TrainerChat
                  scenarioKey={lesson.trainerScenario.key}
                  title={lesson.trainerScenario.title}
                  greeting={lesson.trainerScenario.greeting}
                />
              )}
              <HomeworkBox lessonKey={lesson.key} task={lesson.homework.task} placeholder={lesson.homework.placeholder} />
            </div>

            {active < AI_LESSONS.length - 1 && (
              <button
                onClick={() => {
                  setActive(active + 1);
                  document.getElementById("lessons")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-bold text-sm"
              >
                Следующий день
                <Icon name="ArrowRight" size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
