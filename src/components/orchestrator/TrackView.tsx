import Icon from "@/components/ui/icon";
import { Track } from "./api";

interface Props {
  track: Track;
  onApply: () => void;
  onRestart: () => void;
  onOpenDashboard: () => void;
  onPlanResources: () => void;
}

const levelColor: Record<string, string> = {
  базовый: "text-white/60 bg-white/[0.05] border-white/15",
  уверенный: "text-cyan-200 bg-cyan-500/15 border-cyan-400/30",
  эксперт: "text-violet-200 bg-violet-500/15 border-violet-400/30",
};

export default function TrackView({ track, onApply, onRestart, onOpenDashboard, onPlanResources }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="Music4" size={13} /> Трек адаптации готов
        </span>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight">
          {track.track_title}
        </h2>
        {track.summary && <p className="text-white/70 text-sm md:text-base mt-2 max-w-2xl mx-auto">{track.summary}</p>}
      </div>

      {/* Матрица навыков */}
      {track.skill_matrix?.length > 0 && (
        <Section icon="ListChecks" title="Матрица навыков">
          <div className="grid sm:grid-cols-2 gap-3">
            {track.skill_matrix.map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-white text-[15px]">{s.skill}</h4>
                  <span className={`flex-shrink-0 text-[11px] font-bold rounded-lg border px-2 py-0.5 ${levelColor[s.level] || levelColor["уверенный"]}`}>
                    {s.level}
                  </span>
                </div>
                {s.why && <p className="text-white/55 text-xs leading-snug">{s.why}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Артефакты + скрининг */}
      <div className="grid md:grid-cols-2 gap-4">
        {track.artifacts?.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="flex items-center gap-2 font-bold text-white mb-3">
              <Icon name="FolderCheck" size={17} className="text-violet-300" /> Проверить на входе
            </h3>
            <ul className="space-y-2">
              {track.artifacts.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <Icon name="Check" size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" /> {a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {track.screening && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="flex items-center gap-2 font-bold text-white mb-3">
              <Icon name="ClipboardCheck" size={17} className="text-violet-300" /> Входной контроль
            </h3>
            {track.screening.test_questions?.length > 0 && (
              <ol className="space-y-1.5 mb-3">
                {track.screening.test_questions.map((q, i) => (
                  <li key={i} className="text-sm text-white/75 flex gap-2">
                    <span className="text-violet-300 font-bold">{i + 1}.</span> {q}
                  </li>
                ))}
              </ol>
            )}
            {track.screening.mini_case && (
              <div className="text-sm text-white/70 bg-violet-500/[0.06] border border-violet-400/15 rounded-lg px-3 py-2 mb-2">
                <span className="font-semibold text-violet-200">Мини-кейс: </span>
                {track.screening.mini_case}
              </div>
            )}
            {track.screening.pass_criteria && (
              <p className="text-xs text-white/50">
                <span className="text-emerald-300 font-semibold">Прошёл, если: </span>
                {track.screening.pass_criteria}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Онбординг по дням */}
      {track.onboarding?.length > 0 && (
        <Section icon="CalendarClock" title="Онбординг по дням">
          <div className="space-y-3">
            {track.onboarding.map((d, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-black text-white bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg px-2.5 py-1">
                    {d.day}
                  </span>
                  <span className="text-white font-semibold text-[15px]">{d.goal}</span>
                </div>
                {d.steps?.length > 0 && (
                  <ul className="space-y-1 mb-2">
                    {d.steps.map((st, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                        <Icon name="Dot" size={16} className="text-violet-300 flex-shrink-0" /> {st}
                      </li>
                    ))}
                  </ul>
                )}
                {d.checkpoint && (
                  <div className="flex items-start gap-2 text-sm text-emerald-200/90 bg-emerald-500/[0.06] border border-emerald-400/15 rounded-lg px-3 py-2">
                    <Icon name="Flag" size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{d.checkpoint}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Микрозадачи */}
      {track.tasks?.length > 0 && (
        <Section icon="SquareCheckBig" title="Стартовые задачи с критериями «готово»">
          <div className="space-y-2.5">
            {track.tasks.map((t, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="font-semibold text-white text-sm mb-1.5">{t.title}</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {t.done_criteria && (
                    <div className="text-xs text-white/60 flex items-start gap-1.5">
                      <Icon name="Target" size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><b className="text-white/75">Готово:</b> {t.done_criteria}</span>
                    </div>
                  )}
                  {t.deliverable && (
                    <div className="text-xs text-white/60 flex items-start gap-1.5">
                      <Icon name="Upload" size={13} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span><b className="text-white/75">Сдача:</b> {t.deliverable}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Риски и метрики */}
      <div className="grid md:grid-cols-2 gap-4">
        {track.risks?.length > 0 && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-5">
            <h3 className="flex items-center gap-2 font-bold text-white mb-3">
              <Icon name="ShieldAlert" size={17} className="text-amber-300" /> Карта рисков
            </h3>
            <div className="space-y-2.5">
              {track.risks.map((r, i) => (
                <div key={i} className="text-sm">
                  <div className="text-white font-semibold">{r.risk}</div>
                  {r.signal && <div className="text-white/50 text-xs">Сигнал: {r.signal}</div>}
                  {r.action && <div className="text-emerald-200/80 text-xs">→ {r.action}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        {track.metrics?.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="flex items-center gap-2 font-bold text-white mb-3">
              <Icon name="Gauge" size={17} className="text-violet-300" /> Метрики для контроля
            </h3>
            <div className="flex flex-wrap gap-2">
              {track.metrics.map((m, i) => (
                <span key={i} className="text-xs text-white/80 bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Планировщик ресурсов: сами / ИИ / внешний */}
      <button
        onClick={onPlanResources}
        className="w-full text-left rounded-3xl border border-violet-400/30 bg-white/[0.03] hover:bg-violet-500/[0.08] transition-colors p-5 md:p-6 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Icon name="Split" size={22} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-montserrat font-black text-white text-lg">Что делать самим, а кого нанять?</div>
          <p className="text-white/60 text-sm">
            ИИ разложит задачи на «своими силами», «силами ИИ» и «нужен внешний спец» — и соберёт вакансию под подбор.
          </p>
        </div>
        <Icon name="ChevronRight" size={20} className="text-violet-300 flex-shrink-0" />
      </button>

      {/* CTA: запустить в дашборде (PRO) или заявка */}
      <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600/15 to-cyan-500/10 p-6 md:p-8 text-center">
        <h3 className="font-montserrat font-black text-xl text-white mb-1">Запустить этот трек в работу</h3>
        <p className="text-white/60 text-sm mb-5 max-w-lg mx-auto">
          Заведите проект в рабочем дашборде: добавляйте исполнителей, ведите задачи по статусам, ставьте оценки
          качества и следите за рисками. Или оставьте заявку — поможем настроить пилот.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onOpenDashboard}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-7 py-3.5 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="LayoutDashboard" size={18} /> Открыть рабочий дашборд
          </button>
          <button
            onClick={onApply}
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl border border-white/15 hover:border-violet-400/50 transition-colors"
          >
            <Icon name="Send" size={18} /> Заявка на пилот
          </button>
        </div>
        <button onClick={onRestart} className="mt-4 block mx-auto text-white/50 hover:text-white text-sm transition-colors">
          <Icon name="RotateCcw" size={14} className="inline mr-1" /> Собрать трек для другой роли
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-montserrat font-black text-lg text-white mb-3">
        <Icon name={icon} size={18} className="text-violet-300" /> {title}
      </h3>
      {children}
    </div>
  );
}