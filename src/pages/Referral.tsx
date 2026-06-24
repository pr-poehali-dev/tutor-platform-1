import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { fetchMyCode, fetchInvited, useCode as applyReferralCode, MyRefCode, InvitedFriend } from "@/components/referrals/api";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function Referral() {
  const { isAuthenticated, openLogin } = useAuth();
  const [code, setCode] = useState<MyRefCode | null>(null);
  const [invited, setInvited] = useState<InvitedFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"link" | "code" | "text" | null>(null);
  const [otherCode, setOtherCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([fetchMyCode(), fetchInvited()]).then(([c, inv]) => {
      setCode(c);
      setInvited(inv);
      setLoading(false);
    });
  }, [isAuthenticated]);

  const copy = (text: string, key: "link" | "code" | "text") => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleApply = async () => {
    setApplying(true);
    setApplyMsg(null);
    const res = await applyReferralCode(otherCode);
    setApplying(false);
    setApplyMsg(res.ok ? `Готово! +${res.bonus_days} дней подписки` : (res.message || "Ошибка"));
    if (res.ok) {
      setOtherCode("");
      fetchMyCode().then((c) => c && setCode(c));
    }
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Приведи друга · УЧИСЬПРО"
        description="Поделись промокодом — получишь +7 дней подписки за каждого друга, который зарегистрируется. Друг тоже получит бонус."
        canonical={`${SITE_URL}/referral`}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-lg">🎁</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Приведи друга" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <section className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 rounded-full px-4 py-1.5 mb-3">
            <Icon name="Gift" size={12} className="text-amber-300" />
            <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">Реферальная программа</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3 leading-tight">
            Приведи друга — <span className="bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">получи +7 дней</span>
          </h1>
          <p className="text-white/70 text-base">Друг тоже получит +7 дней бесплатной подписки. Бесконечно — приглашай хоть весь класс.</p>
        </section>

        {/* Акция со знайками */}
        <div className="bg-gradient-to-br from-purple-500/15 to-amber-500/15 border border-amber-500/30 rounded-3xl p-5 md:p-6 mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-3 py-1 mb-3">
            <span className="text-base">🔥</span>
            <span className="text-[11px] text-amber-200 font-bold uppercase tracking-wider">Акция · с 23 июня</span>
          </div>
          <p className="text-white font-bold text-lg mb-3">Дарим ЗНАЙКИ за друзей!</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-black/25 rounded-2xl p-4 flex items-center gap-3">
              <div className="text-3xl">🎁</div>
              <div>
                <p className="font-montserrat font-black text-amber-300 text-xl">+100 ЗНАЕК</p>
                <p className="text-white/65 text-xs">за каждого друга, который зарегистрируется по промокоду</p>
              </div>
            </div>
            <div className="bg-black/25 rounded-2xl p-4 flex items-center gap-3">
              <div className="text-3xl">💰</div>
              <div>
                <p className="font-montserrat font-black text-emerald-300 text-xl">+300 ЗНАЕК</p>
                <p className="text-white/65 text-xs">если друг купит любой курс на платформе</p>
              </div>
            </div>
          </div>
          <p className="text-white/45 text-[11px] mt-3">ЗНАЙКИ начисляются автоматически. 1 ЗНАЙКА = 1 ₽, ими можно оплатить до 30% стоимости курса.</p>
        </div>

        {/* Как работает */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {[
            { emoji: "🔗", title: "1. Скопируй", desc: "Свой персональный промокод или ссылку" },
            { emoji: "👥", title: "2. Поделись", desc: "Отправь другу в чат, мессенджер или соцсеть" },
            { emoji: "🎉", title: "3. Получи бонус", desc: "Друг регистрируется → вы оба получаете +7 дней" },
          ].map((s) => (
            <div key={s.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-1">{s.emoji}</div>
              <p className="font-bold text-white text-sm mb-1">{s.title}</p>
              <p className="text-white/55 text-xs leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="bg-amber-500/15 border border-amber-500/35 rounded-2xl p-5 mb-6 flex items-center gap-3 flex-wrap">
            <Icon name="LogIn" size={22} className="text-amber-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold mb-1">Войди, чтобы получить промокод</p>
              <p className="text-white/65 text-xs">У каждого юзера свой уникальный код для приглашений.</p>
            </div>
            <button
              onClick={openLogin}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl"
            >Войти</button>
          </div>
        )}

        {isAuthenticated && loading && (
          <div className="text-center py-8 text-white/45">
            <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Загружаю твой промокод...</p>
          </div>
        )}

        {isAuthenticated && code && (
          <>
            {/* Промокод и ссылка */}
            <div className="bg-gradient-to-br from-amber-500/15 to-pink-500/15 border border-amber-500/30 rounded-3xl p-5 md:p-6 mb-6">
              <p className="text-white/55 text-[11px] uppercase tracking-wider font-bold mb-2">Твой промокод</p>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div className="font-mono font-black text-3xl md:text-5xl text-white tracking-widest">{code.code}</div>
                <button
                  onClick={() => copy(code.code, "code")}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                >
                  <Icon name={copied === "code" ? "Check" : "Copy"} size={12} />
                  {copied === "code" ? "Скопировано" : "Копировать"}
                </button>
              </div>

              <p className="text-white/55 text-[11px] uppercase tracking-wider font-bold mb-1">Реферальная ссылка</p>
              <div className="flex items-center gap-2 bg-black/30 rounded-xl p-2 mb-3">
                <div className="font-mono text-white/85 text-xs md:text-sm flex-1 truncate">{code.share_link}</div>
                <button
                  onClick={() => copy(code.share_link, "link")}
                  className="bg-cyan-500/30 hover:bg-cyan-500/45 text-cyan-100 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0"
                >
                  <Icon name={copied === "link" ? "Check" : "Copy"} size={12} />
                  {copied === "link" ? "OK" : "Копировать"}
                </button>
              </div>

              <button
                onClick={() => copy(code.share_text, "text")}
                className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl p-3 text-left text-xs text-white/75 flex items-start gap-2 transition-colors"
              >
                <Icon name={copied === "text" ? "Check" : "MessageSquare"} size={14} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                <span>{copied === "text" ? "Готовое сообщение скопировано!" : code.share_text}</span>
              </button>

              {/* Кнопки шаринга */}
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(code.share_link)}&text=${encodeURIComponent(code.share_text)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-[#229ED9]/25 hover:bg-[#229ED9]/40 border border-[#229ED9]/40 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >Telegram</a>
                <a
                  href={`https://vk.com/share.php?url=${encodeURIComponent(code.share_link)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-[#0077FF]/25 hover:bg-[#0077FF]/40 border border-[#0077FF]/40 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >ВКонтакте</a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(code.share_text + " " + code.share_link)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-500/40 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >WhatsApp</a>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-card/60 border border-white/10 rounded-2xl p-4 text-center">
                <p className="font-montserrat font-black text-white text-3xl">{code.invited_count}</p>
                <p className="text-white/55 text-xs uppercase tracking-wider font-bold">Приглашено друзей</p>
              </div>
              <div className="bg-card/60 border border-emerald-500/30 rounded-2xl p-4 text-center bg-gradient-to-br from-emerald-500/[0.05] to-transparent">
                <p className="font-montserrat font-black text-emerald-300 text-3xl">+{code.rewards_earned_days}</p>
                <p className="text-white/55 text-xs uppercase tracking-wider font-bold">Дней подписки</p>
              </div>
            </div>

            {/* Список приглашённых */}
            {invited.length > 0 && (
              <section className="bg-card/60 border border-white/10 rounded-3xl p-5 mb-6">
                <h2 className="font-montserrat font-black text-white text-lg mb-3">Твои приглашённые</h2>
                <div className="space-y-1">
                  {invited.map((f) => (
                    <div key={f.user_id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {f.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-white text-sm flex-1">{f.name}</span>
                      <span className="text-white/35 text-xs">{f.joined_at ? new Date(f.joined_at).toLocaleDateString("ru-RU") : ""}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Применить чужой код */}
            <section className="bg-card/60 border border-white/10 rounded-3xl p-5">
              <h2 className="font-montserrat font-black text-white text-base mb-1">Есть промокод друга?</h2>
              <p className="text-white/55 text-xs mb-3">Введи его, чтобы получить +7 дней подписки</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={otherCode}
                  onChange={(e) => setOtherCode(e.target.value.toUpperCase().slice(0, 12))}
                  placeholder="ABCD1234"
                  className="flex-1 min-w-[180px] bg-white/[0.04] border border-white/12 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handleApply}
                  disabled={otherCode.length < 4 || applying}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-50"
                >
                  {applying ? <Icon name="Loader2" size={14} className="animate-spin" /> : "Применить"}
                </button>
              </div>
              {applyMsg && (
                <p className={`text-xs mt-2 ${applyMsg.startsWith("Готово") ? "text-emerald-300" : "text-rose-300"}`}>
                  {applyMsg}
                </p>
              )}
            </section>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}