import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

export function MGUTopBar() {
  return (
    <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
          <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
        </Link>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "МГУ-трек" }]} />
      </div>
    </div>
  );
}

export default function MGUHero() {
  return (
    <div className="bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/25 rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 rounded-full px-3 py-1 mb-4">
          <Icon name="GraduationCap" size={12} className="text-amber-300" />
          <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">Премиум-трек</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3 leading-tight">
          Поступление в <span className="gradient-text-purple">МГУ им. Ломоносова</span> по плану ИИ-стратега
        </h1>
        <p className="text-white/75 text-base md:text-lg mb-6 max-w-3xl">
          Получи персональную дорожную карту: целевые баллы ЕГЭ, перечневые олимпиады для БВИ, подготовка к ДВИ, недельный план занятий. С учётом проходных баллов МГУ 2025.
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Icon name="Users" size={16} className="text-cyan-300" />
            <span className="text-white/85"><b>2 850</b> учеников поступило</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Trophy" size={16} className="text-amber-300" />
            <span className="text-white/85"><b>340+</b> БВИ через олимпиады</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Brain" size={16} className="text-purple-300" />
            <span className="text-white/85"><b>12</b> факультетов МГУ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
