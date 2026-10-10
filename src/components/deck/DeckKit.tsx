import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

/** Слайд рисуется на холсте 1280×720 и масштабируется целиком под экран и печать. */
export const W = 1280;
export const H = 720;
export const NAVY = "#0f1f3d";
export const BLUE = "#1d4ed8";

export interface SlideCtx {
  n: number;
  print: boolean;
}
export type Slide = (ctx: SlideCtx) => ReactNode;

const DeckInfo = createContext<{ total: number; footer: string }>({ total: 0, footer: "" });

export function Frame({ n, section, children }: { n: number; section: string; children: ReactNode }) {
  const { total, footer } = useContext(DeckInfo);
  return (
    <div className="relative bg-white text-slate-800 font-golos overflow-hidden" style={{ width: W, height: H }}>
      <div className="absolute left-0 top-0 h-full w-[10px]" style={{ background: BLUE }} />
      <div className="absolute top-0 left-[10px] right-0 flex items-center justify-between px-16 pt-9">
        <span className="text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>{section}</span>
        <span className="font-montserrat font-black text-[15px] tracking-wide" style={{ color: NAVY }}>УЧИСЬПРО</span>
      </div>
      <div className="absolute inset-0 left-[10px] px-16 pt-[88px] pb-[64px]">{children}</div>
      <div className="absolute bottom-0 left-[10px] right-0 flex items-center justify-between px-16 pb-7 text-[12px] text-slate-400">
        <span>{footer}</span>
        <span className="tabular-nums">{String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

export function H2({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-montserrat font-extrabold text-[40px] leading-[1.12]" style={{ color: NAVY }}>{children}</h2>
      {sub && <p className="mt-3 text-[19px] text-slate-500 max-w-[960px]">{sub}</p>}
    </div>
  );
}

export function Point({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50" style={{ color: BLUE }}>
        <Icon name={icon} fallback="Circle" size={27} />
      </div>
      <div>
        <p className="font-bold text-[22px] leading-snug" style={{ color: NAVY }}>{title}</p>
        <p className="text-[18px] text-slate-500 leading-relaxed mt-1.5">{text}</p>
      </div>
    </div>
  );
}

export function Card({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 p-7 flex flex-col">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-5" style={{ background: BLUE }}>
        <Icon name={icon} fallback="Circle" size={24} />
      </div>
      <p className="font-montserrat font-extrabold text-[23px] mb-4" style={{ color: NAVY }}>{title}</p>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-2.5 text-[17px] text-slate-600 leading-snug">
            <Icon name="Check" size={18} className="flex-shrink-0 mt-0.5" style={{ color: BLUE }} />{it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stat({ icon, fallback = "Circle", big, small }: { icon: string; fallback?: string; big: string; small: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-6 flex flex-col justify-center">
      <Icon name={icon} fallback={fallback} size={24} style={{ color: BLUE }} />
      <p className="font-montserrat font-extrabold text-[32px] mt-3 leading-none" style={{ color: NAVY }}>{big}</p>
      <p className="text-[15px] text-slate-500 mt-2">{small}</p>
    </div>
  );
}

export function QA({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-x-14 gap-y-10 mt-8">
      {items.map(([q, a]) => (
        <div key={q} className="border-l-4 pl-6 py-1" style={{ borderColor: BLUE }}>
          <p className="font-bold text-[22px] mb-2.5" style={{ color: NAVY }}>{q}</p>
          <p className="text-[18px] text-slate-600 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  );
}

export function Steps({ items }: { items: [string, string][] }) {
  return (
    <div className={`grid gap-6 mb-8`} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map(([who, what], i) => (
        <div key={who} className="relative rounded-xl border border-slate-200 p-7 pt-9">
          <span className="absolute -top-5 left-7 w-10 h-10 rounded-full flex items-center justify-center font-montserrat font-black text-white text-[18px]" style={{ background: BLUE }}>{i + 1}</span>
          <p className="font-bold text-[20px] mb-2" style={{ color: NAVY }}>{who}</p>
          <p className="text-[16.5px] text-slate-600 leading-relaxed">{what}</p>
        </div>
      ))}
    </div>
  );
}

export function Note({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 px-8 py-5 flex items-center gap-4">
      <Icon name={icon} fallback="Info" size={26} style={{ color: BLUE }} className="flex-shrink-0" />
      <p className="text-[17px] text-slate-700">{children}</p>
    </div>
  );
}

/** Обложка: слева тёмная панель с заголовком, справа фото с плашкой. */
export function Cover({
  print, kicker, title, lead, img, imgAlt, badgeTitle, badgeText, bottom,
}: {
  print: boolean; kicker: string; title: string; lead: string; img: string; imgAlt: string;
  badgeTitle: string; badgeText: string; bottom: string[];
}) {
  const Title = print ? "p" : "h1";
  return (
    <div className="relative bg-white font-golos overflow-hidden flex" style={{ width: W, height: H }}>
      <div className="w-[60%] h-full flex flex-col justify-between px-16 py-14 text-white" style={{ background: NAVY }}>
        <span className="font-montserrat font-black text-[20px] tracking-wide">УЧИСЬПРО</span>
        <div>
          <p className="text-[14px] font-bold uppercase tracking-[0.22em] text-blue-300 mb-5">{kicker}</p>
          <Title className="font-montserrat font-extrabold text-[48px] leading-[1.08] mb-6">{title}</Title>
          <p className="text-[20px] text-slate-300 leading-relaxed max-w-[640px]">{lead}</p>
        </div>
        <div className="flex items-center gap-8 text-[14px] text-slate-400">
          {bottom.map((b) => <span key={b}>{b}</span>)}
        </div>
      </div>
      <div className="w-[40%] h-full relative">
        <img src={img} alt={imgAlt} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute bottom-10 left-0 right-10 bg-white px-7 py-5 shadow-xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em]" style={{ color: BLUE }}>{badgeTitle}</p>
          <p className="font-montserrat font-extrabold text-[22px] leading-tight mt-1" style={{ color: NAVY }}>{badgeText}</p>
        </div>
      </div>
    </div>
  );
}

/** Финальный слайд с призывом к действию и адресом. */
export function Final({
  title, steps, cardTitle, cardUrl, cardNote, thanks,
}: {
  title: string; steps: string[]; cardTitle: string; cardUrl: string; cardNote: ReactNode; thanks: string;
}) {
  return (
    <div className="relative font-golos overflow-hidden text-white flex flex-col justify-between px-16 py-14" style={{ width: W, height: H, background: NAVY }}>
      <span className="font-montserrat font-black text-[20px] tracking-wide">УЧИСЬПРО</span>
      <div className="grid grid-cols-[1.25fr_1fr] gap-14 items-center">
        <div>
          <p className="text-[14px] font-bold uppercase tracking-[0.22em] text-blue-300 mb-5">Следующий шаг</p>
          <h2 className="font-montserrat font-extrabold text-[46px] leading-[1.1] mb-8">{title}</h2>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-4 text-[20px] text-slate-200">
                <span className="w-9 h-9 rounded-full bg-white/10 border border-white/25 flex items-center justify-center font-bold text-[16px] flex-shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-white rounded-xl p-9 text-center" style={{ color: NAVY }}>
          <p className="text-[14px] font-bold uppercase tracking-[0.18em]" style={{ color: BLUE }}>{cardTitle}</p>
          <p className="font-montserrat font-extrabold text-[32px] mt-3 mb-5 break-words">{cardUrl}</p>
          <div className="h-px bg-slate-200 mb-5" />
          <div className="text-[16px] text-slate-600 leading-relaxed">{cardNote}</div>
        </div>
      </div>
      <p className="text-[15px] text-slate-400">{thanks}</p>
    </div>
  );
}

interface ShellProps {
  slides: Slide[];
  footer: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  crumbs: { label: string; href?: string }[];
}

/**
 * Оболочка презентации: навигация стрелками/свайпом, полноэкранный режим,
 * печать в PDF по одному слайду на страницу 16:9.
 */
export function DeckShell({ slides, footer, seoTitle, seoDescription, canonicalPath, crumbs }: ShellProps) {
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

  return (
    <DeckInfo.Provider value={{ total, footer }}>
      <div className="h-screen flex flex-col bg-slate-200 text-slate-800 font-golos">
        <Seo title={seoTitle} description={seoDescription} canonical={`https://учисьпро.рф${canonicalPath}`} noindex />
        <style>{`
          @media print {
            @page { size: ${W}px ${H}px; margin: 0; }
            html, body { background: #fff !important; }
            .deck-screen, .fixed { display: none !important; }
            .deck-print { display: block !important; }
            .deck-print > div { break-after: page; page-break-after: always; }
            .deck-print > div:last-child { break-after: auto; page-break-after: auto; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>

        <div className="deck-screen flex flex-col h-full">
          <header className="flex items-center justify-between gap-3 px-4 md:px-6 h-14 bg-white border-b border-slate-300 flex-shrink-0">
            <nav aria-label="Хлебные крошки" className="text-sm min-w-0">
              <ol className="flex items-center gap-1.5 text-slate-500 truncate">
                {crumbs.map((c, k) => {
                  const last = k === crumbs.length - 1;
                  return (
                    <li key={c.label} className={`flex items-center gap-1.5 ${last ? "hidden md:flex" : ""}`}>
                      {k > 0 && <Icon name="ChevronRight" size={13} className="text-slate-300" />}
                      {c.href && !last ? (
                        <Link to={c.href} className="hover:text-slate-900">{c.label}</Link>
                      ) : (
                        <span className="text-slate-800 font-medium">{c.label}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
            <div className="flex items-center gap-2 flex-shrink-0">
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
                {slides[i]({ n: i + 1, print: false })}
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
                  className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-blue-700" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
                />
              ))}
              <span className="ml-3 text-slate-500 text-xs tabular-nums">{i + 1} / {total}</span>
            </div>
            <button onClick={() => go(1)} disabled={i === total - 1} className="inline-flex items-center gap-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white px-3 md:px-4 py-2 text-sm font-semibold disabled:opacity-30">
              <span className="hidden sm:inline">Далее</span> <Icon name="ChevronRight" size={18} />
            </button>
          </footer>
        </div>

        <div className="deck-print hidden">
          {slides.map((render, n) => (
            <div key={n} style={{ width: W, height: H }}>{render({ n: n + 1, print: true })}</div>
          ))}
        </div>
      </div>
    </DeckInfo.Provider>
  );
}
