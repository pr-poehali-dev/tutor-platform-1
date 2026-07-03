import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function GrantHeader() {
  return (
    <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎯</div>
          <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">гранты</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/grants/my" className="text-sm text-white/65 hover:text-white transition-colors inline-flex items-center gap-1.5">
            <Icon name="FolderOpen" size={15} /> Мои заявки
          </Link>
          <Link to="/for-business" className="hidden sm:inline-flex text-sm text-white/65 hover:text-white transition-colors items-center gap-1.5">
            <Icon name="Building2" size={15} /> Для бизнеса
          </Link>
        </div>
      </div>
    </div>
  );
}
