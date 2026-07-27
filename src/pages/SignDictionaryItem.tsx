import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import {
  getSignByKey,
  searchSigns,
  categoryTitle,
  SIGN_CATEGORIES,
} from "@/components/silent/signLibrary";

const SITE = "https://xn--h1agdcde2c.xn--p1ai";

export default function SignDictionaryItem() {
  const { key = "" } = useParams();
  const sign = useMemo(() => getSignByKey(decodeURIComponent(key)), [key]);

  const related = useMemo(() => {
    if (!sign) return [];
    return searchSigns("", sign.category).filter((s) => s.key !== sign.key).slice(0, 6);
  }, [sign]);

  if (!sign) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex flex-col">
        <Seo
          title="Жест не найден — Словарь РЖЯ | УЧИСЬПРО"
          description="Такого жеста пока нет в словаре русского жестового языка. Мы пополняем словарь вместе с носителями РЖЯ."
          canonical={`${SITE}/dictionary`}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="text-5xl mb-4">🤷</div>
          <h1 className="font-montserrat font-black text-2xl mb-2">Такого жеста пока нет</h1>
          <p className="text-white/60 mb-6">Мы пополняем словарь вместе с носителями РЖЯ.</p>
          <Link
            to="/dictionary"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl"
          >
            <Icon name="BookA" size={18} /> В словарь жестов
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const cat = SIGN_CATEGORIES.find((c) => c.id === sign.category);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`Жест «${sign.word}» на РЖЯ — как показать | Словарь жестов УЧИСЬПРО`}
        description={`Как показывается жест «${sign.word}» на русском жестовом языке: ${sign.description}`}
        canonical={`${SITE}/dictionary/${encodeURIComponent(sign.key)}`}
        keywords={`жест ${sign.word}, ${sign.word} на жестовом языке, РЖЯ ${sign.word}, как показать ${sign.word}`}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🤟</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/dictionary"
            className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg hover:border-cyan-400/40 transition-colors"
          >
            <Icon name="BookA" size={14} /> Весь словарь
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/dictionary" className="text-white/50 hover:text-white text-sm mb-5 inline-flex items-center gap-1">
          <Icon name="ChevronLeft" size={16} /> К словарю
        </Link>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Показ жеста */}
          <div className="rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/[0.08] to-purple-500/[0.06] p-4 md:p-5">
            <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
              {sign.videoUrl ? (
                <video src={sign.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              ) : (
                <img
                  src={sign.image}
                  alt={`Жест «${sign.word}» на русском жестовом языке`}
                  className={`w-full h-full object-cover sign-motion-${sign.motion}`}
                />
              )}
            </div>
          </div>

          {/* Описание */}
          <div>
            {cat && (
              <Link
                to="/dictionary"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-200 bg-cyan-500/15 border border-cyan-400/25 rounded-lg px-3 py-1 mb-3"
              >
                <span>{cat.emoji}</span> {categoryTitle(sign.category)}
              </Link>
            )}
            <h1 className="font-montserrat font-black text-3xl md:text-4xl mb-4 flex items-center gap-2">
              <Icon name="Hand" size={28} className="text-cyan-300" /> {sign.word}
            </h1>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4">
              <div className="text-white/50 text-xs font-bold uppercase tracking-wide mb-1">Как показать</div>
              <p className="text-white/85 text-base leading-relaxed">{sign.description}</p>
            </div>

            {!sign.videoUrl && (
              <p className="text-white/40 text-xs mb-4 flex items-start gap-1.5">
                <Icon name="Info" size={13} className="text-cyan-300 mt-0.5 flex-shrink-0" />
                Пока показываем анимированную иллюстрацию. Видео с носителем РЖЯ появится позже.
              </p>
            )}

            <a
              href={sign.dictionaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-semibold px-5 py-3 rounded-xl hover:border-cyan-400/40 transition-colors"
            >
              <Icon name="ExternalLink" size={16} className="text-cyan-300" />
              Проверить у носителя языка
            </a>
          </div>
        </div>

        {/* Похожие жесты */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-montserrat font-black text-xl mb-4">
              Ещё жесты из темы «{categoryTitle(sign.category)}»
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {related.map((s) => (
                <Link
                  key={s.key}
                  to={`/dictionary/${encodeURIComponent(s.key)}`}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-400/40 overflow-hidden"
                >
                  <div className="aspect-square bg-white/5 overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.word}
                      className={`w-full h-full object-cover sign-motion-${s.motion} group-hover:scale-105 transition-transform`}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-1.5 text-center text-white/75 text-xs font-semibold truncate">{s.word}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}