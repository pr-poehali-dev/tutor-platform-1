import Icon from "@/components/ui/icon";
import { LibraryItem } from "@/components/kids/libraryData";

interface Props {
  item: LibraryItem;
  chunks: string[];
  currentChunk: number;
  playing: boolean;
  onChunkClick: (i: number) => void;
}

/** Текст произведения с подсветкой текущего фрагмента + мораль + авторская заметка. */
export default function TalePlayerText({ item, chunks, currentChunk, playing, onChunkClick }: Props) {
  return (
    <>
      {/* Сам текст с подсветкой текущего фрагмента */}
      <div className="p-5 pt-6 text-white/85 text-base leading-relaxed space-y-3">
        {chunks.map((c, i) => (
          <p
            key={i}
            onClick={() => onChunkClick(i)}
            className={`cursor-pointer rounded-xl px-3 py-2 transition-all whitespace-pre-line ${
              currentChunk === i
                ? "bg-gradient-to-r from-pink-500/15 to-rose-500/15 border border-pink-500/30 text-white"
                : "hover:bg-white/[0.03]"
            }`}
            // помечаем неиспользуемый аргумент playing — он нужен через onChunkClick, не здесь
            data-playing={playing ? "1" : "0"}
          >
            {c}
          </p>
        ))}
      </div>

      {item.morale && (
        <div className="mx-5 mb-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Icon name="Lightbulb" size={18} className="text-white" />
          </div>
          <div>
            <p className="text-amber-200 text-[10px] uppercase tracking-wider font-bold mb-1">Главная идея</p>
            <p className="text-white/85 text-sm leading-relaxed">{item.morale}</p>
          </div>
        </div>
      )}

      {item.authorNote && (
        <p className="px-5 pb-4 text-white/35 text-[10px] italic">
          {item.authorNote}
        </p>
      )}
    </>
  );
}
