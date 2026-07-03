import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  screenTime: {
    dailyLimit: number;
    minutesUsed: number;
    remaining: number;
  };
  onOpenSettings: () => void;
  breadcrumbs?: Crumb[];
}

const DEFAULT_CRUMBS: Crumb[] = [{ label: "Главная", href: "/" }, { label: "Малыш" }];

export default function KidsTopBar({ screenTime, onOpenSettings, breadcrumbs }: Props) {
  const crumbs = breadcrumbs ?? DEFAULT_CRUMBS;
  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: (i % 3) + 1 + "px",
                 height: (i % 3) + 1 + "px",
                 left: ((i * 137.5) % 100) + "%",
                 top: ((i * 97.3) % 100) + "%",
                 opacity: 0.1 + (i % 4) * 0.06,
               }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={crumbs} />
          </div>
          <div className="flex items-center gap-2">
            {/* Индикатор экранного времени */}
            {screenTime.dailyLimit > 0 && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
                title="Сегодняшнее экранное время"
              >
                <Icon name="Timer" size={13} className={screenTime.remaining > 0 ? "text-emerald-300" : "text-rose-300"} />
                <span className="text-white/75 text-xs font-bold tabular-nums">
                  {screenTime.minutesUsed}/{screenTime.dailyLimit} мин
                </span>
              </div>
            )}
            {/* Настройки родителя — требует PIN */}
            <button
              onClick={onOpenSettings}
              aria-label="Настройки родителя"
              title="Настройки родителя (PIN)"
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <Icon name="ShieldCheck" size={16} />
            </button>
            <Link
              to="/kids"
              className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Icon name="Sparkles" size={14} />
              Малыш
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}