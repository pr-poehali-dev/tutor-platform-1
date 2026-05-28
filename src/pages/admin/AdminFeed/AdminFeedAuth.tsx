import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

interface AdminFeedAuthProps {
  adminKey: string;
  setAdminKeyState: (v: string) => void;
  handleUnlock: () => void;
}

export default function AdminFeedAuth({ adminKey, setAdminKeyState, handleUnlock }: AdminFeedAuthProps) {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-4">
      <Seo title="Админ-панель Ленты — УЧИСЬПРО" description="Модерация статей и управление ИИ-куратором." canonical={`${SITE_URL}/admin/feed`} noindex />
      <div className="max-w-md w-full bg-card border border-white/10 rounded-3xl p-6 md:p-7">
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="font-montserrat font-black text-2xl mb-1">Админ-панель «Лента»</h1>
          <p className="text-white/55 text-sm">Введи секретный ключ для модерации статей</p>
        </div>
        <input
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKeyState(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          placeholder="ADMIN_KEY"
          className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 mb-3"
        />
        <button
          onClick={handleUnlock}
          disabled={!adminKey.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          <Icon name="LogIn" size={14} />
          Войти
        </button>
        <Link to="/feed" className="block text-center text-white/45 hover:text-white text-xs mt-4">
          ← Вернуться в публичную ленту
        </Link>
      </div>
    </div>
  );
}
