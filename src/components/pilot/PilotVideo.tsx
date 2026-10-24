import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/** Короткий ролик о пилоте. Не играет сам: показываем обложку, запуск — только по нажатию. */
export default function PilotVideo({ place }: { place: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    setStarted(true);
    trackGoal("pilot_video_play", { place });
    requestAnimationFrame(() => ref.current?.play().catch(() => {}));
  };

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-xl">
      <video
        ref={ref}
        src="/video/pilot-shkola.mp4"
        poster="/video/pilot-shkola.jpg"
        preload="none"
        playsInline
        controls={started}
        className="h-full w-full object-cover"
      />
      {!started && (
        <button
          onClick={play}
          aria-label="Смотреть ролик о пилоте — 14 секунд"
          className="group absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 pb-4"
        >
          <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform group-hover:scale-105">
            <Icon name="Play" size={24} className="ml-1" />
          </span>
          <span className="text-xs font-bold text-white">Смотреть · 14 сек</span>
        </button>
      )}
    </div>
  );
}
