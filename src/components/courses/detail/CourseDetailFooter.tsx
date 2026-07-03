import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course, getCoursePrice } from "@/components/courses/coursesData";
import { useAccess } from "@/context/AccessContext";

interface Props {
  course: Course;
  promoOn: boolean;
  onStartWithAI: (course: Course) => void;
  setActiveTab: (tab: "program" | "reviews" | "about") => void;
  setExpandedModule: (id: number | null) => void;
}

export default function CourseDetailFooter({
  course,
  promoOn,
  onStartWithAI,
  setActiveTab,
  setExpandedModule,
}: Props) {
  const navigate = useNavigate();
  const { canAccessCourse, hasSubscription } = useAccess();

  return (
    <div className="border-t border-white/10 bg-card/95 backdrop-blur-md p-4 md:p-5 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        {canAccessCourse(course.id) ? (
          <>
            <p className="text-green-300 text-sm font-bold flex items-center gap-1.5">
              <Icon name={course.freeForever ? "Gift" : "CheckCircle2"} size={14} />
              {course.freeForever ? "Бесплатно навсегда 🎁" : promoOn ? "Бесплатно по акции ДОБРО ❤️" : hasSubscription ? "Открыто по подписке" : "Курс куплен"}
            </p>
            <p className="text-white/45 text-xs mt-0.5">Все уроки доступны во вкладке «Программа»</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="font-montserrat font-black text-2xl text-white">
                {getCoursePrice(course).toLocaleString("ru-RU")} ₽
              </span>
              <span className="text-white/45 text-xs">за полный курс</span>
            </div>
            <p className="text-green-400 text-xs flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
              Первый урок без оплаты
            </p>
          </>
        )}
      </div>
      {canAccessCourse(course.id) ? (
        <button
          onClick={() => {
            setActiveTab("program");
            setExpandedModule(1);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 md:px-7 py-3 md:py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
        >
          <Icon name="Play" size={16} />
          <span className="hidden sm:inline">К программе</span>
          <span className="sm:hidden">Учить</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartWithAI(course)}
            className="hidden lg:flex items-center gap-2 bg-white/8 border border-white/15 text-white text-sm font-medium px-4 py-3 rounded-2xl hover:bg-white/12 transition-colors"
          >
            <Icon name="Gift" size={14} />
            Пробный урок
          </button>
          <button
            onClick={() => navigate(`/course-checkout/${course.id}`)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-4 md:px-7 py-3 md:py-3.5 rounded-2xl hover:opacity-90 transition-opacity glow-purple"
          >
            <Icon name="CreditCard" size={16} />
            <span className="hidden sm:inline">Купить курс</span>
            <span className="sm:hidden">Купить</span>
          </button>
        </div>
      )}
    </div>
  );
}