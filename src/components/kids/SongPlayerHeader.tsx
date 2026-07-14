import Icon from "@/components/ui/icon";
import { Song, MELODY_TRACKS, getSongAvatar } from "./songsData";

interface Props {
  song: Song;
  hasRealAudio: boolean;
  usingFallback: boolean;
  melody: (typeof MELODY_TRACKS)[keyof typeof MELODY_TRACKS];
  singSpeed: number;
  musicEnabled: boolean;
  setMusicEnabled: (updater: (v: boolean) => boolean) => void;
  progress: number;
  onClose: () => void;
}

/** Шапка плеера песенки: эмодзи, заголовок, бейджи вокала/музыки,
 *  кнопки управления музыкой/закрытия и полоса прогресса. */
export default function SongPlayerHeader({
  song,
  hasRealAudio,
  usingFallback,
  melody,
  singSpeed,
  musicEnabled,
  setMusicEnabled,
  progress,
  onClose,
}: Props) {
  return (
    <>
      {/* Header */}
      <div className={`bg-gradient-to-r ${song.color} p-5 flex items-center gap-4 relative`}>
        <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm overflow-hidden flex items-center justify-center text-4xl shrink-0">
          <img src={getSongAvatar(song)} alt={song.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-montserrat font-black text-white text-xl truncate">{song.title}</h2>
          <p className="text-white/85 text-xs">{song.author}</p>
          {/* Бейджи: тип вокала + сопровождение */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {hasRealAudio ? (
              <div className="inline-flex items-center gap-1 bg-white/25 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="text-[10px]">🎤</span>
                <span className="text-white text-[10px] font-black">Живой вокал</span>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <span className="text-[10px]">🦊</span>
                  <span className="text-white text-[10px] font-bold">
                    {usingFallback ? "Голос браузера" : "Лиса поёт"}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <span className="text-[10px]">🎵</span>
                  <span className="text-white text-[10px] font-bold">{melody.label}</span>
                </div>
                <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <span className="text-white text-[10px] font-bold">×{singSpeed}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {!hasRealAudio && (
            <button
              onClick={() => setMusicEnabled((v) => !v)}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
              title={musicEnabled ? "Выключить музыку" : "Включить музыку"}
            >
              <Icon name={musicEnabled ? "Music" : "VolumeX"} size={16} />
            </button>
          )}
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center">
            <Icon name="X" size={18} />
          </button>
        </div>
      </div>

      {/* Прогресс */}
      <div className="px-5 pt-3">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${song.color} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
}