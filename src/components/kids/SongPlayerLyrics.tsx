import Icon from "@/components/ui/icon";
import { Song } from "./songsData";

interface Props {
  song: Song;
  currentLine: number;
  loading: boolean;
}

/** Текст песни. Для готового студийного трека (живой вокал) весь текст всегда
 *  виден целиком и читаем — прошлые строки НЕ затемняются и не пропадают, что
 *  важно для детей, читающих текст, в т.ч. слабослышащих. Активная строка лишь
 *  мягко подсвечивается как ориентир. Для синтеза голосом Лисы (строки идут по
 *  одной) сохраняется классическая караоке-подсветка. */
export default function SongPlayerLyrics({ song, currentLine, loading }: Props) {
  const fullTextAlwaysVisible = Boolean(song.audioUrl);

  return (
    <div className="p-5 md:p-6 max-h-[50vh] overflow-y-auto">
      {fullTextAlwaysVisible && (
        <div className="mb-3 flex items-center gap-2 text-white/50 text-[11px]">
          <Icon name="AlignLeft" size={12} />
          <span>Полный текст песни — читайте и подпевайте</span>
        </div>
      )}
      <div className="space-y-1.5">
        {song.lines.map((line, idx) => {
          const isActive = idx === currentLine;
          const isPast = idx < currentLine;
          // класс прозрачности: при полном тексте ничего не гасим
          const dimClass = fullTextAlwaysVisible
            ? "opacity-100"
            : isPast
            ? "opacity-40"
            : "opacity-70";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 px-3 py-2 rounded-xl transition-all ${
                isActive ? "bg-white/15 border border-white/25" : dimClass
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-base md:text-lg leading-relaxed font-medium ${isActive || fullTextAlwaysVisible ? "text-white" : "text-white/80"}`}>
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