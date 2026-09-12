import Icon from "@/components/ui/icon";
import { TimelineEvent } from "@/components/journey/journeyData";

interface Props {
  events: TimelineEvent[];
  accent?: string;
}

/** Лента времени урока: событие + дата + чем важно.
 *  Нужна там, где событие без даты бессмысленно (история): ученик видит хронологию
 *  сразу на первом экране теории, а не вылавливает годы из текста. */
export default function LessonTimeline({ events, accent = "#a855f7" }: Props) {
  if (!events || events.length === 0) return null;

  return (
    <div className="mb-5 rounded-2xl border border-white/10 bg-white/4 p-4">
      <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Icon name="CalendarClock" size={13} style={{ color: accent }} />
        Хронология событий
      </p>
      <ol className="relative flex flex-col gap-3 pl-1">
        {events.map((e, i) => (
          <li key={`${e.date}-${i}`} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex-shrink-0 rounded-lg px-2 py-1 text-xs font-black tabular-nums text-white"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
            >
              {e.date}
            </span>
            <span className="min-w-0">
              <span className="block text-white/90 text-sm font-semibold leading-snug">{e.event}</span>
              {e.meaning && (
                <span className="block text-white/55 text-xs leading-relaxed mt-0.5">{e.meaning}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
