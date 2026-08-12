import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { MiniCourse } from "./types";

/**
 * Замок на уроке мини-курса.
 *
 * Первый урок открыт всем — человек успевает получить пользу и убедиться,
 * что материал качественный. Дальше просим бесплатную регистрацию:
 * денег не берём, но получаем контакт, которому потом можно предложить курс.
 *
 * Показываем, что именно откроется, и сколько уроков ещё впереди —
 * человеку видно, что за замком реальный материал, а не пустая заглушка.
 */
export default function LessonLockedBlock({ course }: { course: MiniCourse }) {
  const { openLogin } = useAuth();
  const left = course.lessons.length - 1;

  return (
    <div className="relative">
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/12 to-blue-600/8 p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
          <Icon name="Lock" size={24} className="text-white" />
        </div>

        <h3 className="font-montserrat font-black text-xl mb-2">
          Дальше — после бесплатной регистрации
        </h3>
        <p className="text-white/65 text-sm mb-5 max-w-md mx-auto leading-relaxed">
          Первый урок вы прошли бесплатно. Создайте аккаунт за 30 секунд — откроются
          остальные {left} {left === 1 ? "урок" : left < 5 ? "урока" : "уроков"} этого курса
          и все 26 мини-курсов целиком.
        </p>

        <ul className="text-left max-w-sm mx-auto space-y-2 mb-6">
          {[
            "Все уроки курса без ограничений",
            "26 мини-курсов на любой вечер",
            "Прогресс сохраняется между устройствами",
            "Карта не нужна — это бесплатно",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-white/85">
              <Icon name="Check" size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={openLogin}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
        >
          <Icon name="UserPlus" size={18} />
          Продолжить бесплатно
        </button>

        <p className="text-white/40 text-xs mt-3">Уже есть аккаунт? Нажмите ту же кнопку — войдёте.</p>
      </div>
    </div>
  );
}