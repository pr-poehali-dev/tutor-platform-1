import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Props {
  title: string;
  subtitle?: string;
  updatedAt: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, subtitle, updatedAt, children }: Props) {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 137.5) % 100) + "%",
              top: ((i * 97.3) % 100) + "%",
              opacity: 0.12 + (i % 4) * 0.08,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>

        <div className="mb-8">
          <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-2 leading-tight">{title}</h1>
          {subtitle && <p className="text-white/55 text-base mb-3">{subtitle}</p>}
          <p className="text-white/35 text-xs">Действует с {updatedAt}</p>
        </div>

        <div className="bg-card/60 border border-white/8 rounded-3xl p-6 md:p-10 prose-legal">
          {children}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link to="/legal/offer" className="text-white/55 hover:text-white transition-colors">Оферта</Link>
          <span className="text-white/15">·</span>
          <Link to="/legal/privacy" className="text-white/55 hover:text-white transition-colors">Политика конфиденциальности</Link>
          <span className="text-white/15">·</span>
          <Link to="/legal/terms" className="text-white/55 hover:text-white transition-colors">Пользовательское соглашение</Link>
        </div>
      </div>
    </div>
  );
}
