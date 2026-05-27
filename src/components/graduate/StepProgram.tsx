import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { getFaculty, getUniversity, SUBJECTS } from "./graduateData";

interface Props {
  universityId: string;
  facultyId: string;
  onBack: () => void;
  onRestart: () => void;
}

export default function StepProgram({ universityId, facultyId, onBack, onRestart }: Props) {
  const university = getUniversity(universityId);
  const faculty = getFaculty(universityId, facultyId);

  if (!university || !faculty) {
    return (
      <div className="bg-card border border-white/10 rounded-3xl p-8 text-center">
        <div className="text-5xl mb-3">🔍</div>
        <p className="text-white/70 text-sm mb-4">Факультет не найден.</p>
        <button onClick={onRestart} className="text-purple-300 hover:text-white text-sm underline">Начать заново</button>
      </div>
    );
  }

  const totalMin = faculty.exams.reduce((sum, e) => sum + e.minScore, 0);

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-white/55 hover:text-white text-sm mb-5 transition-colors"
      >
        <Icon name="ArrowLeft" size={14} />
        Изменить факультет
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 mb-3">
          <Icon name="CheckCircle2" size={12} className="text-emerald-300" />
          <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Шаг 4 из 4 · Готово</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-2">
          Твоя программа поступления
        </h2>
        <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
          Вот всё, что нужно сдать и подготовить для поступления.
        </p>
      </div>

      {/* Карточка вуза + факультета */}
      <div className={`relative bg-gradient-to-br ${university.color} rounded-3xl p-5 md:p-6 mb-5 overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl flex-shrink-0">
            {university.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-montserrat font-black text-white text-lg md:text-xl leading-tight">{university.shortName}</p>
              {university.isMilitary && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <Icon name="Shield" size={9} />
                  Военный вуз
                </span>
              )}
            </div>
            <p className="text-white/85 text-xs md:text-sm leading-snug mb-2">{university.fullName}</p>
            <p className="text-white/95 text-sm md:text-base font-bold">{faculty.name}</p>
            <p className="text-white/75 text-xs md:text-sm">{faculty.specialty}</p>
          </div>
        </div>
      </div>

      {/* Ключевые цифры */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card border border-white/10 rounded-2xl p-4 text-center">
          <Icon name="Target" size={20} className="text-amber-300 mx-auto mb-1.5" />
          <p className="font-montserrat font-black text-white text-2xl tabular-nums">{faculty.passingScore}</p>
          <p className="text-white/55 text-[10px] leading-tight mt-0.5">Проходной балл<br />прошлого года</p>
        </div>
        <div className="bg-card border border-white/10 rounded-2xl p-4 text-center">
          <Icon name="TrendingUp" size={20} className="text-rose-300 mx-auto mb-1.5" />
          <p className="font-montserrat font-black text-white text-2xl tabular-nums">{totalMin}</p>
          <p className="text-white/55 text-[10px] leading-tight mt-0.5">Минимум<br />для допуска</p>
        </div>
        <div className="bg-card border border-white/10 rounded-2xl p-4 text-center">
          <Icon name="Users" size={20} className="text-emerald-300 mx-auto mb-1.5" />
          <p className="font-montserrat font-black text-white text-2xl tabular-nums">{faculty.budgetSeats ?? "—"}</p>
          <p className="text-white/55 text-[10px] leading-tight mt-0.5">Бюджетных<br />мест</p>
        </div>
      </div>

      {/* Доп. испытания / военная специфика */}
      {faculty.hasAdditional && (
        <div className="bg-gradient-to-br from-rose-500/15 to-pink-500/15 border border-rose-500/30 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Icon name="AlertTriangle" size={18} className="text-white" />
          </div>
          <div>
            <p className="font-montserrat font-black text-white text-sm mb-1">Дополнительное испытание</p>
            <p className="text-white/75 text-xs md:text-sm leading-relaxed">{faculty.additionalNote}</p>
          </div>
        </div>
      )}

      {university.isMilitary && (
        <div className="bg-gradient-to-br from-emerald-500/12 to-teal-500/12 border border-emerald-500/30 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Shield" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-montserrat font-black text-white text-sm mb-1">Специфика военного вуза</p>
              <p className="text-white/70 text-xs leading-relaxed">Помимо ЕГЭ нужно пройти медкомиссию, ВВК и физподготовку. Зачисление — по контракту с Министерством обороны РФ.</p>
            </div>
          </div>
          <ul className="text-white/65 text-xs space-y-1 pl-13">
            <li className="flex items-start gap-1.5"><Icon name="Check" size={11} className="text-emerald-300 flex-shrink-0 mt-0.5" /> Возраст 16–22 года</li>
            <li className="flex items-start gap-1.5"><Icon name="Check" size={11} className="text-emerald-300 flex-shrink-0 mt-0.5" /> Военно-врачебная комиссия (ВВК)</li>
            <li className="flex items-start gap-1.5"><Icon name="Check" size={11} className="text-emerald-300 flex-shrink-0 mt-0.5" /> Физподготовка: бег, подтягивания, плавание</li>
            <li className="flex items-start gap-1.5"><Icon name="Check" size={11} className="text-emerald-300 flex-shrink-0 mt-0.5" /> Подача документов в военкомат до 1 апреля</li>
          </ul>
        </div>
      )}

      {/* Предметы ЕГЭ */}
      <div className="bg-card border border-white/10 rounded-3xl p-5 md:p-6 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="ListChecks" size={18} className="text-purple-300" />
          <span className="text-purple-300 text-[11px] uppercase tracking-wider font-bold">Что сдавать</span>
        </div>
        <h3 className="font-montserrat font-black text-white text-lg md:text-xl mb-4">
          {faculty.exams.length} {faculty.exams.length === 1 ? "предмет ЕГЭ" : faculty.exams.length < 5 ? "предмета ЕГЭ" : "предметов ЕГЭ"}
        </h3>

        <div className="space-y-2">
          {faculty.exams.map((e) => {
            const s = SUBJECTS[e.subject];
            return (
              <div key={e.subject} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-3 md:p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/25 to-pink-500/25 border border-purple-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                  {s.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-montserrat font-bold text-white text-sm md:text-base">{s.label}</p>
                  <p className="text-white/55 text-xs">
                    Минимальный балл вуза: <span className="text-amber-200 font-bold">{e.minScore}</span>
                  </p>
                </div>
                {s.courseSlug && (
                  <Link
                    to={`/courses/${s.courseSlug}`}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-[1.03] text-white text-xs font-bold px-3 py-2 rounded-xl transition-transform flex-shrink-0"
                  >
                    <Icon name="Sparkles" size={11} />
                    Готовиться
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-purple-500/15 via-pink-500/12 to-rose-500/15 border border-purple-500/30 rounded-3xl p-5 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl">🎯</div>
          <div>
            <p className="font-montserrat font-black text-white text-base md:text-lg leading-tight mb-1">Что дальше?</p>
            <p className="text-white/70 text-xs md:text-sm">Начни готовиться по нашим курсам — ИИ-репетитор подстроится под твой уровень и проходной балл вуза.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="BookOpen" size={14} />
            Все курсы
          </Link>
          <Link
            to="/score-calculator"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Icon name="Calculator" size={14} />
            Калькулятор баллов
          </Link>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Icon name="RotateCcw" size={14} />
            Подобрать другой вуз
          </button>
        </div>
      </div>
    </div>
  );
}
