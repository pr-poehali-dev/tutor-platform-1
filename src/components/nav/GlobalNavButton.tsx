import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import MobileMenu from "./MobileMenu";

/** Страницы, где меню уже есть в своей шапке — кнопку не дублируем. */
const SKIP_PREFIXES = ["/admin", "/kids", "/draw", "/silent", "/school/learning", "/checkout", "/course-checkout"];

/** Единая точка входа в разделы для всех страниц, кроме главной.
 *  Без неё человек, пришедший из поиска на внутреннюю страницу,
 *  не может попасть никуда дальше. */
export default function GlobalNavButton() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  if (path === "/" || SKIP_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    return null;
  }

  const handleSection = (section: string) => navigate(`/?section=${section}`);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Открыть меню разделов"
          aria-expanded={false}
          aria-controls="mobile-nav"
          className="md:hidden fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[120] w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-xl shadow-purple-500/30 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Icon name="Menu" size={24} aria-hidden="true" />
        </button>
      )}
      <MobileMenu open={open} onClose={() => setOpen(false)} onSectionClick={handleSection} />
    </>
  );
}
