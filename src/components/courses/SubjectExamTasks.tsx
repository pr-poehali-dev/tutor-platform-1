import { useState } from "react";
import Icon from "@/components/ui/icon";
import { ExamTask } from "@/components/courses/subjectExamTasks";

/**
 * Блок «Разбор реальных заданий» на предметной странице.
 *
 * Решение спрятано под кнопкой: человек сначала пробует решить сам,
 * и только потом смотрит разбор. Это удерживает на странице дольше —
 * поисковые системы считают такое поведение признаком полезной страницы.
 *
 * Задания разделены на первую и вторую часть. Вторая часть — главная
 * ценность: там половина баллов экзамена, а разборов в интернете мало.
 * У таких заданий дополнительно показываем критерии эксперта.
 */

function TaskCard({ task }: { task: ExamTask }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-white/10 bg-card/60 overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              task.exam === "ЕГЭ"
                ? "bg-purple-500/15 text-purple-200 border-purple-500/30"
                : "bg-cyan-500/15 text-cyan-200 border-cyan-500/30"
            }`}
          >
            {task.exam} · {task.number}
          </span>
          <span className="text-[11px] text-white/50 bg-white/6 px-2.5 py-1 rounded-full">
            {task.topic}
          </span>
          {task.points ? (
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/12 border border-emerald-500/25 px-2.5 py-1 rounded-full">
              {task.points}{" "}
              {task.points === 1 ? "балл" : task.points < 5 ? "балла" : "баллов"}
            </span>
          ) : null}
        </div>

        <p className="text-white/90 leading-relaxed mb-4">{task.statement}</p>

        {!open ? (
          <button
            onClick={() => setOpen(true)}
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
              {task.steps.map((s, k) => (
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
              <span className="text-emerald-200 font-bold">{task.answer}</span>
            </div>

            {task.criteria?.length ? (
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/8 px-4 py-3 mb-3">
                <span className="text-sky-300/70 text-[10px] uppercase tracking-wider font-bold block mb-2">
                  Как оценивает эксперт
                </span>
                <ul className="space-y-1.5">
                  {task.criteria.map((c, k) => (
                    <li key={k} className="flex gap-2 text-sm text-white/75 leading-relaxed">
                      <span className="text-sky-400/60 mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
              <span className="text-amber-300/70 text-[10px] uppercase tracking-wider font-bold block mb-1">
                Где чаще всего теряют балл
              </span>
              <span className="text-white/75 text-sm leading-relaxed">{task.trap}</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white/70 text-xs mt-3 transition-colors"
            >
              Свернуть решение
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function SubjectExamTasks({
  tasks,
  subjectNameGenitive,
}: {
  tasks: ExamTask[];
  /** Название предмета в дательном падеже: «математике», «физике». */
  subjectNameGenitive: string;
}) {
  if (!tasks.length) return null;

  const part1 = tasks.filter((t) => t.part !== 2);
  const part2 = tasks.filter((t) => t.part === 2);
  const part2Points = part2.reduce((sum, t) => sum + (t.points || 0), 0);

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

      {part1.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h3 className="font-montserrat font-black text-lg md:text-xl text-white">
              Первая часть — краткий ответ
            </h3>
            <span className="text-[11px] text-white/40 bg-white/6 px-2.5 py-1 rounded-full">
              {part1.length} задания
            </span>
          </div>
          <div className="space-y-4">
            {part1.map((t, i) => (
              <TaskCard key={`p1-${t.number}-${i}`} task={t} />
            ))}
          </div>
        </div>
      )}

      {part2.length > 0 && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="font-montserrat font-black text-lg md:text-xl text-white">
              Вторая часть — развёрнутый ответ
            </h3>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/12 border border-emerald-500/25 px-2.5 py-1 rounded-full">
              {part2Points} первичных баллов
            </span>
          </div>
          <p className="text-white/55 text-sm mb-5 max-w-2xl">
            Здесь работу проверяет эксперт по критериям, а не компьютер. Баллы снимают за
            пропущенные шаги даже при верном ответе — поэтому у каждого задания показано,
            как именно его оценивают.
          </p>
          <div className="space-y-4">
            {part2.map((t, i) => (
              <TaskCard key={`p2-${t.number}-${i}`} task={t} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
