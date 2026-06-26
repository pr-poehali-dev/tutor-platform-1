import { useState } from "react";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import LeadForm from "@/components/intensive/LeadForm";
import TrainerChat from "@/components/intensive/TrainerChat";
import HomeworkBox from "@/components/intensive/HomeworkBox";
import AuditBox from "@/components/intensive/AuditBox";
import CasesBlock from "@/components/intensive/CasesBlock";
import { INTENSIVE_META, LESSONS, PROGRAM, PROJECT } from "@/components/intensive/data";

export default function Intensive() {
  const [activeLesson, setActiveLesson] = useState(0);
  const lesson = LESSONS[activeLesson];

  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Seo
        title="Интенсив «Твой первый автопилот» — автоматизация бизнеса за 7 дней без программирования"
        description="Практический интенсив по автоматизации микробизнеса: 3 готовые связки (заявка → CRM → задача, авто-напоминания, аналитика) за 7 дней. ИИ-аудит бизнеса, тренажёр, разбор куратором, Паспорт автоматизации. Без программирования."
        canonical="https://учисьпро.рф/intensive"
        keywords="автоматизация бизнеса, автоматизация микробизнеса, CRM для малого бизнеса, amoCRM Битрикс24 настройка, автоматизация без программирования, интенсив автоматизация, воронка продаж"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-5"
          items={[{ label: "Главная", href: "/" }, { label: "Интенсив по автоматизации" }]}
        />

        {/* HERO */}
        <section className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 mb-4">
            <Icon name="Sparkles" size={14} className="text-purple-300" />
            <span className="text-purple-300 text-xs font-bold uppercase tracking-wide">
              {INTENSIVE_META.subtitle}
            </span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
            {INTENSIVE_META.title}
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-4">{INTENSIVE_META.promise}</p>
          <p className="text-white/55 text-sm md:text-base max-w-2xl mb-6">{INTENSIVE_META.offer}</p>

          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mb-6">
            {INTENSIVE_META.result.map((r) => (
              <div key={r} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={15} className="text-emerald-300" />
                </div>
                <span className="text-white/85 text-sm font-medium">{r}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-white/40 text-xs">Работаем в:</span>
            {INTENSIVE_META.tools.map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-lg bg-white/5 text-white/70 border border-white/10">
                {t}
              </span>
            ))}
          </div>

          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-7 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform glow-purple"
          >
            <Icon name="Rocket" size={18} />
            Записаться · осталось {INTENSIVE_META.seats} мест
          </button>
        </section>

        {/* ИИ-АУДИТ — мгновенная польза */}
        <section className="mb-14">
          <AuditBox />
        </section>

        {/* 7-ДНЕВНАЯ ПРОГРАММА */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
            Путь за 7 дней: от хаоса к автопилоту
          </h2>
          <p className="text-white/60 mb-6 max-w-2xl">
            Линейная программа без перегруза. Каждый день — конкретный результат, который можно показать.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROGRAM.map((p) => (
              <div key={p.day} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/25 to-pink-500/15 flex items-center justify-center">
                    <Icon name={p.icon} size={16} className="text-purple-300" />
                  </div>
                  <span className="text-white/40 text-xs font-bold">День {p.day}</span>
                </div>
                <h3 className="font-montserrat font-bold text-white text-sm mb-0.5">{p.title}</h3>
                <p className="text-white/50 text-xs">{p.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ФОРМАТ */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
            Формат, который нельзя скопировать одним промптом
          </h2>
          <p className="text-white/60 mb-6 max-w-2xl">
            Ценность — в системе: теория, готовые шаблоны и живая обратная связь от ИИ и куратора.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "BookOpen", t: "Короткая теория", d: "5-8 минут только сути, без воды" },
              { icon: "FileText", t: "Готовые шаблоны", d: "Связки из реальных проектов" },
              { icon: "Bot", t: "ИИ-тренажёр", d: "Защищаешь решение перед ИИ-клиентом" },
              { icon: "PenLine", t: "Проверка ДЗ", d: "ИИ-куратор оценивает по критериям" },
              { icon: "Briefcase", t: "Разбор проекта", d: "Адаптация связок под твой бизнес" },
              { icon: "Award", t: "Паспорт автоматизации", d: "Артефакт результата + план на 30 дней" },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center mb-3">
                  <Icon name={c.icon} size={20} className="text-purple-300" />
                </div>
                <h3 className="font-montserrat font-bold text-white text-base mb-1">{c.t}</h3>
                <p className="text-white/55 text-sm">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* КЕЙСЫ */}
        <section className="mb-14">
          <CasesBlock />
        </section>

        {/* МОДУЛЬ — попробовать бесплатно */}
        <section className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 mb-3">
            <Icon name="Unlock" size={14} className="text-cyan-300" />
            <span className="text-cyan-300 text-xs font-bold uppercase tracking-wide">Демо-доступ бесплатно</span>
          </div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
            Попробуй уроки интенсива прямо сейчас
          </h2>
          <p className="text-white/60 mb-6 max-w-2xl">
            Это реальный формат. Изучи день, защити решение перед ИИ-клиентом и сдай ДЗ — ИИ-куратор оценит.
          </p>

          {/* Табы дней */}
          <div className="flex flex-wrap gap-2 mb-6">
            {LESSONS.map((l, i) => (
              <button
                key={l.key}
                onClick={() => setActiveLesson(i)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  i === activeLesson
                    ? "bg-purple-500/20 text-purple-200 border border-purple-500/40"
                    : "bg-white/5 text-white/60 border border-white/10 hover:text-white"
                }`}
              >
                День {l.num}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-7">
            <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
              <Icon name="Clock" size={13} />
              {lesson.duration}
            </div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-4">{lesson.title}</h3>

            {/* Теория */}
            <div className="space-y-3 mb-6">
              {lesson.theory.map((p, i) => (
                <p key={i} className="text-white/75 text-sm md:text-base leading-relaxed">{p}</p>
              ))}
            </div>

            {/* Шаблон */}
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

            {/* ИИ-тренажёр + ДЗ */}
            <div className="grid lg:grid-cols-2 gap-5">
              {lesson.trainerScenario && (
                <TrainerChat
                  scenarioKey={lesson.trainerScenario.key}
                  title={lesson.trainerScenario.title}
                  greeting={lesson.trainerScenario.greeting}
                />
              )}
              <HomeworkBox
                lessonKey={lesson.key}
                task={lesson.homework.task}
                placeholder={lesson.homework.placeholder}
              />
            </div>
          </div>
        </section>

        {/* МИНИ-ПРОЕКТ */}
        <section className="mb-14">
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Briefcase" size={20} className="text-emerald-300" />
              <h2 className="font-montserrat font-black text-xl md:text-2xl text-white">{PROJECT.title}</h2>
            </div>
            <p className="text-white/70 text-sm md:text-base mb-5 max-w-2xl">{PROJECT.description}</p>
            <HomeworkBox lessonKey={PROJECT.key} task="Сдай свой мини-проект на проверку ИИ-куратору." placeholder={PROJECT.placeholder} />
          </div>
        </section>

        {/* ФОРМА ЗАЯВКИ */}
        <section id="lead-form" className="mb-6 max-w-xl mx-auto">
          <LeadForm source="intensive-page" />
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}