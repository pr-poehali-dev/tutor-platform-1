import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMySchool,
  fetchSchoolCourses,
  updateSchool,
  deleteSchoolCourse,
  saveCourseToSchool,
  type School,
  type SchoolCourseListItem,
} from "@/components/school/api";
import type { BuilderCourse } from "@/components/builder/api";
import SchoolCourseCard from "@/components/school/SchoolCourseCard";
import SchoolStudents from "@/components/school/SchoolStudents";
import SchoolBrand from "@/components/school/SchoolBrand";
import SchoolTeacher from "@/components/school/SchoolTeacher";
import SchoolDomain from "@/components/school/SchoolDomain";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

type Tab = "courses" | "students" | "brand" | "ai" | "domain";

export default function SchoolCabinet() {
  const { isAuthenticated, loading: authLoading, openLogin } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [courses, setCourses] = useState<SchoolCourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [tab, setTab] = useState<Tab>("courses");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [s, cs] = await Promise.all([fetchMySchool(), fetchSchoolCourses()]);
    if (s.ok && s.data) {
      setSchool(s.data.school);
      setNameDraft(s.data.school.name);
    } else if (s.error) {
      setError(s.error);
    }
    if (cs.ok && cs.data) setCourses(cs.data.items);
    setLoading(false);
  }, []);

  // Сохранение отложенного курса из конструктора после входа
  useEffect(() => {
    if (!isAuthenticated) return;
    const raw = (() => {
      try {
        return sessionStorage.getItem("pending_school_course");
      } catch {
        return null;
      }
    })();
    if (!raw) {
      load();
      return;
    }
    try {
      sessionStorage.removeItem("pending_school_course");
      const parsed = JSON.parse(raw) as { course: BuilderCourse; builderId?: number };
      saveCourseToSchool(parsed.course, parsed.builderId).finally(load);
    } catch {
      load();
    }
  }, [isAuthenticated, load]);

  const saveName = async () => {
    const name = nameDraft.trim() || "Моя школа";
    setEditingName(false);
    const res = await updateSchool({ name });
    if (res.ok && res.data) setSchool(res.data.school);
  };

  const removeCourse = async (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    await deleteSchoolCourse(id);
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-4">
            <Icon name="School" size={26} className="text-violet-300" />
          </div>
          <h1 className="font-montserrat font-black text-xl mb-2">Кабинет вашей школы</h1>
          <p className="text-white/60 text-sm mb-5">Войдите, чтобы управлять курсами и настройками школы.</p>
          <button
            onClick={openLogin}
            className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform"
          >
            Войти
          </button>
          <Link to="/school-builder" className="block text-white/45 text-xs mt-4 hover:text-white/70">
            Сначала собрать курс в конструкторе
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Кабинет онлайн-школы · УЧИСЬПРО"
        description="Управляйте курсами вашей онлайн-школы: сгенерированные ИИ программы, публикация и настройки бренда."
        canonical={`${SITE_URL}/school`}
        noindex
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
            <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">кабинет школы</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/school/learning" className="hidden sm:inline-flex text-sm text-white/65 hover:text-white transition-colors items-center gap-1.5">
              <Icon name="BookMarked" size={15} /> Моё обучение
            </Link>
            <Link
              to="/school-builder"
              className="inline-flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <Icon name="Plus" size={15} /> Новый курс
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-8 pb-16">
        {loading ? (
          <div className="text-white/50 text-sm py-16 text-center">Загружаем вашу школу…</div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">{error}</div>
        ) : (
          <>
            {/* Шапка школы */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7 mb-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="text-white/45 text-xs uppercase tracking-wider mb-1">Ваша школа</p>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        autoFocus
                        className="bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-lg font-bold text-white focus:outline-none focus:border-violet-500/50"
                      />
                      <button onClick={saveName} className="text-violet-300 hover:text-violet-200">
                        <Icon name="Check" size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="font-montserrat font-black text-2xl md:text-3xl text-white">{school?.name}</h1>
                      <button onClick={() => setEditingName(true)} className="text-white/40 hover:text-white">
                        <Icon name="Pencil" size={16} />
                      </button>
                    </div>
                  )}
                  <p className="text-white/50 text-sm mt-1">
                    {courses.length} {courses.length === 1 ? "курс" : "курсов"} · комиссия платформы {school?.platform_fee_percent}%
                  </p>
                </div>
              </div>

            </div>

            {/* Вкладки */}
            <div className="flex items-center gap-1 mb-5 border-b border-white/8">
              {([
                { id: "courses", label: "Курсы", icon: "BookOpen" },
                { id: "students", label: "Ученики", icon: "Users" },
                { id: "brand", label: "Бренд", icon: "Palette" },
                { id: "ai", label: "ИИ-препод", icon: "Sparkles" },
                { id: "domain", label: "Домен", icon: "Globe" },
              ] as { id: Tab; label: string; icon: string }[]).map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === tb.id
                      ? "border-violet-400 text-white"
                      : "border-transparent text-white/55 hover:text-white"
                  }`}
                >
                  <Icon name={tb.icon} size={15} /> {tb.label}
                </button>
              ))}
            </div>

            {tab === "courses" && (
              courses.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
                  <Icon name="BookOpen" size={30} className="text-white/40 mx-auto mb-3" />
                  <p className="text-white/60 text-sm mb-4">Пока нет курсов. Соберите первый с помощью ИИ.</p>
                  <Link
                    to="/school-builder"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform"
                  >
                    <Icon name="Sparkles" size={16} /> Собрать курс
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((c) => (
                    <SchoolCourseCard key={c.id} course={c} onDelete={() => removeCourse(c.id)} />
                  ))}
                </div>
              )
            )}

            {tab === "students" && <SchoolStudents courses={courses} />}

            {tab === "brand" && school && (
              <SchoolBrand school={school} onUpdated={(s) => setSchool(s)} />
            )}

            {tab === "ai" && school && (
              <SchoolTeacher school={school} onUpdated={(s) => setSchool(s)} />
            )}

            {tab === "domain" && school && (
              <SchoolDomain school={school} onUpdated={(s) => setSchool(s)} />
            )}
          </>
        )}
      </main>
    </div>
  );
}