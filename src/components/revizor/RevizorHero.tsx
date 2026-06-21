import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { COVER, SECTIONS } from "./revizorData";

interface RevizorHeroProps {
  progress: number;
  active: string;
  tocOpen: boolean;
  setTocOpen: React.Dispatch<React.SetStateAction<boolean>>;
  scrollTo: (id: string) => void;
}

export default function RevizorHero({ progress, active, tocOpen, setTocOpen, scrollTo }: RevizorHeroProps) {
  return (
    <>
      {/* Прогресс чтения */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-rose-500 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0b1020]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-lg">📖</div>
            <span className="font-montserrat font-black text-base group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            <Icon name="ArrowLeft" size={12} />
            В ленту
          </Link>
        </div>
      </div>

      {/* HERO */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <img src={COVER} alt="Ревизор. Гоголь" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020]/60 via-[#0b1020]/85 to-[#0b1020]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-12 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            <Icon name="Crown" size={14} />
            Эталонный разбор
          </div>
          <p className="text-amber-300/90 font-montserrat font-bold tracking-wider uppercase text-sm mb-3">Н. В. Гоголь</p>
          <h1 className="font-montserrat font-black text-5xl md:text-7xl leading-[0.95] mb-5">
            <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-rose-300 bg-clip-text text-transparent">Ревизор</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Комедия в пяти действиях, в которой целый город сошёл с ума от страха. Полный разбор: от первой реплики до знаменитой немой сцены.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {[
              { icon: "Clock", label: "18 мин чтения" },
              { icon: "Layers", label: "10 разделов" },
              { icon: "GraduationCap", label: "Готовит к ЕГЭ и ОГЭ" },
            ].map((b) => (
              <span key={b.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/75">
                <Icon name={b.icon} size={15} className="text-amber-300" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Мобильное оглавление */}
      <div className="lg:hidden sticky top-[57px] z-30 bg-[#0b1020]/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => setTocOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-white/80"
        >
          <span className="flex items-center gap-2">
            <Icon name="List" size={16} className="text-amber-300" />
            Содержание
          </span>
          <Icon name={tocOpen ? "ChevronUp" : "ChevronDown"} size={16} />
        </button>
        {tocOpen && (
          <div className="px-3 pb-3 grid grid-cols-1 gap-1">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm text-white/70 hover:bg-white/5"
              >
                <span className="text-amber-300/70 font-mono text-xs w-5">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function RevizorSidebar({ active, scrollTo }: { active: string; scrollTo: (id: string) => void }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 px-3">Содержание</div>
        <nav className="space-y-1">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                active === s.id
                  ? "bg-amber-400/10 text-amber-200 border-l-2 border-amber-400"
                  : "text-white/55 hover:text-white/90 hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <span className="font-mono text-[11px] opacity-60 w-5">{String(i + 1).padStart(2, "0")}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
