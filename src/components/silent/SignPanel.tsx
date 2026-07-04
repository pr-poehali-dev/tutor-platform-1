import { useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { SignEntry } from "@/components/silent/signLibrary";

interface Props {
  sign: SignEntry;
}

/** Панель жеста РЖЯ под субтитром. Жест ВСТРОЕН в курс: показывает своё видео
 *  (если записано) либо анимированную иллюстрацию руки. Ничего искать не нужно. */
export default function SignPanel({ sign }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Встроенный жест: видео (если есть) или анимированная иллюстрация */}
        <div className="w-40 h-40 flex-shrink-0 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
          {sign.videoUrl ? (
            <video
              ref={videoRef}
              src={sign.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={sign.image}
              alt={`Жест «${sign.word}» на русском жестовом языке`}
              className={`w-full h-full object-cover sign-motion-${sign.motion}`}
              loading="lazy"
            />
          )}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-white/85 text-base leading-relaxed mb-3">
            {sign.description}
          </p>
          <a
            href={sign.dictionaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-200/80 hover:text-cyan-100 text-xs font-semibold transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Проверить у носителя языка
          </a>
        </div>
      </div>
    </div>
  );
}