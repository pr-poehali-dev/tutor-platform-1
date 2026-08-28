import { useState, ReactNode } from "react";
import Icon from "@/components/ui/icon";

/**
 * Раскрывающийся блок для статей-практикумов.
 *
 * Зачем: в статьях с упражнениями разбор нужно прятать, иначе человек
 * прочитает ответ раньше, чем попробует сам, и навык не появится.
 *
 * Разметка в тексте статьи:
 *   :::spoiler Показать разбор
 *   Текст разбора
 *   :::
 */

interface Props {
  title: string;
  children: ReactNode;
}

export default function FeedArticleSpoiler({ title, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-5 rounded-2xl border border-primary/30 bg-primary/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon name={open ? "Eye" : "EyeOff"} size={15} className="text-primary" />
        </div>
        <span className="flex-1 font-montserrat font-bold text-white text-sm md:text-base">
          {title}
        </span>
        <Icon
          name="ChevronDown"
          size={18}
          className={`text-white/40 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-white/80 text-sm md:text-base leading-relaxed space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
