import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";

interface Props {
  ids: number[];
  coursesById: Record<number, Course>;
}

export default function HistoryRow({ ids, coursesById }: Props) {
  if (ids.length === 0) {
    return (
      <div className="bg-card/50 border border-white/10 rounded-2xl p-8 text-center">
        <Icon name="Clock" size={32} className="text-white/35 mx-auto mb-3" />
        <p className="text-white/75 font-bold mb-1">История пуста</p>
        <p className="text-white/45 text-sm">Открой карточку курса — он появится в истории</p>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ids.map((id) => {
        const c = coursesById[id];
        if (!c) return null;
        return (
          <div key={id} className="bg-card/55 border border-white/10 hover:border-white/20 rounded-2xl p-3 flex items-center gap-3 transition-all">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-lg flex-shrink-0`}>
              {c.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight line-clamp-2">{c.title}</p>
              <p className="text-white/40 text-[11px] mt-1">{c.tags.slice(0, 2).join(" · ")}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
