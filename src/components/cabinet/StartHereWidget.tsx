import { useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { COURSES } from "@/components/courses/coursesData";
import { FREE_FOREVER_COURSE_IDS } from "@/components/courses/courseAccessFlags";
import useReadyCourses from "@/hooks/useReadyCourses";

/**
 * Первый экран новичка в кабинете.
 *
 * Раньше человек сразу после регистрации видел заголовок «Подписки нет» —
 * то есть первым сообщением платформы был разговор о деньгах, до того как
 * он получил хоть какую-то пользу. Из 73 зарегистрировавшихся до занятий
 * доходили трое.
 *
 * Теперь новичок сразу видит, что можно начать бесплатно и прямо сейчас:
 * курсы, открытые навсегда, и бесплатные инструменты. Разговор об оплате —
 * позже, когда человек уже позанимался.
 */

/** Бесплатные инструменты, доступные без оплаты — их стоит показать сразу. */
const FREE_TOOLS = [
  {
    to: "/tutor",
    icon: "Sparkles",
    title: "ИИ-репетитор",
    text: "Первый урок бесплатно, объяснит любую тему голосом",
  },
  {
    to: "/homework",
    icon: "Camera",
    title: "Проверка домашки",
    text: "Сфотографируй задание — разберём по шагам",
  },
  {
    to: "/exam-bank",
    icon: "Library",
    title: "Банк заданий",
    text: "Реальные задания ЕГЭ и ОГЭ с разбором",
  },
];

export default function StartHereWidget() {
  const { readyIds } = useReadyCourses();

  // Взрослые курсы в кабинете школьника выглядят чужеродно — показываем
  // только школьные бесплатные, чтобы первый экран был про учёбу ребёнка.
  const freeCourses = useMemo(
    () =>
      COURSES.filter(
        (c) =>
          FREE_FOREVER_COURSE_IDS.includes(c.id) && readyIds.has(c.id) && c.grade !== "adult",
      ),
    [readyIds],
  );

  return (
    <div className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/12 to-cyan-500/8 p-6 md:p-7 mb-6">
      <div className="flex items-start gap-3 mb-1.5">
        <span className="text-2xl leading-none">🚀</span>
        <div>
          <h2 className="font-montserrat font-black text-2xl text-white leading-tight">
            С чего начать
          </h2>
          <p className="text-white/70 text-sm mt-1.5">
            Это открыто прямо сейчас — без оплаты и без ограничения по времени.
          </p>
        </div>
      </div>

      {freeCourses.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
          {freeCourses.map((c) => (
            <Link
              key={c.id}
              to={`/course-checkout/${c.id}`}
              className="group rounded-2xl border border-white/12 bg-white/[0.05] hover:bg-white/[0.09] hover:border-emerald-400/40 p-4 transition-all flex flex-col"
            >
              <span className="inline-flex items-center gap-1.5 self-start bg-emerald-500/20 border border-emerald-400/30 rounded-full px-2.5 py-1 text-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-2.5">
                <Icon name="Gift" size={11} />
                Бесплатно навсегда
              </span>
              <h3 className="font-bold text-white text-sm leading-snug mb-1.5">{c.title}</h3>
              <p className="text-white/50 text-xs mb-3">{c.lessons} уроков</p>
              <span className="inline-flex items-center gap-1.5 text-emerald-300 text-sm font-semibold mt-auto">
                Начать урок
                <Icon
                  name="ArrowRight"
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        {FREE_TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/25 p-4 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center mb-2.5">
              <Icon name={t.icon} size={18} className="text-cyan-300" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">{t.title}</h3>
            <p className="text-white/50 text-xs leading-relaxed">{t.text}</p>
          </Link>
        ))}
      </div>

      <p className="text-white/45 text-xs mt-5 leading-relaxed">
        А ещё в любом платном курсе первый урок открыт бесплатно — можно посмотреть,
        как всё устроено, и решить спокойно.{" "}
        <Link to="/courses" className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2">
          Посмотреть каталог
        </Link>
      </p>
    </div>
  );
}