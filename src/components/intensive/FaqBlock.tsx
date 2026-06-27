import { useState } from "react";
import Icon from "@/components/ui/icon";
import { FAQ } from "./data";

export default function FaqBlock() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
        <Icon name="HelpCircle" size={14} className="text-white/70" />
        <span className="text-white/70 text-xs font-bold uppercase tracking-wide">Частые вопросы</span>
      </div>
      <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-6">
        Отвечаем на главное
      </h2>

      <div className="space-y-3 max-w-3xl">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-colors hover:border-white/20"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-montserrat font-bold text-white text-sm md:text-base">{item.q}</span>
                <Icon
                  name="ChevronDown"
                  size={18}
                  className={`text-white/50 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-white/65 text-sm leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
