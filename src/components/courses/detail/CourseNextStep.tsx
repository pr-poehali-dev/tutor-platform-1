import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course, COURSES } from "@/components/courses/coursesData";
import { courseUrl } from "@/components/courses/courseSlug";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/**
 * Мостик с бесплатного курса на платное продолжение.
 *
 * Зачем: бесплатные курсы приводят людей, но заканчиваются тупиком —
 * человек прошёл программу и уходит, потому что ему не сказали, что дальше.
 * Предложение показываем только там, где продолжение действительно есть,
 * и только на бесплатном курсе: на платном оно выглядело бы как допродажа.
 */

/** Бесплатный курс → его платное продолжение. */
const NEXT: Record<number, { id: number; pitch: string }> = {
  // «Заработок на нейросетях: бесплатный старт» → полная программа
  76: {
    id: 64,
    pitch:
      "Вы собрали первую услугу. Дальше — то, что превращает её в поток заказов: монтаж Reels, озвучка и аватары, SMM на нейросетях, чат-боты, прайс и работа с клиентами.",
  },
  // «Нейросети с нуля» → профессиональный уровень для работы
  65: {
    id: 66,
    pitch:
      "Основы у вас есть. Следующий уровень — автоматизация рабочих процессов, свои ИИ-ассистенты и агенты, которые забирают рутину целиком.",
  },
  // «Интернет-маркетинг: первый расчёт» → полная профессия
  89: {
    id: 57,
    pitch:
      "Считать окупаемость вы уже умеете. Дальше — то, за что платят клиенты: настройка контекста и таргета на российских сервисах, email-рассылки, аналитика и поиск первых заказчиков.",
  },
};

export default function CourseNextStep({ course }: { course: Course }) {
  // Только для бесплатных: на платном курсе это была бы допродажа.
  if (course.price !== 0) return null;

  const link = NEXT[course.id];
  if (!link) return null;

  const next = COURSES.find((c) => c.id === link.id);
  if (!next) return null;

  const price = next.price.toLocaleString("ru-RU");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/8 to-cyan-600/12 p-5 md:p-6">
      <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-violet-500/15 blur-3xl" aria-hidden="true" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-400/25 rounded-full px-3 py-1 mb-3">
          <Icon name="ArrowRight" size={12} className="text-violet-200" />
          <span className="text-violet-100 text-[11px] font-bold uppercase tracking-wider">
            Что дальше
          </span>
        </div>

        <h3 className="font-montserrat font-black text-lg md:text-xl text-white mb-2 leading-snug">
          {next.title}
        </h3>

        <p className="text-white/70 text-sm leading-relaxed mb-4">{link.pitch}</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-white/55 text-xs mb-5">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="PlayCircle" size={13} className="text-violet-300" />
            {next.lessons} уроков
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Award" size={13} className="text-cyan-300" />
            Сертификат
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Infinity" fallback="Repeat" size={13} className="text-fuchsia-300" />
            Доступ навсегда
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={courseUrl(next)}
            onClick={() => trackGoal("course_next_step_click", { from: course.id, to: next.id })}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/20"
          >
            Посмотреть программу
            <Icon name="ArrowRight" size={16} />
          </Link>
          <span className="text-white/60 text-sm">
            <span className="text-white font-black text-base">{price} ₽</span> — один раз, без подписки
          </span>
        </div>

        <p className="text-white/35 text-[11px] mt-3 leading-relaxed">
          Переходить необязательно: бесплатный курс остаётся открытым навсегда.
        </p>
      </div>
    </div>
  );
}