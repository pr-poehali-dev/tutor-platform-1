import { useLocation } from "react-router-dom";
import { useDirection } from "@/hooks/useDirection";
import DirectionSwitch from "./DirectionSwitch";

/** На этих страницах полоса не нужна: своя шапка с переключателем,
 *  служебные экраны или оплата, где отвлекать нельзя. */
const SKIP = /^\/($|shkola$|vzroslym$|admin|checkout|course-checkout|auth|school\/learning|kids\/games\/|for-schools\/presentation|samara\/leaflet|[a-z-]+\/presentation)/;

/**
 * Тонкая полоса с переключателем направлений над любой страницей.
 * Нужна, потому что у большинства страниц своя шапка: без полосы
 * человек, пришедший из поиска на /homework, не видит, что у нас есть
 * раздел для малыша или для него самого.
 */
export default function DirectionStrip() {
  const { pathname } = useLocation();
  const { active } = useDirection();
  if (SKIP.test(pathname)) return null;

  return (
    <div className="relative z-40 border-b border-white/8 bg-[#0b0918]/95">
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-center sm:justify-between gap-3">
        <span className="hidden sm:inline text-[11px] text-white/40 uppercase tracking-wider">Кто учится?</span>
        <DirectionSwitch active={active} />
      </div>
    </div>
  );
}