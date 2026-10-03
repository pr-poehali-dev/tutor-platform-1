import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useDirection } from "@/hooks/useDirection";
import { DIRECTIONS } from "@/lib/directions";
import DirectionSwitch from "./DirectionSwitch";
import { DIRECTION_MENU, BUSINESS_LINKS } from "./navData";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onSectionClick?: (section: string) => void;
}

/**
 * Мобильное меню на весь экран.
 * Сверху — переключатель направлений, ниже — 5 разделов текущего
 * направления. Партнёрские страницы свёрнуты в отдельный блок внизу,
 * чтобы не смешиваться с обучением.
 */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { isAuthenticated, openLogin } = useAuth();
  const { active } = useDirection();
  const [bizOpen, setBizOpen] = useState(false);

  // Пока меню открыто — фон не прокручивается под пальцем.
  // position: fixed вместо overflow: hidden — iOS Safari игнорирует overflow на body.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const meta = active ? DIRECTIONS[active] : null;
  const items = active ? DIRECTION_MENU[active] : [];

  const menu = (
    <div
      id="mobile-nav"
      className="md:hidden fixed inset-x-0 top-0 z-[200] h-[100dvh] max-h-[100dvh] bg-[#0d0a1f] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Меню разделов"
    >
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link to="/" onClick={onClose} className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base" aria-hidden="true">
            🚀
          </span>
          <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
        </Link>
        <button onClick={onClose} aria-label="Закрыть меню" className="text-white/70 hover:text-white p-2 -mr-2">
          <Icon name="X" size={24} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-3 [&>*]:flex-shrink-0">
        <DirectionSwitch active={active} variant="wide" onNavigate={onClose} />

        {meta ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] uppercase tracking-wider text-white/40 px-1 mt-1">
              {meta.label} · {meta.age}
            </p>
            {items.map((item) => (
              <Link
                key={item.label}
                to={item.path!}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04] border border-white/8 hover:bg-white/10 transition-all"
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon name={item.icon} size={18} className={meta.text} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white/90">{item.label}</span>
                  {item.desc && <span className="block text-xs text-white/45">{item.desc}</span>}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/55 px-1 leading-relaxed">
            Выберите, кто будет учиться, — покажем разделы именно для него.
          </p>
        )}

        <Link
          to="/mini-course"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/12 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
        >
          <Icon name="Gift" size={18} className="text-emerald-300" aria-hidden="true" />
          <span className="text-sm font-bold text-emerald-200">Бесплатные мини-курсы</span>
        </Link>

        <div className="rounded-xl border border-white/10 overflow-hidden mt-1">
          <button
            onClick={() => setBizOpen((v) => !v)}
            aria-expanded={bizOpen}
            className="w-full flex items-center gap-3 px-4 py-3 text-left bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          >
            <Icon name="Building2" size={17} className="text-white/50" aria-hidden="true" />
            <span className="flex-1 text-sm font-semibold text-white/70">Партнёрам и бизнесу</span>
            <Icon name="ChevronDown" size={16} aria-hidden="true" className={`text-white/40 transition-transform ${bizOpen ? "rotate-180" : ""}`} />
          </button>
          {bizOpen && (
            <div className="px-1.5 pb-2 pt-1 flex flex-col animate-fade-in">
              {BUSINESS_LINKS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path!}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Icon name={item.icon} size={16} className="text-white/50 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm text-white/80">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link to="/search" onClick={onClose} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white/65 hover:bg-white/10 border border-white/8">
            <Icon name="Search" size={16} aria-hidden="true" /> Поиск
          </Link>
          <Link to="/help" onClick={onClose} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white/65 hover:bg-white/10 border border-white/8">
            <Icon name="CircleHelp" size={16} aria-hidden="true" /> Помощь
          </Link>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#0d0a1f]">
        {isAuthenticated ? (
          <Link
            to="/cabinet"
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl"
          >
            <Icon name="User" size={16} aria-hidden="true" />
            Личный кабинет
          </Link>
        ) : (
          <button
            onClick={() => {
              onClose();
              openLogin();
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-5 py-3 rounded-xl"
          >
            Войти
          </button>
        )}
      </div>
    </div>
  );

  // Рендерим в body: внутри навбара меню наследовало backdrop-blur родителя.
  return createPortal(menu, document.body);
}
