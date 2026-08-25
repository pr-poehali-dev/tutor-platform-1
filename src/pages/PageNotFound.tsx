import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

const SITE_URL = "https://учисьпро.рф";

/** Куда увести человека, попавшего на несуществующий адрес. */
const EXITS = [
  { to: "/courses", icon: "GraduationCap", label: "Все курсы", hint: "Каталог программ" },
  { to: "/free-courses", icon: "Gift", label: "Бесплатно", hint: "Открытые материалы" },
  { to: "/feed", icon: "Newspaper", label: "Лента", hint: "Статьи и разборы" },
  { to: "/ai-persona", icon: "Sparkles", label: "Спросить ИИ", hint: "Ответит голосом" },
];

/**
 * Страница 404.
 *
 * Важно для поиска: отдаёт noindex — иначе поисковик добавит в индекс
 * пустышки по опечаткам в адресе и размоет качество сайта.
 * Важно для людей: вместо тупика даёт четыре понятных выхода.
 */
export default function PageNotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404: несуществующий адрес:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center px-4 py-16">
      <Seo
        title="Страница не найдена — УЧИСЬПРО"
        description="Такой страницы нет. Перейдите в каталог курсов или задайте вопрос ИИ-помощнику."
        canonical={`${SITE_URL}/404`}
        noindex
        statusCode={404}
      />

      <div className="max-w-lg w-full text-center">
        <div className="text-7xl md:text-8xl mb-4">🚀</div>

        <div className="font-montserrat font-black text-6xl md:text-7xl gradient-text-purple mb-3">
          404
        </div>

        <h1 className="font-montserrat font-black text-xl md:text-2xl mb-3">
          Страница улетела в открытый космос
        </h1>

        <p className="text-white/60 mb-8 leading-relaxed">
          Такого адреса на сайте нет — возможно, страницу переместили или в ссылке опечатка.
          Вот куда можно перейти:
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {EXITS.map((e) => (
            <Link
              key={e.to}
              to={e.to}
              className="group flex flex-col items-start gap-1.5 p-4 rounded-2xl border border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-colors text-left"
            >
              <Icon name={e.icon} size={20} className="text-purple-400" />
              <span className="font-bold text-sm">{e.label}</span>
              <span className="text-white/45 text-xs">{e.hint}</span>
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          <Icon name="Home" size={17} />
          На главную
        </Link>
      </div>
    </div>
  );
}