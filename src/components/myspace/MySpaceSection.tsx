import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { useUser } from "@/context/UserDataContext";
import { COURSES, Course } from "@/components/courses/coursesData";
import { BADGES } from "@/lib/badges";
import MyCoursesRow from "./MyCoursesRow";
import FavoritesRow from "./FavoritesRow";
import HistoryRow from "./HistoryRow";
import UserStatsCard from "./UserStatsCard";
import BadgesGrid from "./BadgesGrid";
import ActivityHeatmap from "./ActivityHeatmap";
import CertificatesGrid from "./CertificatesGrid";

type Tab = "overview" | "my" | "certificates" | "favorites" | "history" | "badges";

export default function MySpaceSection() {
  const user = useUser();
  const [tab, setTab] = useState<Tab>("overview");

  const coursesById = useMemo(() => {
    const m: Record<number, Course> = {};
    COURSES.forEach((c) => { m[c.id] = c; });
    return m;
  }, []);

  // Авто-выдача бейджей при любых изменениях статистики/избранного
  useEffect(() => {
    if (!user.loaded) return;
    const s = {
      lessons_completed: user.stats?.lessons_completed || 0,
      tasks_solved: user.stats?.tasks_solved || 0,
      streak_days: user.stats?.streak_days || 0,
      total_xp: user.stats?.total_xp || 0,
      favorites_count: user.favorites.length,
      my_courses_count: user.myCourses.length,
      unique_subjects: new Set(user.myCourses.map(c => c.subject)).size,
    };
    const earned = new Set(user.badges.map(b => b.id));
    BADGES.forEach((b) => {
      if (!earned.has(b.id) && b.check(s)) {
        user.awardBadge(b.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loaded, user.stats, user.favorites.length, user.myCourses.length, user.badges.length]);

  // Пустое состояние — не показываем секцию вообще пока пользователь ничего не сделал
  const hasAnyData =
    user.myCourses.length > 0 ||
    user.favorites.length > 0 ||
    user.history.length > 0 ||
    (user.stats?.total_xp || 0) > 0;

  if (user.loaded && !hasAnyData) return null;

  const certificatesCount = user.myCourses.filter((c) => c.status === "completed").length;

  const TABS: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Обзор", icon: "LayoutDashboard" },
    { id: "my", label: "Мои курсы", icon: "GraduationCap", count: user.myCourses.length },
    { id: "certificates", label: "Сертификаты", icon: "Award", count: certificatesCount },
    { id: "favorites", label: "Избранное", icon: "Heart", count: user.favorites.length },
    { id: "history", label: "История", icon: "Clock", count: user.history.length },
    { id: "badges", label: "Достижения", icon: "Award", count: user.badges.length },
  ];

  return (
    <section id="myspace" className="py-12 md:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/15 border border-purple-400/30 rounded-full px-4 py-1.5 mb-3">
              <Icon name="Sparkles" size={14} className="text-purple-300" />
              <span className="text-sm text-purple-200 font-medium">Твоё пространство</span>
            </div>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white">
              Моё <span className="gradient-text-purple">обучение</span>
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                tab === t.id
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                  : "bg-white/5 hover:bg-white/10 text-white/65 border border-white/10"
              }`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
              {!!t.count && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  tab === t.id ? "bg-white/20" : "bg-white/10 text-white/70"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {tab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <MyCoursesRow myCourses={user.myCourses} coursesById={coursesById} compact />
                <ActivityHeatmap activity={user.activity} />
              </div>
              <div className="space-y-4">
                <UserStatsCard stats={user.stats} badgesEarned={user.badges.length} />
                <BadgesGrid earnedIds={user.badges.map(b => b.id)} stats={user.stats} myCoursesCount={user.myCourses.length} favoritesCount={user.favorites.length} uniqueSubjects={new Set(user.myCourses.map(c => c.subject)).size} compact />
              </div>
            </div>
          )}

          {tab === "my" && <MyCoursesRow myCourses={user.myCourses} coursesById={coursesById} />}

          {tab === "certificates" && (
            <CertificatesGrid myCourses={user.myCourses} coursesById={coursesById} />
          )}

          {tab === "favorites" && (
            <FavoritesRow ids={user.favorites} coursesById={coursesById} onToggle={user.toggleFavorite} />
          )}

          {tab === "history" && (
            <HistoryRow ids={user.history} coursesById={coursesById} />
          )}

          {tab === "badges" && (
            <div className="space-y-4">
              <BadgesGrid
                earnedIds={user.badges.map(b => b.id)}
                stats={user.stats}
                myCoursesCount={user.myCourses.length}
                favoritesCount={user.favorites.length}
                uniqueSubjects={new Set(user.myCourses.map(c => c.subject)).size}
              />
              <ActivityHeatmap activity={user.activity} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}