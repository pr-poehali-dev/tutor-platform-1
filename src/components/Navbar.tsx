import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";
import ZnaikaBadge from "@/components/znaika/ZnaikaBadge";

const NAV_ITEMS = [
  { label: "ИИ-учитель", short: "ИИ",       icon: "Bot",         section: "ai-teacher" },
  { label: "Рейтинг",    short: "Рейтинг",  icon: "BarChart2",   section: "leaderboard" },
];

// Главные разделы — всегда в строке
const NAV_LINKS = [
  { label: "Курсы",        short: "Курсы",   icon: "Library",        path: "/courses" },
  { label: "Лента",        short: "Лента",   icon: "Newspaper",      path: "/feed" },
  { label: "ОГЭ и ЕГЭ",    short: "ЕГЭ",     icon: "GraduationCap",  path: "/exam-bank" },
  { label: "Психологу",    short: "Психо",   icon: "HeartHandshake", path: "/psychology" },
];

// Остальные разделы — в выпадающем меню «Ещё»
const MORE_LINKS = [
  { label: "Домашка",      icon: "Camera",   path: "/homework" },
  { label: "Олимпиада",    icon: "Trophy",   path: "/olympiad" },
  { label: "Малыш 1+",     icon: "Baby",     path: "/kids" },
  { label: "Рисовашка",    icon: "Palette",  path: "/draw" },
  { label: "Познай себя",  icon: "Compass",  path: "/know-yourself" },
  { label: "Выпускник",    icon: "Award",    path: "/graduate" },
];

interface NavbarProps {
  activeSection: string;
  mobileMenuOpen: boolean;
  onScrollTo: (section: string) => void;
  onToggleMobile: () => void;
}

export default function Navbar({ activeSection, mobileMenuOpen, onScrollTo, onToggleMobile }: NavbarProps) {
  const { isAuthenticated, openLogin } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [moreOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 py-2.5" aria-label="Главная навигация">
      <div className="max-w-[1400px] mx-auto">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl pl-3 pr-2 md:pl-4 md:pr-3 py-2 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base animate-pulse-glow" aria-hidden="true">
              🚀
            </div>
            <span className="font-montserrat font-black text-base lg:text-lg gradient-text-purple tracking-wide hidden sm:inline">УЧИСЬПРО</span>
          </Link>

          {/* На md показываем только иконки, на lg — короткие подписи, на xl — полные */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center min-w-0 flex-nowrap">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.section}
                onClick={() => onScrollTo(item.section)}
                aria-label={item.label}
                title={item.label}
                aria-current={activeSection === item.section ? "page" : undefined}
                className={`flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 rounded-lg text-xs lg:text-[13px] font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap ${
                  activeSection === item.section
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-white/65 hover:text-white hover:bg-white/8"
                }`}
              >
                <Icon name={item.icon} size={14} aria-hidden="true" />
                <span className="hidden lg:inline xl:hidden">{item.short}</span>
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            ))}
            <span className="w-px h-5 bg-white/10 mx-1 flex-shrink-0" aria-hidden="true" />
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-label={link.label}
                title={link.label}
                className="flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 rounded-lg text-xs lg:text-[13px] font-medium text-purple-300 hover:text-white hover:bg-purple-500/15 transition-all duration-200 flex-shrink-0 whitespace-nowrap"
              >
                <Icon name={link.icon} size={14} aria-hidden="true" />
                <span className="hidden lg:inline xl:hidden">{link.short}</span>
                <span className="hidden xl:inline">{link.label}</span>
              </Link>
            ))}

            {/* Выпадающее меню «Ещё» */}
            <div className="relative flex-shrink-0" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                aria-label="Ещё разделы"
                aria-expanded={moreOpen}
                title="Ещё разделы"
                className={`flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 rounded-lg text-xs lg:text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                  moreOpen ? "bg-white/10 text-white" : "text-white/65 hover:text-white hover:bg-white/8"
                }`}
              >
                <Icon name="LayoutGrid" size={14} aria-hidden="true" />
                <span className="hidden lg:inline">Ещё</span>
                <Icon name="ChevronDown" size={12} aria-hidden="true" className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-2 w-52 backdrop-blur-xl bg-[#1a1530]/95 border border-white/10 rounded-2xl p-2 shadow-2xl animate-fade-in z-50">
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Icon name={link.icon} size={16} aria-hidden="true" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <Link
              to="/search"
              aria-label="Поиск по сайту (Ctrl+K)"
              title="Поиск по сайту (Ctrl+K)"
              className="flex items-center text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 p-1.5 rounded-lg transition-colors"
            >
              <Icon name="Search" size={14} aria-hidden="true" />
            </Link>
            {isAuthenticated && <ZnaikaBadge />}
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated ? (
              <Link
                to="/cabinet"
                aria-label="Открыть личный кабинет"
                title="Личный кабинет"
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs lg:text-sm font-semibold px-2.5 lg:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity glow-purple"
              >
                <Icon name="User" size={14} aria-hidden="true" />
                <span className="hidden xl:inline">Кабинет</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  aria-label="Войти в аккаунт"
                  className="text-xs lg:text-sm text-white/75 hover:text-white transition-colors px-2 py-1.5 hidden lg:inline"
                >
                  Войти
                </button>
                <Link
                  to="/pricing"
                  aria-label="Посмотреть тарифы"
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs lg:text-sm font-semibold px-3 lg:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity glow-purple"
                >
                  Тарифы
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/search"
              aria-label="Поиск по сайту"
              className="text-white/70 hover:text-white p-2"
            >
              <Icon name="Search" size={20} aria-hidden="true" />
            </Link>
            <button
              className="text-white/70 hover:text-white"
              onClick={onToggleMobile}
              aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-nav"
            className="mt-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 animate-fade-in"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.section}
                onClick={() => onScrollTo(item.section)}
                aria-label={`Перейти к разделу ${item.label}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-all"
              >
                <Icon name={item.icon} size={18} aria-hidden="true" />
                {item.label}
              </button>
            ))}
            {[...NAV_LINKS, ...MORE_LINKS].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-label={`Открыть страницу: ${link.label}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-purple-300 hover:bg-purple-500/15 transition-all border border-purple-500/25"
              >
                <Icon name={link.icon} size={18} aria-hidden="true" />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/cabinet"
                  aria-label="Открыть личный кабинет"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl text-center"
                >
                  <Icon name="User" size={16} aria-hidden="true" />
                  Личный кабинет
                </Link>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    aria-label="Войти в аккаунт"
                    className="text-sm text-white/75 py-2 border border-white/15 rounded-xl"
                  >
                    Войти
                  </button>
                  <Link
                    to="/pricing"
                    aria-label="Посмотреть тарифы"
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl text-center"
                  >
                    Тарифы
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}