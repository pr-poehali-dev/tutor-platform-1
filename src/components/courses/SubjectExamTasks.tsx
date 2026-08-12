import { useState } from "react";
import Icon from "@/components/ui/icon";
import { ExamTask } from "@/components/courses/subjectExamTasks";

/**
 * Блок «Разбор реальных заданий» на предметной странице.
 *
 * Решение спрятано под кнопкой: человек сначала пробует решить сам,
 * и только потом смотрит разбор. Это удерживает на странице дольше —
 * поисковые системы считают такое поведение признаком полезной страницы.
 */
export default function SubjectExamTasks({
  tasks,
  subjectNameGenitive,
}: {
  tasks: ExamTask[];
  /** Название предмета в дательном падеже: «математике», «физике». */
  subjectNameGenitive: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!tasks.length) return null;

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
          Разбор реальных заданий ЕГЭ и ОГЭ по {subjectNameGenitive}
        </h2>
        <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
          Задания в формате ФИПИ с пошаговым решением. Попробуйте решить сами, а потом
          сверьтесь с разбором — так запоминается лучше.
        </p>
      </div>

      <div className="space-y-4">
        {tasks.map((t, i) => {
          const isOpen = openIdx === i;
          return (
            <article
              key={`${t.exam}-${t.number}-${i}`}
              className="rounded-2xl border border-white/10 bg-card/60 overflow-hidden"
            >
              <div className="p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      t.exam === "ЕГЭ"
                        ? "bg-purple-500/15 text-purple-200 border-purple-500/30"
                        : "bg-cyan-500/15 text-cyan-200 border-cyan-500/30"
                    }`}
                  >
                    {t.exam} · {t.number}
                  </span>
                  <span className="text-[11px] text-white/50 bg-white/6 px-2.5 py-1 rounded-full">
                    {t.topic}
                  </span>
                </div>

                <p className="text-white/90 leading-relaxed mb-4">{t.statement}</p>

                {!isOpen ? (
                  <button
                    onClick={() => setOpenIdx(i)}
                    className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/15 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <Icon name="Eye" size={16} />
                    Показать решение
                  </button>
                ) : (
                  <div className="animate-fade-in">
                    <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-2.5">
                      Решение по шагам
                    </p>
                    <ol className="space-y-2.5 mb-5">
                      {t.steps.map((s, k) => (
                        <li key={k} className="flex gap-3 text-sm text-white/80 leading-relaxed">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-[11px] font-black flex items-center justify-center mt-0.5">
                            {k + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 mb-3">
                      <span className="text-emerald-300/70 text-[10px] uppercase tracking-wider font-bold block mb-1">
                        Ответ
                      </span>
                      <span className="text-emerald-200 font-bold">{t.answer}</span>
                    </div>

                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
                      <span className="text-amber-300/70 text-[10px] uppercase tracking-wider font-bold block mb-1">
                        Где чаще всего теряют балл
                      </span>
                      <span className="text-white/75 text-sm leading-relaxed">{t.trap}</span>
                    </div>

                    <button
                      onClick={() => setOpenIdx(null)}
                      className="text-white/40 hover:text-white/70 text-xs mt-3 transition-colors"
                    >
                      Свернуть решение
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}