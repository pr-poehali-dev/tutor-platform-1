import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

export default function TutorTopBar() {
  return (
    <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" aria-label="Шапка сайта">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="На главную УЧИСЬПРО">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">🚀</div>
          <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
        </Link>
        <div className="hidden md:block">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Репетитор" }]} />
        </div>
        <Link
          to="/super-courses"
          className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
        >
          <Icon name="Play" size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Начать урок</span>
          <span className="sm:hidden">Урок</span>
        </Link>
      </nav>
    </header>
  );
}
