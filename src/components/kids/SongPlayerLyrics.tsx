import Icon from "@/components/ui/icon";
import { Song } from "./songsData";

interface Props {
  song: Song;
  currentLine: number;
  loading: boolean;
}

/** Текст песни с караоке-подсветкой активной строки, блок «Чему учит»
 *  и совет родителю. */
export default function SongPlayerLyrics({ song, currentLine, loading }: Props) {
  return (
    <div className="p-5 md:p-6 max-h-[50vh] overflow-y-auto">
      <div className="space-y-1.5">
        {song.lines.map((line, idx) => {
          const isActive = idx === currentLine;
          const isPast = idx < currentLine;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? "bg-white/15 border border-white/25 scale-[1.02]"
                  : isPast
                  ? "opacity-40"
                  : "opacity-70"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-base md:text-lg leading-relaxed font-medium ${isActive ? "text-white" : "text-white/80"}`}>
                  {line.text}
                  {isActive && loading && (
                    <Icon name="Loader2" size={12} className="inline ml-2 animate-spin text-amber-300" />
                  )}
                </p>
                {line.action && (
                  <p className={`text-[11px] mt-0.5 ${isActive ? "text-amber-300" : "text-white/40"}`}>
                    <Icon name="Hand" size={10} className="inline mr-1" />
                    {line.action}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Чему учит */}
      {song.teaches?.length > 0 && (
        <div className="mt-5 p-3 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1.5">Чему учит</p>
          <div className="flex flex-wrap gap-1.5">
            {song.teaches.map((t) => (
              <span key={t} className="text-[11px] text-white/75 bg-white/5 px-2 py-0.5 rounded-lg">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Совет родителю */}
      {song.parentTip && (
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-400/25 rounded-xl">
          <p className="text-amber-300 text-[11px] font-bold mb-1">💡 Совет родителю</p>
          <p className="text-white/75 text-xs leading-relaxed">{song.parentTip}</p>
        </div>
      )}
    </div>
  );
}
