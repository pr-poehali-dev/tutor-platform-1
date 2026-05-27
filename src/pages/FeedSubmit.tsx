import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { submitArticle } from "@/components/feed/api";
import { CATEGORY_META, FeedCategory } from "@/components/feed/types";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function FeedSubmit() {
  const { isAuthenticated, openLogin, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<FeedCategory>("science");
  const [coverUrl, setCoverUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [displayName, setDisplayName] = useState(user?.name || "");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordsCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordsCount / 200));

  const canSubmit = title.length >= 8 && content.length >= 300 && !submitting;

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    const res = await submitArticle({
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      cover_url: coverUrl.trim() || undefined,
      source_url: sourceUrl.trim() || undefined,
      author_display_name: displayName.trim() || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess(res.message || "Статья отправлена на модерацию. Решение придёт в течение 24 часов.");
      setTitle(""); setSummary(""); setContent(""); setCoverUrl(""); setSourceUrl("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError(res.message || "Не удалось отправить статью");
    }
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Опубликовать статью в Ленте — УЧИСЬПРО"
        description="Напиши свою статью о науке, культуре, школе, ИИ или роботах. После модерации она появится в общей ленте УЧИСЬПРО."
        canonical={`${SITE_URL}/feed/submit`}
        noindex
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-lg">✍️</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[
              { label: "Главная", href: "/" },
              { label: "Лента", href: "/feed" },
              { label: "Опубликовать" },
            ]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">

        <section className="mb-6">
          <div className="inline-flex items-center gap-2 bg-fuchsia-500/15 border border-fuchsia-500/35 rounded-full px-4 py-1.5 mb-3">
            <Icon name="PenLine" size={12} className="text-fuchsia-300" />
            <span className="text-xs text-fuchsia-200 font-bold uppercase tracking-wider">Публикация статьи</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-4xl mb-2">
            Опубликуй свою статью
          </h1>
          <p className="text-white/65 text-sm md:text-base">
            Расскажи школьникам что-то интересное. Все статьи проходят модерацию — обычно в течение 24 часов. После одобрения появятся в общей ленте.
          </p>
        </section>

        {!isAuthenticated && !authLoading && (
          <div className="bg-amber-500/15 border border-amber-500/35 rounded-2xl p-5 mb-6 flex items-start gap-3 flex-wrap">
            <Icon name="LogIn" size={22} className="text-amber-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base mb-1">Войди, чтобы публиковать</p>
              <p className="text-white/65 text-sm">
                Для отправки статьи нужно подтвердить личность через личный кабинет.
              </p>
            </div>
            <button
              onClick={openLogin}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform"
            >
              Войти
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/35 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <Icon name="CheckCircle2" size={22} className="text-emerald-300 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-bold text-base mb-1">Готово!</p>
              <p className="text-white/75 text-sm">{success}</p>
              <button
                onClick={() => navigate("/feed")}
                className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/30 hover:bg-emerald-500/45 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                <Icon name="ArrowRight" size={12} />
                Вернуться в ленту
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/35 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Icon name="AlertCircle" size={18} className="text-rose-300 flex-shrink-0 mt-0.5" />
            <p className="text-white/85 text-sm">{error}</p>
          </div>
        )}

        {/* ─── Форма ─── */}
        <div className="space-y-4">
          {/* Категория */}
          <div>
            <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-2">Категория</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(Object.keys(CATEGORY_META) as FeedCategory[]).map((cat) => {
                const meta = CATEGORY_META[cat];
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                      active
                        ? "bg-white/12 border-white/35 scale-[1.03] shadow-lg"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="text-2xl">{meta.emoji}</span>
                    <span className={`text-xs font-bold ${active ? "text-white" : "text-white/65"}`}>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Заголовок */}
          <div>
            <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">
              Заголовок <span className="text-rose-300">*</span>
              <span className="text-white/35 normal-case ml-2">от 8 символов</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={400}
              placeholder="Например: Как нейросети помогают расшифровывать древние свитки"
              className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500/50"
            />
            <p className="text-white/35 text-xs mt-1">{title.length} / 400</p>
          </div>

          {/* Лид */}
          <div>
            <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">
              Лид-абзац
              <span className="text-white/35 normal-case ml-2">1–2 предложения, до 300 символов</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Короткое описание для превью в ленте"
              className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <p className="text-white/35 text-xs mt-1">{summary.length} / 1000</p>
          </div>

          {/* Текст */}
          <div>
            <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">
              Текст статьи <span className="text-rose-300">*</span>
              <span className="text-white/35 normal-case ml-2">от 300 символов</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={30000}
              rows={12}
              placeholder="Расскажи всё подробно. Разбивай на абзацы пустой строкой. Будь честным, не выдумывай факты."
              className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-y leading-relaxed"
            />
            <div className="flex items-center justify-between text-white/35 text-xs mt-1 flex-wrap gap-2">
              <span>{content.length} / 30000 символов · {wordsCount} слов</span>
              <span>≈ {minutes} мин чтения</span>
            </div>
          </div>

          {/* Доп. поля */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">
                Обложка (URL картинки)
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">
                Первоисточник (если есть)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">
              Как тебя подписать
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={160}
              placeholder="Имя или псевдоним для публикации"
              className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Правила */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs text-white/65 leading-relaxed">
            <p className="text-white font-bold mb-2 flex items-center gap-1.5">
              <Icon name="ShieldCheck" size={14} className="text-emerald-300" />
              Что важно знать
            </p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Все статьи проходят модерацию. Решение — обычно в течение 24 часов.</li>
              <li>Нельзя: реклама, оскорбления, ненормативная лексика, плагиат, фейки.</li>
              <li>Если используешь информацию из внешнего источника — укажи ссылку.</li>
              <li>Изображения должны быть свободными к использованию (например, Unsplash).</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Link to="/feed" className="text-white/55 hover:text-white text-sm">
              Отмена
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || !isAuthenticated}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-fuchsia-500/30"
            >
              {submitting ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
              Отправить на модерацию
            </button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
