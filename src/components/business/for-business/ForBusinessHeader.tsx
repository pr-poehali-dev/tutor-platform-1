import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function ForBusinessHeader() {
  return (
    <>
      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
            <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">для бизнеса</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/school-builder"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-white border border-white/15 hover:border-violet-400/50 px-4 py-2 rounded-xl transition-colors"
            >
              <Icon name="Sparkles" size={15} className="text-violet-300" /> Собрать курс
            </Link>
            <a
              href="#lead"
              className="text-sm font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform"
            >
              Получить демо
            </a>
          </div>
        </div>
      </div>
    </>
  );
}