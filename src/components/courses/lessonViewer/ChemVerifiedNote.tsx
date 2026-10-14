import { useState } from "react";
import Icon from "@/components/ui/icon";

/** Пометка в уроках химии: уравнения реакций проверяются на баланс автоматически.
 *  Доработка сделана по просьбе репетитора по химии Юлии Быковой. */
export default function ChemVerifiedNote({ stats }: { stats?: { checked: number; fixed: number } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.07] px-4 py-3">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2.5 text-left">
        <Icon name="FlaskConical" size={18} className="text-emerald-300 flex-shrink-0" />
        <span className="flex-1 text-sm text-white/85">
          <b className="text-white">Уравнения реакций проверены</b>
          {stats && stats.checked > 0 ? ` · ${stats.checked} шт.${stats.fixed > 0 ? `, коэффициенты исправлены в ${stats.fixed}` : ""}` : ""}
        </span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={16} className="text-white/50" />
      </button>
      {open && (
        <p className="text-white/65 text-xs leading-relaxed mt-2 pl-7">
          Каждое уравнение в уроке автоматически проверяется по закону сохранения массы: число атомов каждого элемента
          слева и справа должно совпадать. Если коэффициенты расставлены неверно — они исправляются. Доработка сделана по
          просьбе репетитора по химии Юлии Быковой. Нашли ошибку в реакции — напишите нам через форму отзыва в конце урока.
        </p>
      )}
    </div>
  );
}
