import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";

interface Props {
  ids: number[];
  coursesById: Record<number, Course>;
  onToggle: (id: number) => void;
}

export default function FavoritesRow({ ids, coursesById, onToggle }: Props) {
  if (ids.length === 0) {
    return (
      <div className="bg-card/50 border border-white/10 rounded-2xl p-8 text-center">
        <Icon name="Heart" size={32} className="text-white/35 mx-auto mb-3" />
        <p className="text-white/75 font-bold mb-1">Нет избранных курсов</p>
        <p className="text-white/45 text-sm">Нажми на ♥ в карточке курса, чтобы сохранить</p>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ids.map((id) => {
        const c = coursesById[id];
        if (!c) return null;
        return (
          <div key={id} className="relative bg-card/55 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all group">
            <button
              onClick={() => onToggle(id)}
              aria-label="Убрать из избранного"
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-pink-500/30 hover:bg-pink-500/50 text-pink-300 flex items-center justify-center transition-colors"
            >
              <Icon name="Heart" size={13} className="fill-current" />
            </button>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-xl mb-3`}>
              {c.emoji}
            </div>
            <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">{c.title}</p>
            <p className="text-white/45 text-xs line-clamp-1">{c.description}</p>
          </div>
        );
      })}
    </div>
  );
}
