import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import {
  fetchPublicCourse,
  buySchoolCourse,
  syncSchoolPayment,
  type PublicCourse,
} from "@/components/school/api";
import TeacherChat from "@/components/school/TeacherChat";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const TYPE_LABEL: Record<string, string> = {
  theory: "Теория",
  practice: "Практика",
  test: "Проверка",
  project: "Проект",
};

export default function SchoolCoursePublic() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const { isAuthenticated, openLogin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [course, setCourse] = useState<PublicCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [owned, setOwned] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchPublicCourse(courseId);
    if (res.ok && res.data) setCourse(res.data.course);
    else setError(res.error || "Курс не найден");
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  // Возврат после оплаты: подтверждаем доступ
  useEffect(() => {
    if (searchParams.get("paid") === "1" && isAuthenticated) {
      syncSchoolPayment().then((r) => {
        if (r.ok && r.data && r.data.activated.length > 0) setOwned(true);
        searchParams.delete("paid");
        setSearchParams(searchParams, { replace: true });
      });
    }
  }, [searchParams, isAuthenticated, setSearchParams]);

  const buy = async () => {
    if (buying) return;
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setBuying(true);
    const returnUrl = `${window.location.origin}/course/${courseId}?paid=1`;
    const res = await buySchoolCourse(courseId, returnUrl);
    setBuying(false);
    if (res.ok && res.data) {
      if (res.data.already_owned) {
        setOwned(true);
        return;
      }
      if (res.data.confirmation_url) {
        window.location.href = res.data.confirmation_url;
        return;
      }
    }
    setError(res.error || "Не удалось начать оплату");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center">
        <Icon name="Loader2" size={28} className="text-violet-300 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-5">
        <div className="text-center">
          <Icon name="SearchX" size={30} className="text-white/40 mx-auto mb-3" />
          <p className="text-white/70 mb-4">{error || "Курс не найден"}</p>
          <Link to="/" className="text-violet-300 hover:text-violet-200 text-sm">На главную</Link>
        </div>
      </div>
    );
  }

  const priceRub = Math.round(course.price_kopecks / 100);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`${course.title} · ${course.school.name}`}
        description={course.description || course.tagline || `Онлайн-курс «${course.title}»`}
        canonical={`${SITE_URL}/course/${course.id}`}
      />

      {/* Хедер школы */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {course.school.brand_logo_url ? (
              <img src={course.school.brand_logo_url} alt={course.school.name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                style={{ background: course.school.brand_color || "linear-gradient(135deg,#8b5cf6,#06b6d4)" }}
              >
                {course.school.name.charAt(0)}
              </div>
            )}
            <span className="font-montserrat font-bold text-sm text-white">{course.school.name}</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8 pb-16">
        {/* Обложка курса */}
        {course.cover_url && (
          <div className="rounded-3xl overflow-hidden border border-white/10 mb-6 aspect-[16/7]">
            <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Hero */}
        <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-6 md:p-8 mb-6">
          <h1 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-2">{course.title}</h1>
          {course.tagline && <p className="text-violet-200/90 text-base md:text-lg mb-3">{course.tagline}</p>}
          {course.description && <p className="text-white/70 text-sm md:text-base mb-4">{course.description}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-2"><Icon name="Layers" size={15} className="text-violet-300" /> {course.modules_count} модулей</span>
            <span className="inline-flex items-center gap-2"><Icon name="GraduationCap" size={15} className="text-violet-300" /> {course.lessons_count} уроков</span>
            {course.estimated_hours > 0 && (
              <span className="inline-flex items-center gap-2"><Icon name="Clock" size={15} className="text-violet-300" /> ~{course.estimated_hours} ч</span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          {/* Контент */}
          <div className="space-y-6 order-2 md:order-1">
            {course.outcomes?.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="font-montserrat font-bold text-lg text-white mb-3">Чему вы научитесь</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {course.outcomes.map((o, i) => (
                    <div key={i} className="flex items-start gap-2 text-white/75 text-sm">
                      <Icon name="CircleCheck" size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="font-montserrat font-bold text-lg text-white mb-4">Программа курса</h2>
              <div className="space-y-4">
                {course.modules.map((m, mi) => (
                  <div key={mi}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-200 text-xs font-bold flex items-center justify-center">{mi + 1}</span>
                      <span className="font-semibold text-white text-sm">{m.title}</span>
                    </div>
                    <div className="pl-8 space-y-1">
                      {m.lessons.map((l, li) => (
                        <div key={li} className="flex items-center gap-2 text-white/65 text-sm">
                          <Icon name="Play" size={11} className="text-white/30" />
                          <span>{l.title}</span>
                          <span className="text-[10px] text-white/35">{TYPE_LABEL[l.type] || ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ИИ-наставник — показывается только ученикам с доступом */}
            {isAuthenticated && <TeacherChat courseId={courseId} />}
          </div>

          {/* Панель покупки */}
          <div className="order-1 md:order-2">
            <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:sticky md:top-20">
              {owned ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <Icon name="Check" size={24} className="text-emerald-300" />
                  </div>
                  <p className="font-bold text-white mb-1">Доступ открыт!</p>
                  <p className="text-white/60 text-sm mb-4">Курс теперь в вашем кабинете.</p>
                  <Link to="/school/learning" className="block w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3 rounded-xl text-center hover:scale-[1.01] transition-transform">
                    Перейти к обучению
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="font-montserrat font-black text-3xl text-white">
                      {priceRub > 0 ? `${priceRub.toLocaleString("ru-RU")} ₽` : "Бесплатно"}
                    </div>
                    <p className="text-white/50 text-xs mt-1">Полный доступ к курсу</p>
                  </div>
                  <button
                    onClick={buy}
                    disabled={buying}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-60"
                  >
                    {buying ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="ShoppingCart" size={18} />}
                    {buying ? "Переходим к оплате…" : "Купить курс"}
                  </button>
                  {error && <p className="text-rose-300 text-xs text-center mt-3">{error}</p>}
                  <div className="mt-4 space-y-2 text-white/60 text-xs">
                    <div className="flex items-center gap-2"><Icon name="Infinity" size={13} className="text-violet-300" /> Бессрочный доступ</div>
                    <div className="flex items-center gap-2"><Icon name="ShieldCheck" size={13} className="text-violet-300" /> Оплата картой или СБП</div>
                    <div className="flex items-center gap-2"><Icon name="Award" size={13} className="text-violet-300" /> {course.lessons_count} уроков с практикой</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}