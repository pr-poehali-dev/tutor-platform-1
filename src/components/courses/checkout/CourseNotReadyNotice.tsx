import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function CourseNotReadyNotice() {
  return (
    <div className="bg-amber-500/10 border border-amber-500/35 rounded-2xl p-5 mb-5">
      <p className="text-amber-200 font-black text-base flex items-center gap-2 mb-2">
        <Icon name="Clock" size={18} />
        Курс ещё готовится к запуску
      </p>
      <p className="text-white/75 text-sm mb-4">
        Наши методисты дорабатывают программу этого курса. Мы не открываем продажи, пока курс не готов на 100% — деньги обратно потом получать никому не хочется. Загляни через пару дней или выбери другой курс из каталога.
      </p>
      <div className="flex gap-2 flex-wrap">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Icon name="LayoutGrid" size={14} />
          Все доступные курсы
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-white/12 transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          На главную
        </Link>
      </div>
    </div>
  );
}
