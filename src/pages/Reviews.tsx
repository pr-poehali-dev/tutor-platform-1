import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { fetchReviews, submitReview, Review } from "@/components/contact/api";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const ROLE_LABELS: Record<Review["author_role"], { label: string; emoji: string }> = {
  student: { label: "Ученик",   emoji: "🎒" },
  parent:  { label: "Родитель", emoji: "👨‍👩‍👧" },
  teacher: { label: "Учитель",  emoji: "👨‍🏫" },
};

export default function Reviews() {
  const { isAuthenticated, openLogin, user } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);

  // Форма
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [role, setRole] = useState<Review["author_role"]>("student");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews().then((r) => {
      setItems(r.items);
      setAvg(r.avg_rating);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    setError(null); setSuccess(null); setSending(true);
    const res = await submitReview({
      author_name: name.trim(),
      author_role: role,
      rating,
      text: text.trim(),
    });
    setSending(false);
    if (res.ok) {
      setSuccess(res.message || "Спасибо за отзыв!");
      setText(""); setShowForm(false);
    } else {
      setError(res.message || "Не удалось отправить");
    }
  };

  const jsonLd = items.length > 0 ? [{
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: { "@type": "EducationalOrganization", name: "УЧИСЬПРО" },
    ratingValue: avg,
    reviewCount: items.length,
    bestRating: 5,
    worstRating: 1,
  }] : [];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Отзывы учеников и родителей · УЧИСЬПРО"
        description="Что говорят об УЧИСЬПРО ученики, родители и учителя. Реальные отзывы о подготовке к ЕГЭ, ИИ-репетиторе и онлайн-обучении."
        canonical={`${SITE_URL}/reviews`}
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-lg">⭐</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Отзывы" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <section className="text-center mb-6">
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3">
            Отзывы наших <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">учеников</span>
          </h1>
          {items.length > 0 && (
            <div className="inline-flex items-center gap-3 bg-card/60 border border-white/10 rounded-2xl px-5 py-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="Star" size={20} className={i < Math.round(avg) ? "text-yellow-400 fill-yellow-400" : "text-white/20"} />
                ))}
              </div>
              <div className="text-left">
                <p className="font-montserrat font-black text-white text-xl leading-none">{avg.toFixed(1)}</p>
                <p className="text-white/55 text-xs">{items.length} отзывов</p>
              </div>
            </div>
          )}
        </section>

        {!showForm && (
          <div className="text-center mb-6">
            <button
              onClick={() => isAuthenticated ? setShowForm(true) : openLogin()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <Icon name="PenLine" size={14} />
              Оставить свой отзыв
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/35 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <Icon name="CheckCircle2" size={20} className="text-emerald-300 flex-shrink-0" />
            <p className="text-white/85 text-sm">{success}</p>
          </div>
        )}

        {showForm && isAuthenticated && (
          <div className="bg-card/60 border border-white/10 rounded-3xl p-5 mb-6 space-y-3">
            <h3 className="font-montserrat font-black text-white text-lg">Расскажи о своём опыте</h3>
            {error && <p className="text-rose-300 text-xs">{error}</p>}

            <div>
              <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
              />
            </div>

            <div>
              <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1">Кто ты?</label>
              <div className="flex gap-2">
                {(Object.keys(ROLE_LABELS) as Review["author_role"][]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 p-2 rounded-xl border-2 text-xs font-bold transition-all ${
                      role === r
                        ? "bg-yellow-500/15 border-yellow-500/45 text-white"
                        : "bg-white/[0.03] border-white/10 text-white/65"
                    }`}
                  >
                    <span>{ROLE_LABELS[r].emoji}</span>
                    {ROLE_LABELS[r].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1">Оценка</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    aria-label={`${s} звёзд`}
                  >
                    <Icon name="Star" size={28} className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/20 hover:text-yellow-300"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1">Отзыв (от 30 символов)</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 resize-y"
                placeholder="Что понравилось? Что помогло? Что улучшить?"
              />
              <p className="text-white/35 text-xs mt-1">{text.length} / 2000</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="text-white/55 hover:text-white text-sm px-3 py-2">Отмена</button>
              <button
                onClick={handleSubmit}
                disabled={text.length < 30 || name.length < 2 || sending}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm px-5 py-2 rounded-xl disabled:opacity-50"
              >
                {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : "Отправить"}
              </button>
            </div>
          </div>
        )}

        {/* Список отзывов */}
        {loading ? (
          <div className="text-center py-12 text-white/45">
            <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-card/40 rounded-3xl">
            <div className="text-5xl mb-3 opacity-50">💭</div>
            <p className="text-white/65">Пока отзывов нет. Стань первым!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => {
              const meta = ROLE_LABELS[r.author_role];
              return (
                <div key={r.id} className="bg-card/60 border border-white/10 rounded-2xl p-4 md:p-5">
                  <div className="flex items-start gap-3 mb-2 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {r.author_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-sm">{r.author_name}</p>
                      <p className="text-white/45 text-xs flex items-center gap-1">
                        <span>{meta.emoji}</span>{meta.label}
                        {r.created_at && <span className="text-white/30">· {new Date(r.created_at).toLocaleDateString("ru-RU")}</span>}
                      </p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon key={i} name="Star" size={14} className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-white/15"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/85 text-sm leading-relaxed">{r.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
