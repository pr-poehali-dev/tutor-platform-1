import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { PrepProgram } from "./prepPrograms";
import { SubjectInfo, University, Faculty } from "./graduateData";

interface Props {
  program: PrepProgram;
  subject: SubjectInfo;
  university?: University;
  faculty?: Faculty;
  targetScore: number;
  /** Минимальный балл по этому предмету в выбранном вузе. */
  minScore?: number;
  /** Сколько недель до 1 июня (день старта ЕГЭ). */
  weeksToExam: number;
}

/**
 * Шапка индивидуального курса: целевой балл, прогноз, недели до ЕГЭ,
 * информация о вузе/факультете.
 */
export default function PrepCourseHero({
  program,
  subject,
  university,
  faculty,
  targetScore,
  minScore,
  weeksToExam,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-pink-900/25 to-rose-900/30 p-6 md:p-8 mb-6">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/35 text-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <Icon name="CheckCircle2" size={10} />
            Соответствует ФИПИ
          </span>
          <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/35 text-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <Icon name="Crown" size={10} />
            Индивидуальная программа
          </span>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl md:text-5xl flex-shrink-0">
            {subject.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-montserrat font-black text-white text-xl md:text-3xl leading-tight mb-1">
              {program.title}
            </h1>
            {university && faculty && (
              <p className="text-white/70 text-sm md:text-base">
                Цель: <span className="text-white font-bold">{university.shortName}</span>
                {" · "}
                <span className="text-white/85">{faculty.specialty}</span>
              </p>
            )}
          </div>
        </div>

        {/* Целевой балл и прогноз */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white/[0.06] border border-white/15 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon name="Target" size={12} className="text-amber-300" />
              <span className="text-white/55 text-[10px] uppercase tracking-wider font-bold">Цель</span>
            </div>
            <p className="font-montserrat font-black text-white text-2xl md:text-3xl tabular-nums">{targetScore}</p>
            <p className="text-white/55 text-[10px] mt-0.5">баллов ЕГЭ</p>
          </div>
          {minScore !== undefined && (
            <div className="bg-white/[0.06] border border-white/15 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon name="ShieldCheck" size={12} className="text-emerald-300" />
                <span className="text-white/55 text-[10px] uppercase tracking-wider font-bold">Порог</span>
              </div>
              <p className="font-montserrat font-black text-white text-2xl md:text-3xl tabular-nums">{minScore}</p>
              <p className="text-white/55 text-[10px] mt-0.5">мин. балл вуза</p>
            </div>
          )}
          <div className="bg-white/[0.06] border border-white/15 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon name="CalendarDays" size={12} className="text-purple-300" />
              <span className="text-white/55 text-[10px] uppercase tracking-wider font-bold">До ЕГЭ</span>
            </div>
            <p className="font-montserrat font-black text-white text-2xl md:text-3xl tabular-nums">{weeksToExam}</p>
            <p className="text-white/55 text-[10px] mt-0.5">недель</p>
          </div>
          <div className="bg-white/[0.06] border border-white/15 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon name="BookOpen" size={12} className="text-cyan-300" />
              <span className="text-white/55 text-[10px] uppercase tracking-wider font-bold">Курс</span>
            </div>
            <p className="font-montserrat font-black text-white text-2xl md:text-3xl tabular-nums">{program.totalHours}</p>
            <p className="text-white/55 text-[10px] mt-0.5">часов всего</p>
          </div>
        </div>

        <p className="text-white/70 text-sm md:text-base mb-5 max-w-2xl">{program.audience}</p>

        {/* CTA */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-black px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/30"
          >
            <Icon name="Sparkles" size={14} />
            Начать заниматься
            <Icon name="ArrowRight" size={14} />
          </Link>
          {program.trainerSlugs?.map((slug) => (
            <Link
              key={slug}
              to={`/${slug}`}
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              <Icon name="Zap" size={14} />
              Тренажёр задач
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}