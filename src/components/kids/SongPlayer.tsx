import { Song } from "./songsData";
import { useSongPlayerAudio } from "./songPlayerAudio";
import SongPlayerHeader from "./SongPlayerHeader";
import SongPlayerLyrics from "./SongPlayerLyrics";
import SongPlayerControls from "./SongPlayerControls";

interface Props {
  song: Song;
  onClose: () => void;
  onFinish?: () => void;
}

/** Плеер песенки — Няня Лиса поёт нараспев под фоновую инструменталку.
 *  Архитектура:
 *  - voice-audio: TTS Лисы (Yandex SpeechKit, voice=alena, emotion=good, sing=true)
 *    Каждая строка озвучивается с замедлением и растягиванием гласных → эффект пения
 *  - music-audio: фоновая мелодия из MELODY_TRACKS, играет в цикле на 18-25% громкости,
 *    стиль выбирается по жанру песни (народная гармошка / поп / колыбельная)
 *  - Микширование: оба <audio> играют параллельно, голос поверх музыки
 *  Логика вынесена в хук useSongPlayerAudio, UI разбит на Header/Lyrics/Controls. */
export default function SongPlayer({ song, onClose, onFinish }: Props) {
  const {
    isPlaying,
    currentLine,
    progress,
    loading,
    usingFallback,
    musicEnabled,
    setMusicEnabled,
    singSpeed,
    melody,
    hasRealAudio,
    play,
    pause,
    restart,
  } = useSongPlayerAudio(song, onFinish);

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-white/15 rounded-3xl max-w-2xl w-full my-8 overflow-hidden">
        <SongPlayerHeader
          song={song}
          hasRealAudio={hasRealAudio}
          usingFallback={usingFallback}
          melody={melody}
          singSpeed={singSpeed}
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          progress={progress}
          onClose={onClose}
        />

        <SongPlayerLyrics song={song} currentLine={currentLine} loading={loading} />

        <SongPlayerControls
          song={song}
          isPlaying={isPlaying}
          loading={loading}
          onRestart={restart}
          onPlay={play}
          onPause={pause}
        />
      </div>
    </div>
  );
}
