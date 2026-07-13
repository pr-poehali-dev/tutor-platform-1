import Icon from "@/components/ui/icon";
import { Song } from "./songsData";

interface Props {
  song: Song;
  isPlaying: boolean;
  loading: boolean;
  onRestart: () => void;
  onPlay: () => void;
  onPause: () => void;
}

/** Нижняя панель управления плеером: кнопки «сначала» и play/pause. */
export default function SongPlayerControls({
  song,
  isPlaying,
  loading,
  onRestart,
  onPlay,
  onPause,
}: Props) {
  return (
    <div className="border-t border-white/10 px-5 py-4 flex items-center justify-center gap-3">
      <button
        onClick={onRestart}
        className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 text-white/75 flex items-center justify-center"
        title="Сначала"
      >
        <Icon name="RotateCcw" size={18} />
      </button>
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={loading && !isPlaying}
        className={`w-16 h-16 rounded-full bg-gradient-to-r ${song.color} text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform disabled:opacity-60`}
      >
        {loading && !isPlaying ? (
          <Icon name="Loader2" size={26} className="animate-spin" />
        ) : (
          <Icon name={isPlaying ? "Pause" : "Play"} size={26} />
        )}
      </button>
      <div className="w-11 h-11" /> {/* spacer */}
    </div>
  );
}
