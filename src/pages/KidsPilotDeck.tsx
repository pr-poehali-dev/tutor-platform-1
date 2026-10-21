import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { buildSlides, DeckMode, H, W } from "@/components/kidsPilot/deckSlides";
import { CARE_PATH, KIDS_PILOT_PATH } from "@/data/kidsPilot";

/**
 * Презентация «Проект Малыш»: для детских садов (промокод МАЛЫШ)
 * и для детских домов и интернатов (бессрочно). Холст 1280×720, PDF — печатью.
 */
export default function KidsPilotDeck({ mode = "kindergarten" }: { mode?: DeckMode }) {
  const slides = useMemo(() => buildSlides(mode), [mode]);
  const total = slides.length;
  const [i, setI] = useState(0);
  const go = useCallback((d: number) => setI((v) => Math.min(total - 1, Math.max(0, v + d))), [total]);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [touchX, setTouchX] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min((r.width - 32) / W, (r.height - 32) / H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  const care = mode === "care";

  return (
    <div className="h-screen flex flex-col bg-slate-200 text-slate-800 font-golos">
      <Seo
        title={care ? "Презентация «Каждый ребёнок» для детских домов и интернатов" : "Презентация «Проект Малыш» для детских садов"}
        description={care
          ? "Бесплатный и бессрочный доступ к развивающим занятиям и школьным курсам УЧИСЬПРО для детских домов, интернатов и центров семейного устройства."
          : "Пилотный проект УЧИСЬПРО для детских садов: раздел «Малыш» бесплатно для семей воспитанников до 31.05.2027 по промокоду МАЛЫШ."}
        canonical={`https://учисьпро.рф/for-kindergartens/presentation${care ? "/care" : ""}`}
        noindex
      />
      <style>{`
        @media print {
          @page { size: ${W}px ${H}px; margin: 0; }
          html, body { background: #fff !important; }
          .deck-screen { display: none !important; }
          .deck-print { display: block !important; }
          .deck-print > div { break-after: page; page-break-after: always; }
          .deck-print > div:last-child { break-after: auto; page-break-after: auto; }
          .fixed { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="deck-screen flex flex-col h-full">
        <header className="flex items-center justify-between px-4 md:px-6 h-14 bg-white border-b border-slate-300 flex-shrink-0">
          <nav aria-label="Хлебные крошки" className="text-sm min-w-0">
            <ol className="flex items-center gap-1.5 text-slate-500 truncate">
              <li><Link to="/" className="hover:text-slate-900">Главная</Link></li>
              <li aria-hidden><Icon name="ChevronRight" size={13} className="text-slate-300" /></li>
              <li><Link to="/kids" className="hover:text-slate-900">Малыш</Link></li>
              <li aria-hidden className="hidden md:block"><Icon name="ChevronRight" size={13} className="text-slate-300" /></li>
              <li className="hidden md:block text-slate-800 font-medium">{care ? "Для детских домов" : "Для детских садов"}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-2">
            <Link to={care ? CARE_PATH : KIDS_PILOT_PATH} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
              <Icon name="Ticket" size={15} /> <span className="hidden sm:inline">Активация</span>
            </Link>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
              <Icon name="Download" size={15} /> PDF
            </button>
            <button onClick={fullscreen} className="inline-flex items-center rounded-md border border-slate-300 bg-white hover:bg-slate-50 p-2 text-slate-700" aria-label="На весь экран">
              <Icon name="Maximize" size={15} />
            </button>
          </div>
        </header>

        <main
          ref={stageRef}
          className="flex-1 min-h-0 flex items-center justify-center overflow-hidden"
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <div key={i} style={{ width: W * scale, height: H * scale }} className="animate-fade-in shadow-2xl shadow-slate-500/30 overflow-hidden">
            <div className="origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
              {slides[i](i + 1, total)}
            </div>
          </div>
        </main>

        <footer className="flex items-center justify-between gap-3 px-4 md:px-6 h-16 bg-white border-t border-slate-300 flex-shrink-0">
          <button onClick={() => go(-1)} disabled={i === 0} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 md:px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30">
            <Icon name="ChevronLeft" size={18} /> <span className="hidden sm:inline">Назад</span>
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((_, n) => (
              <button
                key={n}
                onClick={() => setI(n)}
                aria-label={`Слайд ${n + 1}`}
                className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-pink-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
            <span className="ml-3 text-slate-500 text-xs tabular-nums">{i + 1} / {total}</span>
          </div>
          <button onClick={() => go(1)} disabled={i === total - 1} className="inline-flex items-center gap-1 rounded-md bg-pink-600 hover:bg-pink-700 text-white px-3 md:px-4 py-2 text-sm font-semibold disabled:opacity-30">
            <span className="hidden sm:inline">Далее</span> <Icon name="ChevronRight" size={18} />
          </button>
        </footer>
      </div>

      <div className="deck-print hidden">
        {slides.map((render, n) => (
          <div key={n} style={{ width: W, height: H }}>{render(n + 1, total, true)}</div>
        ))}
      </div>
    </div>
  );
}
