import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";
import ZnaikaBadge from "@/components/znaika/ZnaikaBadge";
import MobileMenu from "@/components/nav/MobileMenu";
import DirectionSwitch from "@/components/nav/DirectionSwitch";
import { DIRECTION_MENU, MenuLink } from "@/components/nav/navData";
import { useDirection } from "@/hooks/useDirection";
import { DIRECTIONS } from "@/lib/directions";

interface NavbarProps {
  activeSection?: string;
  mobileMenuOpen: boolean;
  onScrollTo?: (section: string) => void;
  onToggleMobile: () => void;
}

/**
 * Шапка сайта. Слева — логотип, по центру — переключатель направлений
 * и меню текущего направления (не больше 5 пунктов), справа — вход.
 * Пока направление не выбрано, меню не показываем: на главной
 * человек выбирает «дверь».
 */
export default function Navbar({ mobileMenuOpen, onScrollTo, onToggleMobile }: NavbarProps) {
  const { isAuthenticated, openLogin } = useAuth();
  const { active } = useDirection();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollTo = (section: string) => {
    if (location.pathname === "/" && onScrollTo) onScrollTo(section);
    else navigate(`/?section=${section}`);
  };

  const handleItemClick = (item: MenuLink) => {
    setMenuOpen(false);
    if (item.section) handleScrollTo(item.section);
    else if (item.path) navigate(item.path);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const items = active ? DIRECTION_MENU[active] : [];
  const meta = active ? DIRECTIONS[active] : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[120] px-3 py-2.5" aria-label="Главная навигация">
      <div className="max-w-[1400px] mx-auto">
        <div className="backdrop-blur-xl bg-[#0d0a1f]/80 border border-white/10 rounded-2xl pl-3 pr-2 md:pl-4 md:pr-3 py-2 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" aria-label="УЧИСЬПРО — на главную">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base" aria-hidden="true">
              🚀
            </div>
            <span className="font-montserrat font-black text-base lg:text-lg gradient-text-purple tracking-wide hidden sm:inline md:hidden xl:inline">
              УЧИСЬПРО
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 flex-1 justify-center min-w-0" ref={menuRef}>
            <DirectionSwitch active={active} />

            {items.length > 0 && meta && (
              <>
                <span className="w-px h-5 bg-white/10 mx-1 flex-shrink-0" aria-hidden="true" />
                {/* На xl все пункты видны сразу, на md/lg — в выпадающем меню */}
                <div className="hidden xl:flex items-center gap-0.5">
                  {items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path!}
                      className={`px-2.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                        location.pathname === item.path?.split("?")[0]
                          ? `${meta.text} bg-white/8`
                          : "text-white/70 hover:text-white hover:bg-white/8"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="relative xl:hidden">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-expanded={menuOpen}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                      menuOpen ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <Icon name="LayoutGrid" size={14} aria-hidden="true" />
                    Разделы
                    <Icon name="ChevronDown" size={12} aria-hidden="true" className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {menuOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 backdrop-blur-xl bg-[#1a1530]/95 border border-white/10 rounded-2xl p-2 shadow-2xl animate-fade-in z-50">
                      {items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleItemClick(item)}
                          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/10 transition-all group"
                        >
                          <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Icon name={item.icon} size={16} className={meta.text} aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white/90">{item.label}</span>
                            {item.desc && <span className="block text-xs text-white/45 truncate">{item.desc}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <Link
              to="/search"
              aria-label="Поиск по сайту"
              title="Поиск по сайту"
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
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs lg:text-sm font-semibold px-2.5 lg:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Icon name="User" size={14} aria-hidden="true" />
                <span className="hidden lg:inline">Кабинет</span>
              </Link>
            ) : (
              <button
                onClick={openLogin}
                aria-label="Войти в аккаунт"
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs lg:text-sm font-semibold px-3 lg:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Войти
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {isAuthenticated && <ZnaikaBadge />}
            <Link to="/search" aria-label="Поиск по сайту" className="text-white/70 hover:text-white p-2">
              <Icon name="Search" size={20} aria-hidden="true" />
            </Link>
            <button
              className="text-white/70 hover:text-white p-1"
              onClick={onToggleMobile}
              aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        <MobileMenu open={mobileMenuOpen} onClose={onToggleMobile} onSectionClick={handleScrollTo} />
      </div>
    </nav>
  );
}
