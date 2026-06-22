import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import { getHowItWorks, getWhatsIncluded, getCourseFaq } from "@/components/courses/courseValueData";

interface Props {
  course: Course;
}

export default function CourseDetailValue({ course }: Props) {
  const howItWorks = getHowItWorks(course);
  const included = getWhatsIncluded(course);
  const faq = getCourseFaq(course);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      {/* Как устроено обучение */}
      <div>
        <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
          <span>⚙️</span> Как устроено обучение
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {howItWorks.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/4 border border-white/8 rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} fallback="Check" size={17} className="text-purple-300" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm mb-0.5 leading-tight">{item.title}</p>
                <p className="text-white/60 text-xs leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Что входит в курс */}
      <div>
        <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
          <span>🎁</span> Что входит в курс
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {included.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl p-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="Check" size={11} className="text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm leading-tight">{item.title}</p>
                <p className="text-white/55 text-xs leading-relaxed mt-0.5">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
          <span>❓</span> Частые вопросы
        </h3>
        <div className="space-y-2">
          {faq.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="font-bold text-white text-sm">{item.q}</span>
                  <Icon
                    name="ChevronDown"
                    size={18}
                    className={`text-white/50 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <p className="px-4 pb-4 -mt-1 text-white/65 text-sm leading-relaxed">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
