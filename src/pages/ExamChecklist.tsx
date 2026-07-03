import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { SubjectCode } from "@/components/graduate/graduateData";
import ExamCountdown from "@/components/examChecklist/ExamCountdown";
import SubjectsPicker from "@/components/examChecklist/SubjectsPicker";
import ChecklistGroup from "@/components/examChecklist/ChecklistGroup";
import {
  ExamProfile,
  fetchProfile,
  saveProfile,
  toggleTask,
} from "@/components/examChecklist/api";
import {
  buildAllTasks,
  ChecklistCategory,
} from "@/components/examChecklist/checklistTasks";
import { KEY_DEADLINES_2026 } from "@/components/examChecklist/examDates";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";
const CATEGORY_ORDER: ChecklistCategory[] = ["docs", "subject", "vuz", "psych", "logistics"];

const DEFAULT_PROFILE: ExamProfile = {
  exam_year: 2026,
  subjects: [],
  target_score: 0,
  target_university_id: null,
  target_faculty_id: null,
  exists: false,
};

export default function ExamChecklist() {
  const { isAuthenticated, openLogin, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ExamProfile>(DEFAULT_PROFILE);
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchProfile().then((res) => {
      if (res.profile) setProfile(res.profile);
      setDoneSet(new Set(res.tasks.filter((t) => t.done).map((t) => t.task_id)));
      setLoading(false);
    });
  }, [isAuthenticated, authLoading]);

  const allTasks = useMemo(() => buildAllTasks(profile.subjects), [profile.subjects]);

  const stats = useMemo(() => {
    const total = allTasks.length;
    const done = allTasks.filter((t) => doneSet.has(t.id)).length;
    const critical = allTasks.filter((t) => t.importance === "critical").length;
    const criticalDone = allTasks.filter((t) => t.importance === "critical" && doneSet.has(t.id)).length;
    return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100), critical, criticalDone };
  }, [allTasks, doneSet]);

  const handleToggle = async (taskId: string, done: boolean) => {
    // Оптимистично
    const next = new Set(doneSet);
    if (done) next.add(taskId);
    else next.delete(taskId);
    setDoneSet(next);
    const ok = await toggleTask(taskId, done);
    if (!ok) {
      // Откат при ошибке
      const rollback = new Set(doneSet);
      setDoneSet(rollback);
    }
  };

  const handleSaveSubjects = async (subjects: SubjectCode[]) => {
    setProfile((p) => ({ ...p, subjects }));
  };

  const handleSaveProfile = async () => {
    await saveProfile({
      exam_year: profile.exam_year,
      subjects: profile.subjects,
      target_score: profile.target_score,
      target_university_id: profile.target_university_id,
      target_faculty_id: profile.target_faculty_id,
    });
    const fresh = await fetchProfile();
    if (fresh.profile) setProfile(fresh.profile);
  };

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "До ЕГЭ — чек-лист" },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Подготовка к ЕГЭ 2026: пошаговый чек-лист выпускника",
      description: "Документы, подготовка по предметам, поступление в вуз, психологическая подготовка и логистика на день экзамена.",
      step: CATEGORY_ORDER.map((cat) => ({
        "@type": "HowToStep",
        name: cat,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Чек-лист «До ЕГЭ 2026» — пошаговый план для выпускника | УЧИСЬПРО"
        description="Подробный чек-лист подготовки к ЕГЭ 2026: документы, расписание, дедлайны итогового сочинения и подачи в вузы. Обратный отсчёт по предметам, что сделать за 30/14/7/1 день до экзамена."
        canonical={`${SITE_URL}/exam-checklist`}
        keywords="чек-лист егэ 2026, что нужно для егэ, подготовка к егэ план, расписание егэ 2026, дедлайны подачи документов в вузы"
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-lg">⏰</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 pt-3">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-6 pb-16">

        {/* HERO */}
        <section className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-base">⏰</span>
            <span className="text-sm text-rose-200 font-bold uppercase tracking-wider">Чек-лист выпускника</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
            До ЕГЭ — <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">пошаговый план</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Документы, подготовка, дедлайны, психология и логистика — всё, что нужно сделать выпускнику, в одном месте.
          </p>
        </section>

        {/* Countdown */}
        <div className="mb-6">
          <ExamCountdown subjects={profile.subjects} />
        </div>

        {/* Если не авторизован — приглашение войти */}
        {!isAuthenticated && !authLoading && (
          <div className="bg-amber-500/15 border border-amber-500/35 rounded-2xl p-5 mb-6 flex items-start gap-3 flex-wrap">
            <Icon name="LogIn" size={22} className="text-amber-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base mb-1">Войди, чтобы сохранить прогресс</p>
              <p className="text-white/65 text-sm">
                Чек-лист синхронизируется между устройствами и помнит, что ты уже сделал.
              </p>
            </div>
            <button
              onClick={openLogin}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform"
            >
              Войти
            </button>
          </div>
        )}

        {loading && isAuthenticated && (
          <div className="text-center py-12 text-white/45">
            <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Загружаю твой чек-лист...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Выбор предметов */}
            <div className="mb-6">
              <SubjectsPicker
                value={profile.subjects}
                onChange={(subjects) => handleSaveSubjects(subjects)}
                onSave={handleSaveProfile}
              />
            </div>

            {/* Прогресс */}
            {profile.subjects.length > 0 && (
              <div className="bg-card border border-white/10 rounded-3xl p-5 md:p-6 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="TrendingUp" size={16} className="text-emerald-300" />
                  <span className="text-emerald-300 text-[11px] uppercase tracking-wider font-bold">Твой прогресс</span>
                </div>
                <div className="flex items-end justify-between gap-3 mb-3">
                  <h2 className="font-montserrat font-black text-white text-xl md:text-2xl">
                    {stats.done} из {stats.total} задач
                  </h2>
                  <p className="font-montserrat font-black text-emerald-300 text-3xl md:text-4xl tabular-nums leading-none">
                    {stats.pct}%
                  </p>
                </div>
                <div className="h-3 bg-white/8 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
                <p className="text-white/55 text-xs">
                  Критичных задач выполнено: <span className="text-white font-bold">{stats.criticalDone} из {stats.critical}</span>
                </p>
              </div>
            )}

            {/* Ключевые даты */}
            <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="CalendarDays" size={16} className="text-amber-300" />
                <span className="text-amber-300 text-[11px] uppercase tracking-wider font-bold">Календарь выпускника</span>
              </div>
              <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
                Ключевые даты 2025–2026
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {KEY_DEADLINES_2026.map((d) => {
                  const dDate = new Date(d.date + "T00:00:00");
                  const left = Math.ceil((dDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const past = left < 0;
                  return (
                    <div
                      key={d.id}
                      className={`bg-white/[0.03] border rounded-2xl p-3 flex items-center gap-3 ${
                        past ? "border-white/8 opacity-50" :
                        left <= 30 ? "border-amber-500/35 bg-amber-500/[0.04]" :
                        "border-white/10"
                      }`}
                    >
                      <div className="text-2xl flex-shrink-0">{d.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-montserrat font-bold text-white text-sm leading-tight">{d.title}</p>
                        <p className="text-white/55 text-[11px]">
                          {dDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        past ? "bg-white/5 text-white/35" :
                        left <= 30 ? "bg-amber-500/20 text-amber-200" :
                        "bg-emerald-500/15 text-emerald-200"
                      }`}>
                        {past ? "Прошло" : left === 0 ? "Сегодня" : `${left} дн.`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Группы задач */}
            {profile.subjects.length > 0 && (
              <div className="space-y-3">
                {CATEGORY_ORDER.map((cat) => {
                  const tasks = allTasks.filter((t) => t.category === cat);
                  return (
                    <ChecklistGroup
                      key={cat}
                      category={cat}
                      tasks={tasks}
                      doneSet={doneSet}
                      onToggle={handleToggle}
                    />
                  );
                })}
              </div>
            )}

            {/* Если предметы не выбраны */}
            {profile.subjects.length === 0 && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">👆</div>
                <p className="font-montserrat font-black text-white text-base mb-1">Выбери предметы выше</p>
                <p className="text-white/65 text-sm">После этого появится твой персональный чек-лист с задачами по каждому предмету.</p>
              </div>
            )}

            {/* CTA */}
            <section className="mt-6 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-rose-500/20 border border-purple-500/35 rounded-3xl p-6 md:p-8 text-center">
              <div className="text-5xl mb-3">🚀</div>
              <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-2">
                Готовься системно — с ИИ-репетитором
              </h2>
              <p className="text-white/75 text-sm md:text-base mb-4 max-w-xl mx-auto">
                В каталоге УЧИСЬПРО — курсы по каждому предмету, банк заданий и личный ИИ-наставник. Каждый курс покупается отдельно, оплата разовая — доступ навсегда.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-black px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/30"
                >
                  <Icon name="Sparkles" size={16} />
                  Выбрать курс
                </Link>
                <Link
                  to="/graduate"
                  className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  <Icon name="GraduationCap" size={14} />
                  Подобрать вуз
                </Link>
              </div>
            </section>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}