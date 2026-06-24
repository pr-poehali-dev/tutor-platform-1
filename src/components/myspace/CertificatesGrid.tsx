import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import { MyCourse } from "@/hooks/useUserData";
import { isCertificateEligible } from "@/lib/certificateEligibility";
import CertificateModal from "./CertificateModal";

interface Props {
  myCourses: MyCourse[];
  coursesById: Record<number, Course>;
}

export default function CertificatesGrid({ myCourses, coursesById }: Props) {
  const [selected, setSelected] = useState<MyCourse | null>(null);

  const allCompleted = myCourses.filter((c) => c.status === "completed");
  // Сертификат выдаётся только для курсов вне школьной программы.
  const completed = allCompleted.filter((c) =>
    isCertificateEligible(coursesById[c.course_id]?.subject ?? c.subject),
  );
  // Завершённые школьные курсы — сертификат не предусмотрен (часть ФГОС).
  const completedSchool = allCompleted.filter(
    (c) => !isCertificateEligible(coursesById[c.course_id]?.subject ?? c.subject),
  );
  const inProgress = myCourses.filter(
    (c) =>
      c.status !== "completed" &&
      isCertificateEligible(coursesById[c.course_id]?.subject ?? c.subject),
  );

  return (
    <div className="space-y-4">
      <div className="bg-card/50 border border-white/10 rounded-2xl p-4 md:p-5">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Award" size={18} className="text-amber-400" />
          <h3 className="font-montserrat font-black text-white">Мои сертификаты</h3>
        </div>
        <p className="text-white/50 text-sm">
          Заверши курс полностью — и получишь именной сертификат, который можно скачать и показать.
          Сертификаты выдаются по курсам дополнительного развития (вне школьной программы).
        </p>
      </div>

      {completed.length === 0 ? (
        <div className="bg-card/50 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-center mx-auto mb-3">
            <Icon name="Award" size={28} className="text-amber-400/70" />
          </div>
          <p className="text-white/75 font-bold mb-1">Пока нет сертификатов</p>
          <p className="text-white/45 text-sm max-w-sm mx-auto">
            Сертификат появится здесь автоматически, когда ты пройдёшь курс на 100%.
          </p>
          {inProgress.length > 0 && (
            <div className="mt-5 text-left max-w-md mx-auto space-y-2">
              <p className="text-white/55 text-xs font-bold uppercase tracking-wider">Уже близко:</p>
              {inProgress.slice(0, 3).map((mc) => {
                const c = coursesById[mc.course_id];
                if (!c) return null;
                return (
                  <div key={mc.course_id} className="bg-white/[0.05] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-lg flex-shrink-0`}>
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{c.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400" style={{ width: `${mc.progress}%` }} />
                        </div>
                        <span className="text-white/65 text-[11px] tabular-nums font-bold">{mc.progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {completed.map((mc) => {
            const c = coursesById[mc.course_id];
            const title = c?.title || mc.title;
            return (
              <button
                key={mc.course_id}
                onClick={() => setSelected(mc)}
                className="text-left group relative rounded-2xl overflow-hidden border border-amber-400/25 hover:border-amber-400/50 transition-all"
                style={{ background: "linear-gradient(135deg,#1a1538 0%,#221a4a 100%)" }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl" />
                <div className="relative p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c?.color || "from-purple-500 to-cyan-500"} flex items-center justify-center text-xl`}>
                      {c?.emoji || "🎓"}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 rounded-full px-2.5 py-1">
                      <Icon name="BadgeCheck" size={12} className="text-amber-400" />
                      <span className="text-amber-300 text-[10px] font-black uppercase">Завершён</span>
                    </div>
                  </div>
                  <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-3 min-h-[2.5rem]">{title}</p>
                  <div className="flex items-center gap-1.5 text-purple-300 group-hover:text-purple-200 text-xs font-bold transition-colors">
                    <Icon name="Award" size={14} />
                    Открыть сертификат
                    <Icon name="ChevronRight" size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {completedSchool.length > 0 && (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/25 flex items-center justify-center flex-shrink-0">
            <Icon name="GraduationCap" size={18} className="text-blue-300" />
          </div>
          <div>
            <p className="text-white/80 font-bold text-sm mb-0.5">
              Завершено школьных курсов: {completedSchool.length}
            </p>
            <p className="text-white/45 text-xs leading-relaxed">
              По курсам школьной программы сертификат не выдаётся — это часть основного
              образования (ФГОС). Сертификаты предусмотрены только для курсов
              дополнительного развития.
            </p>
          </div>
        </div>
      )}

      {selected && (
        <CertificateModal
          open={!!selected}
          onClose={() => setSelected(null)}
          myCourse={selected}
          course={coursesById[selected.course_id]}
        />
      )}
    </div>
  );
}