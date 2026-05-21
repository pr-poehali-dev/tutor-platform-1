import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import ExamTaskCard from "@/components/exam/ExamTaskCard";
import {
  EXAM_TASKS,
  SUBJECTS,
  YEARS,
  SubjectId,
  ExamType,
} from "@/data/examBank";

const ALL_EXAMS: ExamType[] = ["ОГЭ", "ЕГЭ", "ЕГЭ база", "ЕГЭ профиль"];

export default function ExamBank() {
  const [subject, setSubject] = useState<SubjectId | null>(null);
  const [exam, setExam] = useState<ExamType | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EXAM_TASKS.filter(
      (t) =>
        (!subject || t.subject === subject) &&
        (!exam || t.exam === exam) &&
        (!year || t.year === year) &&
        (!q ||
          t.question.toLowerCase().includes(q) ||
          t.topic.toLowerCase().includes(q)),
    );
  }, [subject, exam, year, search]);

  const stats = useMemo(() => {
    const total = EXAM_TASKS.length;
    const bySubject = SUBJECTS.map((s) => ({
      ...s,
      count: EXAM_TASKS.filter((t) => t.subject === s.id).length,
    }));
    return { total, bySubject };
  }, []);

  const resetFilters = () => {
    setSubject(null);
    setExam(null);
    setYear(null);
    setSearch("");
  };

  const hasFilters = subject || exam || year || search.trim();

  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title="Сборник заданий ОГЭ и ЕГЭ 2020-2025 с разбором — учисьпро.рф"
        description="Большая база заданий ОГЭ и ЕГЭ за 2020-2025 годы по математике, русскому, физике, информатике и обществознанию. Пошаговые решения, теория и типичные ошибки."
        canonical="https://xn--h1agdcde2c.xn--p1ai/exam-bank"
        keywords="ОГЭ, ЕГЭ, задания, разбор, 2024, 2025, математика, русский, физика, информатика, обществознание"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { name: "Главная", url: "/" },
            { name: "Сборник заданий ОГЭ и ЕГЭ", url: "/exam-bank" },
          ]}
        />

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          На главную
        </Link>

        {/* Hero */}
        <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-purple-500/15 via-pink-500/8 to-transparent p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="hidden md:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Icon name="Library" size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-2 leading-tight">
                Сборник заданий ОГЭ и ЕГЭ
              </h1>
              <p className="text-white/60 text-sm md:text-base leading-relaxed mb-4">
                Реальные форматы экзаменов за 2020–2025. Для каждой задачи — теория по теме,
                пошаговое решение и типичные ошибки, на которых срезаются ученики.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-white/6 border border-white/10 text-xs text-white/70">
                  <span className="font-bold text-white">{stats.total}</span> заданий в базе
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/6 border border-white/10 text-xs text-white/70">
                  <span className="font-bold text-white">{SUBJECTS.length}</span> предмета
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/6 border border-white/10 text-xs text-white/70">
                  <span className="font-bold text-white">2020–2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {stats.bySubject.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubject(subject === s.id ? null : s.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                subject === s.id
                  ? "border-white/30 bg-white/10"
                  : "border-white/8 bg-card/40 hover:border-white/20"
              }`}
              style={
                subject === s.id
                  ? { boxShadow: `0 0 0 2px ${s.accent}40` }
                  : undefined
              }
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${s.accent}20`, border: `1px solid ${s.accent}40` }}
              >
                <Icon name={s.icon} size={20} style={{ color: s.accent }} />
              </div>
              <p className="font-medium text-sm text-white text-center leading-tight">{s.name}</p>
              <p className="text-xs text-white/40">{s.count} зад.</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-3xl border border-white/8 bg-card/40 p-4 md:p-5 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Icon name="SlidersHorizontal" size={16} className="text-white/50" />
            <p className="text-white/60 text-sm font-medium">Фильтры</p>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto text-xs text-white/40 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <Icon name="X" size={12} />
                Сбросить
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <p className="text-white/40 text-xs mb-1.5">Экзамен</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_EXAMS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setExam(exam === e ? null : e)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      exam === e
                        ? "bg-purple-500/25 text-white border-purple-500/50"
                        : "bg-white/4 text-white/60 border-white/10 hover:text-white"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/40 text-xs mb-1.5">Год</p>
              <div className="flex flex-wrap gap-1.5">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setYear(year === y ? null : y)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      year === y
                        ? "bg-purple-500/25 text-white border-purple-500/50"
                        : "bg-white/4 text-white/60 border-white/10 hover:text-white"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/40 text-xs mb-1.5">Поиск по теме или условию</p>
              <div className="relative">
                <Icon
                  name="Search"
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Например, производная..."
                  className="w-full bg-white/4 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-sm">
            Найдено: <span className="text-white font-bold">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "задание" : "заданий"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/8 bg-card/40 p-12 text-center">
            <Icon name="SearchX" size={36} className="text-white/30 mx-auto mb-3" />
            <p className="text-white/70 font-medium mb-1">Ничего не нашлось</p>
            <p className="text-white/40 text-sm mb-4">Попробуй сбросить фильтры или изменить запрос</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-sm font-medium transition-colors"
            >
              <Icon name="RotateCcw" size={14} />
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((t) => (
              <ExamTaskCard key={t.id} task={t} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 to-pink-500/10 p-6 md:p-8 text-center">
          <Icon name="Sparkles" size={28} className="text-purple-300 mx-auto mb-3" />
          <h2 className="font-montserrat font-bold text-xl md:text-2xl text-white mb-2">
            Хочешь больше практики и персональный план?
          </h2>
          <p className="text-white/60 text-sm md:text-base mb-5 max-w-2xl mx-auto">
            ИИ-репетитор найдёт пробелы по результатам диагностики и составит маршрут именно
            под твой экзамен.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-montserrat font-bold text-sm shadow-lg shadow-purple-500/30 transition-all"
          >
            <Icon name="GraduationCap" size={16} />
            Попробовать ИИ-репетитора
          </Link>
        </div>
      </div>
    </div>
  );
}
