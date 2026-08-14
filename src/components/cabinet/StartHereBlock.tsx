import { useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { COURSES } from "@/components/courses/coursesData";
import { FREE_FOREVER_COURSE_IDS } from "@/components/courses/courseAccessFlags";

/**
 * Первый экран новичка в кабинете.
 *
 * Зачем: из 73 регистраций до занятий доходили 3 человека. Причина — кабинет
 * встречал заголовком «Подписки нет» и кнопкой «Выбрать курс», то есть первым
 * же сообщением говорил про деньги, ещё до того как человек получил пользу.
 *
 * Здесь наоборот: сразу показываем, что уже открыто без оплаты, и даём
 * начать в один клик. Разговор про оплату — позже, когда человек позанимался.
 */
export default function StartHereBlock() {
  // Бесплатные навсегда курсы — вход без оплаты и без карты.
  const freeCourses = useMemo(
    () =>
      FREE_FOREVER_COURSE_IDS.map((id) => COURSES.find((c) => c.id === id)).filter(
        (c): c is (typeof COURSES)[number] => Boolean(c),
      ),
    [],
  );

  return (
    <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-cyan-500/8 to-purple-500/10 p-6 md:p-7 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-emerald-200 text-xs font-bold uppercase tracking-wider">
          <Icon name="Gift" size={12} />
          Уже открыто
        </span>
      </div>

      <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
        Начни с бесплатного урока
      </h2>
      <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-2xl">
        Оплата не нужна: эти курсы открыты целиком, а в любом другом курсе первый урок
        бесплатный. Занимайся, а решение о покупке примешь потом.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {freeCourses.map((c) => (
          <Link
            key={c.id}
            to={`/course-checkout/${c.id}`}
            className="group rounded-2xl border border-white/12 bg-white/[0.05] hover:bg-white/[0.09] hover:border-emerald-400/40 transition-all p-4 flex flex-col"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl mb-3`}
            >
              {c.emoji}
            </div>
            <h3 className="text-white font-bold text-sm leading-snug mb-1.5 flex-1">{c.title}</h3>
            <p className="text-white/45 text-xs mb-3">{c.lessons} уроков</p>
            <span className="inline-flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
              Начать бесплатно
              <Icon
                name="ArrowRight"
                size={13}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Link
          to="/tutor"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2.5 text-white text-sm font-semibold transition-colors"
        >
          <Icon name="GraduationCap" size={15} />
          ИИ-репетитор
        </Link>
        <Link
          to="/homework"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2.5 text-white text-sm font-semibold transition-colors"
        >
          <Icon name="Camera" size={15} />
          Разбор домашки по фото
        </Link>
        <Link
          to="/free-courses"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2.5 text-white text-sm font-semibold transition-colors"
        >
          <Icon name="BookOpen" size={15} />
          Бесплатные мини-курсы
        </Link>
      </div>
    </div>
  );
}
