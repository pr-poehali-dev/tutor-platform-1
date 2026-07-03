import Icon from "@/components/ui/icon";
import { Course, getAgeRating, getCourseDisclaimers } from "@/components/courses/coursesData";
import { CourseDetail } from "@/components/courses/courseDetailsData";
import CourseDetailValue from "./CourseDetailValue";
import CourseDetailResult from "./CourseDetailResult";
import TochkaBusinessBanner from "@/components/partners/TochkaBusinessBanner";

interface Props {
  course: Course;
  detail: CourseDetail;
  examLabel: string | null;
}

// Бизнес-курсы для взрослых, где уместна рекомендация открыть счёт/бизнес в Точке.
const BUSINESS_SUBJECTS = ["business", "marketing", "sales", "tenders", "ved", "product"];

export default function CourseDetailAbout({ course, detail, examLabel }: Props) {
  const isAdult = course.grade === "adult";
  const showTochkaAccount = isAdult && BUSINESS_SUBJECTS.includes(course.subject);
  // ИИ-курсы для взрослых — рекомендуем продукт «Точка 24 AI».
  const showTochkaAI = isAdult && course.subject === "ai";
  return (
    <div className="animate-fade-in space-y-6">
      {/* Description */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
        <h3 className="font-montserrat font-black text-base text-white mb-2 flex items-center gap-2">
          <span>📖</span> Кратко о курсе
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">{course.description}</p>
      </div>

      {/* Обещание результата — только для курсов взрослых (продаём экспертность) */}
      <CourseDetailResult course={course} detail={detail} />

      {/* Плашка формата экзамена — только для экзаменационных курсов */}
      {examLabel && (
        <div className="flex items-start gap-3 bg-cyan-500/8 border border-cyan-500/25 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Icon name="ClipboardCheck" size={18} className="text-cyan-300" />
          </div>
          <div>
            <p className="font-montserrat font-bold text-white text-sm mb-0.5">{examLabel}</p>
            <p className="text-white/60 text-xs leading-relaxed">
              Задачи формулируются как в реальных вариантах ФИПИ, с пошаговым разбором решения и проверкой ответов — чтобы готовиться именно к тому, что встретится на экзамене.
            </p>
          </div>
        </div>
      )}

      {/* Outcomes */}
      <div>
        <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
          <span>🎯</span> Что освоишь
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {detail.outcomes.map((o, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-white/4 rounded-xl p-3">
              <div className="w-5 h-5 rounded-full bg-green-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="Check" size={11} className="text-green-400" />
              </div>
              <span className="text-white/75 text-sm">{o}</span>
            </div>
          ))}
        </div>
      </div>

      {/* For whom */}
      <div>
        <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
          <span>👥</span> Кому подойдёт
        </h3>
        <div className="flex flex-wrap gap-2">
          {detail.forWhom.map((f, i) => (
            <span key={i} className="text-sm text-white/70 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Рекомендация партнёра — Точка Банк (только для бизнес-курсов взрослых) */}
      {showTochkaAccount && (
        <TochkaBusinessBanner
          title="Применяй знания на практике — открой бизнес с Точкой"
          text="Освоив курс, легально запусти своё дело: регистрация ИП или ООО без визита в налоговую и расчётный счёт для бизнеса — бесплатно у нашего партнёра, Точка Банк."
        />
      )}

      {/* Рекомендация партнёра — Точка 24 AI (для ИИ-курсов взрослых) */}
      {showTochkaAI && (
        <TochkaBusinessBanner
          variant="ai"
          title="Применяй ИИ в работе — попробуй Точка 24 AI"
          text="Точка 24 AI — встроенный в банк ИИ-ассистент для предпринимателей: помогает с финансами, документами и рутиной 24/7. Отличная практика навыков из курса в реальном деле. Продукт нашего партнёра, Точка Банк."
        />
      )}

      {/* Ценность курса: как устроено обучение, что входит, частые вопросы */}
      <CourseDetailValue course={course} />

      {/* Tags */}
      <div>
        <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
          <span>🏷️</span> Темы курса
        </h3>
        <div className="flex flex-wrap gap-2">
          {course.tags.map(tag => (
            <span key={tag} className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/25 rounded-lg px-2.5 py-1.5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* AI teacher badge */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/25 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl flex-shrink-0">
          🤖
        </div>
        <div>
          <p className="font-montserrat font-bold text-white text-sm">Преподаёт ИИ-методист</p>
          <p className="text-white/55 text-xs">{course.tutorBadge} · доступен круглосуточно · подстраивается под твой уровень</p>
        </div>
      </div>

      {/* Юридическая информация и соблюдение законов РФ */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="ShieldCheck" size={16} className="text-emerald-300" />
          <h4 className="font-montserrat font-bold text-white text-sm">
            Юридическая информация · соответствует законодательству РФ
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-white/85 font-bold">
            <Icon name="UserCheck" size={12} />
            {getAgeRating(course)}
          </span>
          <span className="text-white/55 text-[11px]">
            Возрастная маркировка согласно 436-ФЗ
          </span>
        </div>
        <ul className="space-y-1.5 pt-1">
          {getCourseDisclaimers(course).map((d, i) => (
            <li key={i} className="flex gap-2 text-white/55 text-[11px] leading-relaxed">
              <Icon name="Info" size={12} className="text-white/40 flex-shrink-0 mt-0.5" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <p className="text-white/35 text-[10px] pt-1 border-t border-white/10">
          Платформа работает в соответствии с 273-ФЗ «Об образовании в РФ», 152-ФЗ «О персональных данных», 38-ФЗ «О рекламе» и иными нормативными актами РФ.
        </p>
      </div>
    </div>
  );
}