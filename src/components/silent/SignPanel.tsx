import { useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { SignEntry } from "@/components/silent/signLibrary";

interface Props {
  sign: SignEntry;
}

/** Авто-панель жеста РЖЯ под текущим субтитром. Показывает своё видео либо
 *  описание артикуляции + переход в официальный видеословарь. */
export default function SignPanel({ sign }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // При смене слова — перезапускаем видео жеста автоматически.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { /* автоплей может быть заблокирован */ });
    }
  }, [sign.word, sign.videoUrl]);

  return (
    <div className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/[0.08] to-purple-500/[0.06] p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Icon name="Hand" size={16} className="text-cyan-300" />
        </div>
        <span className="text-cyan-200 text-sm font-bold">Жест на РЖЯ: «{sign.word}»</span>
      </div>

      {sign.videoUrl ? (
        <video
          ref={videoRef}
          src={sign.videoUrl}
          className="w-full max-w-xs mx-auto rounded-xl border border-white/10 bg-black/40"
          autoPlay
          loop
          muted
          playsInline
          controls
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-full sm:w-40 flex-shrink-0 aspect-square rounded-xl bg-white/5 border border-dashed border-cyan-400/30 flex flex-col items-center justify-center text-center px-3">
            <span className="text-4xl mb-1" aria-hidden="true">🤟</span>
            <span className="text-white/50 text-xs leading-snug">
              Видео с носителем РЖЯ записывается
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/85 text-base leading-relaxed mb-3">
              {sign.description}
            </p>
            <a
              href={sign.dictionaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-100 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Icon name="Play" size={14} />
              Смотреть видео жеста
              <Icon name="ExternalLink" size={13} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
