import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function OlympiadBanner() {
  return (
    <section className="px-4 py-6 md:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-purple-700/40 via-purple-900/30 to-cyan-700/30">
          {/* Glow accents */}
          <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-9">
            {/* Left: text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 rounded-full px-3 py-1 mb-3">
                <span className="text-base">🏆</span>
                <span className="text-amber-200 text-xs font-black uppercase tracking-wider">Мини-олимпиада</span>
              </div>

              <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white leading-tight mb-2">
                Пройди олимпиаду —{" "}
                <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                  выиграй 5000 ЗНАЕК
                </span>
              </h2>

              <p className="text-white/75 text-sm md:text-base max-w-xl mb-5 mx-auto md:mx-0">
                7 задач по нарастающей сложности и личный тренер, который зовёт тебя по имени.
                За каждый верный ответ — ЗНАЙКИ, за идеальное прохождение — главный приз!
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Link
                  to="/olympiad"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-6 py-3 rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/20"
                >
                  <Icon name="Rocket" size={18} />
                  Участвовать
                </Link>
                <span className="inline-flex items-center gap-1.5 text-white/60 text-xs md:text-sm px-2">
                  <Icon name="Users" size={14} />
                  Соревнуйся в таблице лидеров
                </span>
              </div>
            </div>

            {/* Right: prize chip */}
            <div className="flex-shrink-0">
              <div className="relative bg-white/[0.06] border border-amber-400/30 rounded-2xl px-7 py-5 text-center backdrop-blur-sm">
                <div className="text-4xl mb-1">💎</div>
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent tabular-nums">
                  5000
                </div>
                <div className="text-amber-200/80 text-xs font-bold uppercase tracking-wider">ЗНАЕК</div>
                <div className="text-white/45 text-[11px] mt-1">главный приз</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
