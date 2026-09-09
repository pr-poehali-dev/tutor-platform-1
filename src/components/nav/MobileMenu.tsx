import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { NAV_LINKS, MENU_GROUPS, MenuLink } from "./navData";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onSectionClick: (section: string) => void;
}

/** Мобильное меню на весь экран: страница под ним не скроллится,
 *  группы свёрнуты — все разделы видны сразу, без длинной простыни. */
export default function MobileMenu({ open, onClose, onSectionClick }: MobileMenuProps) {
  const { isAuthenticated, openLogin } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Пока меню открыто — фон не прокручивается под пальцем.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Закрытие по Escape — привычно и помогает с клавиатуры.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleItem = (item: MenuLink) => {
    onClose();
    if (item.section) onSectionClick(item.section);
  };

  return (
    <div
      id="mobile-nav"
      className="md:hidden fixed inset-0 z-[130] bg-[#0d0a1f]/98 backdrop-blur-xl flex flex-col animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Меню разделов"
    >
      {/* Шапка меню — всегда на виду, кнопка закрытия под большим пальцем */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link to="/" onClick={onClose} className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base" aria-hidden="true">
            🚀
          </span>
          <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
        </Link>
        <button
          onClick={onClose}
          aria-label="Закрыть меню"
          className="text-white/70 hover:text-white p-2 -mr-2"
        >
          <Icon name="X" size={24} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-2">
        {/* Главные разделы */}
        <div className="grid grid-cols-3 gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              aria-label={`Открыть страницу: ${link.label}`}
              className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-xs font-semibold text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 transition-all border border-purple-500/25"
            >
              <Icon name={link.icon} size={20} aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Бесплатное — самая лёгкая точка входа */}
        <Link
          to="/mini-course"
          onClick={onClose}
          aria-label="Бесплатные мини-курсы"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/12 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
        >
          <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Icon name="Gift" size={18} className="text-emerald-300" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-emerald-200">31 бесплатный мини-курс</span>
            <span className="block text-xs text-white/50">Один вечер — один навык, без регистрации</span>
          </span>
        </Link>

        {/* Группы-аккордеоны: свёрнуты, поэтому видны все сразу */}
        {MENU_GROUPS.map((group) => {
          const isOpen = openGroup === group.label;
          return (
            <div key={group.label} className="rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setOpenGroup(isOpen ? null : group.label)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
              >
                <Icon name={group.icon} size={18} className="text-purple-300 flex-shrink-0" aria-hidden="true" />
                <span className="flex-1 text-sm font-bold text-white/90">{group.label}</span>
                <span className="text-[11px] text-white/40 tabular-nums">{group.items.length}</span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  aria-hidden="true"
                  className={`text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="px-1.5 pb-2 pt-1 flex flex-col animate-fade-in">
                  {group.items.map((item) =>
                    item.section ? (
                      <button
                        key={item.section}
                        onClick={() => handleItem(item)}
                        aria-label={item.label}
                        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/10 transition-all"
                      >
                        <Icon name={item.icon} size={17} className="mt-0.5 text-purple-300 flex-shrink-0" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-white/85">{item.label}</span>
                          {item.desc && <span className="block text-[11px] text-white/45">{item.desc}</span>}
                        </span>
                      </button>
                    ) : (
                      <Link
                        key={item.path}
                        to={item.path!}
                        onClick={onClose}
                        aria-label={`Открыть страницу: ${item.label}`}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <Icon name={item.icon} size={17} className="mt-0.5 text-purple-300 flex-shrink-0" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-white/85">{item.label}</span>
                          {item.desc && <span className="block text-[11px] text-white/45">{item.desc}</span>}
                        </span>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}

        <Link
          to="/search"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-all"
        >
          <Icon name="Search" size={18} aria-hidden="true" />
          Поиск по сайту
        </Link>
        <Link
          to="/help"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-all"
        >
          <Icon name="CircleHelp" size={18} aria-hidden="true" />
          Центр помощи
        </Link>
      </div>

      {/* Действия закреплены снизу — не нужно листать до конца */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col gap-2 bg-[#0d0a1f]">
        {isAuthenticated ? (
          <Link
            to="/cabinet"
            onClick={onClose}
            aria-label="Открыть личный кабинет"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl"
          >
            <Icon name="User" size={16} aria-hidden="true" />
            Личный кабинет
          </Link>
        ) : (
          <>
            <button
              onClick={() => {
                onClose();
                openLogin();
              }}
              aria-label="Войти в аккаунт"
              className="text-sm text-white/75 py-2.5 border border-white/15 rounded-xl"
            >
              Войти
            </button>
            <Link
              to="/courses"
              onClick={onClose}
              aria-label="Все курсы"
              className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl text-center"
            >
              Все курсы
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
