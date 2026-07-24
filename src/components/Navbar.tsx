import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";
import ZnaikaBadge from "@/components/znaika/ZnaikaBadge";

// Главные разделы — всегда в строке
const NAV_LINKS = [
  { label: "Репетитор", short: "Репет", icon: "GraduationCap", path: "/tutor" },
  { label: "Курсы",     short: "Курсы", icon: "Library",       path: "/courses" },
  { label: "Лента",     short: "Лента", icon: "Newspaper",     path: "/feed" },
];

interface MenuLink {
  label: string;
  icon: string;
  path?: string;
  section?: string;
  desc?: string;
}
interface MenuGroup {
  label: string;
  icon: string;
  items: MenuLink[];
}

// Тематические выпадающие меню — компактно и понятно
const MENU_GROUPS: MenuGroup[] = [
  {
    label: "Обучение",
    icon: "GraduationCap",
    items: [
      { label: "ИИ-учитель", icon: "Bot",        section: "ai-teacher", desc: "Персональный ИИ-репетитор 24/7" },
      { label: "ОГЭ и ЕГЭ",  icon: "BookMarked", path: "/exam-bank",    desc: "Банк заданий и подготовка к экзаменам" },
      { label: "Домашка",    icon: "Camera",     path: "/homework",     desc: "Проверка домашних заданий по фото" },
      { label: "Олимпиада",  icon: "Trophy",     path: "/olympiad",     desc: "Подготовка к олимпиадам" },
      { label: "Выпускник",  icon: "Award",      path: "/graduate",     desc: "Помощь одиннадцатиклассникам" },
      { label: "Малыш 1+",   icon: "Baby",       path: "/kids",         desc: "Развитие малышей от 1 года" },
      { label: "Рисовашка",  icon: "Palette",    path: "/draw",         desc: "Рисование для детей" },
      { label: "Для глухих детей", icon: "Hand", path: "/silent",       desc: "Обучение без звука" },
    ],
  },
  {
    label: "Карьера и ИИ",
    icon: "Rocket",
    items: [
      { label: "Профориентация PRO",  icon: "Fingerprint", path: "/career-pro",       desc: "Индивидуальный курс под вас · ИИ" },
      { label: "Бизнес-тренер и коуч", icon: "TrendingUp", path: "/business-coach",   desc: "Стратегия роста бизнеса · ИИ" },
      { label: "Бизнес и MBA",        icon: "Briefcase", path: "/courses/business", desc: "Запуск продукта и онлайн-школы" },
      { label: "Продажи B2B",         icon: "Handshake", path: "/courses/sales",    desc: "Обучение отделов продаж" },
      { label: "Промпт-инженер",      icon: "Sparkles",  path: "/courses/prompteng", desc: "Профессия будущего с нуля" },
      { label: "Удалённые профессии", icon: "Laptop",    path: "/remote-professions", desc: "Работа из дома" },
      { label: "Тренды IT",           icon: "Cpu",       path: "/tech-trends",      desc: "ИИ-аналитика IT-направлений" },
      { label: "Автоматизация",       icon: "Workflow",  path: "/intensive",        desc: "Интенсив по автоматизации" },
      { label: "Для бизнеса",         icon: "Building2",  path: "/for-business",     desc: "Конструктор онлайн-школ" },
      { label: "Корпоративное обучение", icon: "Users",  path: "/corporate",        desc: "Обучение сотрудников линейке" },
    ],
  },
  {
    label: "Психология",
    icon: "HeartHandshake",
    items: [
      { label: "Психологу",           icon: "HeartHandshake", path: "/psychology",           desc: "Поддержка и помощь онлайн" },
      { label: "Познай себя",         icon: "Compass",        path: "/know-yourself",        desc: "Тесты и самопознание" },
      { label: "Профессия психолога", icon: "Brain",          path: "/klinicheskiy-psiholog", desc: "Клиническая психология" },
      { label: "Курс НЛП-практик",    icon: "Sparkles",       path: "/nlp-master",           desc: "НЛП с нуля до практики" },
    ],
  },
];

// Плоский список для мобильного меню и партнёрка
const PARTNERS_LINK = { label: "Партнёрам", icon: "Handshake", path: "/partners" };

