import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course, GRADES, SUBJECTS, getCoursePrice } from "@/components/courses/coursesData";
import { useAccess } from "@/context/AccessContext";
import { getTodayPurchases } from "@/components/courses/CheckoutBoosters";
import { isPromoActive } from "@/components/promo/dobroConfig";

interface Props {
  course: Course;
}

export default function CourseCardCompact({ course }: Props) {
  const { canAccessCourse } = useAccess();
  const promoOn = isPromoActive();
  const owned = canAccessCourse(course.id);
  const price = getCoursePrice(course);
  const gradeLabel = GRADES.find((g) => g.id === course.grade)?.label || course.grade;
  const subjectLabel = SUBJECTS.find((s) => s.id === course.subject)?.label || course.subject;
  const todayCount = getTodayPurchases(course.id, course.students);

  return (
    <Link
      to={`/course-checkout/${course.id}`}
      className="group relative flex flex-col bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/25 hover:translate-y-[-2px] transition-all"
    >
      <div className={`h-1.5 bg-gradient-to-r ${course.color}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Бейджи */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap min-h-[22px]">
          {course.isHit && (
            <span className="inline-flex items-center gap-1 bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Icon name="Flame" size={10} /> Хит
            </span>
          )}
          {course.isNew && (
            <span className="inline-flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Icon name="Sparkles" size={10} /> Новинка
            </span>
          )}
          {!promoOn && course.isSale && course.salePercent && (
            <span className="inline-flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              −{course.salePercent}%
            </span>
          )}
          {course.freeForever ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Icon name="Gift" size={10} /> Бесплатно навсегда
            </span>
          ) : promoOn ? (
            <span className="inline-flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              ❤️ Бесплатно
            </span>
          ) : owned && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Icon name="CheckCircle2" size={10} /> Куплен
            </span>
          )}
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-3xl flex-shrink-0`}>
            {course.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-white/45 text-[11px] uppercase tracking-wider font-semibold mb-1">{subjectLabel}</p>
            <h3 className="font-montserrat font-black text-white text-base leading-snug line-clamp-2">{course.title}</h3>
          </div>
        </div>

        <p className="text-white/55 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">{course.description}</p>

        <div className="flex items-center gap-3 text-white/55 text-xs mb-4">
          <span className="flex items-center gap-1"><Icon name="GraduationCap" size={12} /> {gradeLabel}</span>
          <span className="flex items-center gap-1"><Icon name="BookOpen" size={12} /> {course.lessons} ур.</span>
          <span className="flex items-center gap-1"><Icon name="Star" size={12} className="text-amber-400" /> {course.rating.toFixed(2)}</span>
        </div>

        {!course.freeForever && !promoOn && !owned && todayCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-300/90 mb-2.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="font-semibold">{todayCount}</span>
            <span className="text-white/45">купили сегодня</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/8">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Цена</p>
            {course.freeForever ? (
              <p className="font-montserrat font-black text-lg text-emerald-300">Бесплатно</p>
            ) : promoOn ? (
              <p className="font-montserrat font-black text-lg text-rose-300">Бесплатно</p>
            ) : (
              <p className="font-montserrat font-black text-lg text-white">{price.toLocaleString("ru-RU")} ₽</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-bold px-3 py-2 rounded-xl group-hover:bg-purple-500/25 transition-colors">
            {course.freeForever || promoOn || owned ? "Открыть" : "Купить"}
            <Icon name="ArrowRight" size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}