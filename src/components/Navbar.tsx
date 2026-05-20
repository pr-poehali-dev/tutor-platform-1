import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const NAV_ITEMS = [
  { label: "Маршрут", icon: "Compass", section: "journey" },
  { label: "ИИ-учитель", icon: "Bot", section: "ai-teacher" },
  { label: "Каталог", icon: "Library", section: "library" },
  { label: "Прогресс", icon: "TrendingUp", section: "progress" },
  { label: "Рейтинг", icon: "BarChart2", section: "leaderboard" },
];

const NAV_LINKS = [
  { label: "Тарифы", icon: "Sparkles", path: "/pricing" },
];

interface NavbarProps {
  activeSection: string;
  mobileMenuOpen: boolean;
  onScrollTo: (section: string) => void;
  onToggleMobile: () => void;
}

export default function Navbar({ activeSection, mobileMenuOpen, onScrollTo, onToggleMobile }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg animate-pulse-glow">
              🚀
            </div>
            <span className="font-montserrat font-black text-lg gradient-text-purple">УчисьПро</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.section}
                onClick={() => onScrollTo(item.section)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSection === item.section
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </button>
            ))}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-purple-300 hover:text-white hover:bg-purple-500/15 transition-all duration-200 border border-purple-500/25"
              >
                <Icon name={link.icon} size={15} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2">
              Войти
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity glow-purple">
              Начать бесплатно
            </button>
          </div>

          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={onToggleMobile}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mt-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 animate-fade-in">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.section}
                onClick={() => onScrollTo(item.section)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-all"
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            ))}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-purple-300 hover:bg-purple-500/15 transition-all border border-purple-500/25"
              >
                <Icon name={link.icon} size={18} />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2">
              <button className="text-sm text-white/70 py-2">Войти</button>
              <button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl">
                Начать бесплатно
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}