interface NavbarProps {
  activeSection: string;
  mobileMenuOpen: boolean;
  onScrollTo: (section: string) => void;
  onToggleMobile: () => void;
}

export default function Navbar({ mobileMenuOpen, onScrollTo, onToggleMobile }: NavbarProps) {
  const { isAuthenticated, openLogin } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Якоря "ИИ-учитель"/"Рейтинг" есть только на главной.
  // Если мы на другой странице — уводим на главную к нужной секции.
  const handleScrollTo = (section: string) => {
    if (location.pathname === "/") {
      onScrollTo(section);
    } else {
      navigate(`/?section=${section}`);
    }
  };

  const handleItemClick = (item: MenuLink) => {
    setOpenGroup(null);
    if (item.section) handleScrollTo(item.section);
    else if (item.path) navigate(item.path);
  };

  useEffect(() => {
    if (!openGroup) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openGroup]);

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
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center min-w-0 flex-nowrap" ref={menuRef}>
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

            <span className="w-px h-5 bg-white/10 mx-1 flex-shrink-0" aria-hidden="true" />

            {/* Тематические выпадающие меню */}
            {MENU_GROUPS.map((group) => {
              const isOpen = openGroup === group.label;
              return (
                <div key={group.label} className="relative flex-shrink-0">
                  <button
                    onClick={() => setOpenGroup(isOpen ? null : group.label)}
                    aria-label={group.label}
                    aria-expanded={isOpen}
                    title={group.label}
                    className={`flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 rounded-lg text-xs lg:text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                      isOpen ? "bg-white/10 text-white" : "text-white/65 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <Icon name={group.icon} size={14} aria-hidden="true" />
                    <span className="hidden lg:inline">{group.label}</span>
                    <Icon name="ChevronDown" size={12} aria-hidden="true" className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-72 max-h-[75vh] overflow-y-auto overscroll-contain backdrop-blur-xl bg-[#1a1530]/95 border border-white/10 rounded-2xl p-2 shadow-2xl animate-fade-in z-50">
                      {group.items.map((item) => (
                        <button
                          key={item.path || item.section}
                          onClick={() => handleItemClick(item)}
                          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/10 transition-all group"
                        >
                          <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
                            <Icon name={item.icon} size={16} className="text-purple-300" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white/90 group-hover:text-white">{item.label}</span>
                            {item.desc && <span className="block text-xs text-white/45 truncate">{item.desc}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
                  to="/courses"
                  aria-label="Все курсы"
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs lg:text-sm font-semibold px-3 lg:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity glow-purple"
                >
                  Все курсы
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
            className="mt-2 max-h-[80vh] overflow-y-auto overscroll-contain backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 animate-fade-in"
          >
            {/* Главные разделы */}
            <div className="grid grid-cols-3 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onToggleMobile}
                  aria-label={`Открыть страницу: ${link.label}`}
                  className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-xs font-semibold text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 transition-all border border-purple-500/25"
                >
                  <Icon name={link.icon} size={20} aria-hidden="true" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Тематические группы */}
            {MENU_GROUPS.map((group) => (
              <div key={group.label} className="mt-1">
                <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                  <Icon name={group.icon} size={13} aria-hidden="true" />
                  {group.label}
                </div>
                {group.items.map((item) =>
                  item.section ? (
                    <button
                      key={item.section}
                      onClick={() => { onToggleMobile(); handleScrollTo(item.section!); }}
                      aria-label={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-all"
                    >
                      <Icon name={item.icon} size={18} aria-hidden="true" />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path!}
                      onClick={onToggleMobile}
                      aria-label={`Открыть страницу: ${item.label}`}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-all"
                    >
                      <Icon name={item.icon} size={18} aria-hidden="true" />
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            ))}

            <Link
              to={PARTNERS_LINK.path}
              onClick={onToggleMobile}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 transition-all"
            >
              <Icon name={PARTNERS_LINK.icon} size={18} aria-hidden="true" />
              {PARTNERS_LINK.label}
            </Link>

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
                    to="/courses"
                    aria-label="Все курсы"
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl text-center"
                  >
                    Все курсы
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