import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import {
  PartnerMe,
  Commission,
  fetchPartnerMe,
  fetchCommissions,
  fetchStructure,
  activatePartner,
  savePayoutDetails,
  requestPayout,
  isPartnerApiReady,
} from "@/components/partners/partnerApi";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/**
 * Кабинет партнёра: ссылка, структура по линиям, начисления и вывод денег.
 *
 * Вознаграждение идёт с реальных оплат приглашённых — за сам факт
 * регистрации деньги не начисляются. Это принципиально: выплаты только
 * с состоявшейся продажи.
 */
const LINE_LABEL: Record<string, string> = {
  "1": "Личные приглашения",
  "2": "Вторая линия",
  "3": "Третья линия",
};

export default function PartnerCabinet() {
  const { isAuthenticated, loading: authLoading, openLogin } = useAuth();
  const [me, setMe] = useState<PartnerMe | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [method, setMethod] = useState("card");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");

  const load = async () => {
    const data = await fetchPartnerMe();
    setMe(data);
    if (data?.is_partner) {
      const [c, s] = await Promise.all([fetchCommissions(), fetchStructure()]);
      setCommissions(c);
      setCounts(s?.counts ?? {});
      setMethod(data.payout_method || "card");
      setDetails(data.payout_details || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLoading(false);
      return;
    }
    if (isAuthenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const handleActivate = async () => {
    setBusy(true);
    setMsg(null);
    const res = await activatePartner();
    setBusy(false);
    if (res?.ok) {
      trackGoal("partner_activated");
      await load();
    } else {
      setMsg("Не удалось активировать статус. Попробуйте позже.");
    }
  };

  const handleSaveDetails = async () => {
    setBusy(true);
    setMsg(null);
    const res = await savePayoutDetails(method, details);
    setBusy(false);
    setMsg(res?.ok ? "Реквизиты сохранены" : res?.error || "Не удалось сохранить");
    if (res?.ok) load();
  };

  const handlePayout = async () => {
    setBusy(true);
    setMsg(null);
    const res = await requestPayout(Number(amount));
    setBusy(false);
    if (res?.ok) {
      trackGoal("partner_payout_requested");
      setMsg("Заявка принята. Выплата придёт в течение 3 рабочих дней.");
      setAmount("");
      load();
    } else {
      setMsg(res?.error || "Не удалось создать заявку");
    }
  };

  const copyLink = () => {
    if (!me?.share_link) return;
    navigator.clipboard.writeText(me.share_link);
    setCopied(true);
    trackGoal("partner_link_copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Кабинет партнёра — УЧИСЬПРО"
        description="Партнёрская программа УЧИСЬПРО: вознаграждение с личных приглашений и структуры."
        noindex
      />
      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">{children}</main>
      <SiteFooter />
    </div>
  );

  if (authLoading || loading) {
    return shell(
      <div className="text-center py-20">
        <Icon name="Loader2" size={28} className="animate-spin mx-auto text-violet-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return shell(
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">🤝</div>
        <h1 className="font-montserrat font-black text-2xl mb-2">Кабинет партнёра</h1>
        <p className="text-white/65 text-sm mb-5">
          Войдите, чтобы получить партнёрскую ссылку и видеть начисления.
        </p>
        <button
          onClick={openLogin}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold text-sm"
        >
          <Icon name="LogIn" size={16} /> Войти
        </button>
      </div>
    );
  }

  if (!isPartnerApiReady()) {
    return shell(
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">🛠️</div>
        <h1 className="font-montserrat font-black text-2xl mb-2">Кабинет скоро откроется</h1>
        <p className="text-white/65 text-sm">
          Партнёрская программа готова, идёт публикация сервиса. Загляните чуть позже.
        </p>
      </div>
    );
  }

  // ── Приглашение стать партнёром ──
  if (!me?.is_partner) {
    const p = me?.line_percent || { "1": 20, "2": 10, "3": 5 };
    return shell(
      <>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🤝</div>
          <h1 className="font-montserrat font-black text-3xl md:text-4xl mb-3">
            Станьте партнёром <span className="gradient-text-purple">УЧИСЬПРО</span>
          </h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">
            Приводите учеников по своей ссылке и получайте вознаграждение с каждой их оплаты —
            а также с оплат тех, кого приведут они.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {(["1", "2", "3"] as const).map((line) => (
            <div
              key={line}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center"
            >
              <div className="font-montserrat font-black text-3xl text-violet-300 mb-1">
                {p[line]}%
              </div>
              <div className="text-white text-sm font-bold mb-1">{LINE_LABEL[line]}</div>
              <div className="text-white/50 text-xs">
                {line === "1" ? "с оплат тех, кого привели вы" : `с оплат ${line}-й линии`}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 mb-6">
          <h2 className="font-montserrat font-bold text-lg mb-3">Как это работает</h2>
          <ul className="space-y-2.5 text-white/70 text-sm">
            {[
              "Получаете персональную ссылку и делитесь ей.",
              "Человек переходит, регистрируется и оплачивает курс или подписку.",
              "Вам начисляется процент — деньги копятся на балансе.",
              "От 1000 ₽ выводите на карту или по СБП.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-xs font-black shrink-0">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="text-white/40 text-xs mt-4 leading-relaxed">
            Вознаграждение начисляется только с реальных оплат. За регистрацию без покупки
            выплат нет. Партнёру для получения выплат нужен статус самозанятого или ИП.
          </p>
        </div>

        {msg && <p className="text-rose-300 text-sm text-center mb-4">{msg}</p>}

        <div className="text-center">
          <button
            onClick={handleActivate}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-8 py-4 rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {busy ? (
              <Icon name="Loader2" size={18} className="animate-spin" />
            ) : (
              <Icon name="Handshake" size={18} />
            )}
            Стать партнёром
          </button>
        </div>
      </>
    );
  }

  // ── Кабинет активного партнёра ──
  const canPayout = (me.balance_rub ?? 0) >= me.min_payout_rub;

  return shell(
    <>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-1">
            Кабинет партнёра
          </p>
          <h1 className="font-montserrat font-black text-3xl">Ваша программа</h1>
        </div>
        <Link to="/referral" className="text-white/45 hover:text-white text-sm underline underline-offset-2">
          Бонусы за друзей
        </Link>
      </div>

      {/* Баланс */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5">
          <p className="text-white/55 text-xs uppercase tracking-wider font-bold mb-1">Баланс</p>
          <p className="font-montserrat font-black text-3xl text-emerald-300">
            {me.balance_rub?.toLocaleString("ru-RU")} ₽
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-white/55 text-xs uppercase tracking-wider font-bold mb-1">Всего заработано</p>
          <p className="font-montserrat font-black text-3xl text-white">
            {me.total_earned_rub?.toLocaleString("ru-RU")} ₽
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-white/55 text-xs uppercase tracking-wider font-bold mb-1">Приглашено</p>
          <p className="font-montserrat font-black text-3xl text-white">{me.invited_count ?? 0}</p>
        </div>
      </div>

      {/* Ссылка */}
      <div className="rounded-2xl border border-violet-400/25 bg-violet-500/[0.08] p-5 mb-6">
        <p className="text-white/55 text-xs uppercase tracking-wider font-bold mb-2">
          Ваша партнёрская ссылка
        </p>
        <div className="flex items-center gap-2 bg-black/30 rounded-xl p-2.5 mb-2">
          <code className="font-mono text-white/90 text-xs md:text-sm flex-1 truncate">
            {me.share_link}
          </code>
          <button
            onClick={copyLink}
            className="bg-violet-500/30 hover:bg-violet-500/50 text-violet-50 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
          >
            <Icon name={copied ? "Check" : "Copy"} size={12} />
            {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
        <p className="text-white/40 text-xs">
          Промокод: <span className="font-mono text-white/70">{me.code}</span> — засчитывается
          автоматически при переходе по ссылке.
        </p>
      </div>

      {/* Структура */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {(["1", "2", "3"] as const).map((line) => (
          <div key={line} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-white/60 text-xs font-bold">{LINE_LABEL[line]}</span>
              <span className="text-violet-300 font-black text-sm">{me.line_percent[line]}%</span>
            </div>
            <p className="font-montserrat font-black text-2xl text-white">{counts[line] ?? 0}</p>
            <p className="text-white/40 text-[11px] mt-0.5">
              оплатили: {me.buyers_by_line?.[line] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Начисления */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
        <h2 className="font-montserrat font-bold text-lg mb-3">Последние начисления</h2>
        {commissions.length === 0 ? (
          <p className="text-white/45 text-sm">
            Пока пусто. Начисления появятся после первой оплаты приглашённого.
          </p>
        ) : (
          <div className="space-y-2">
            {commissions.slice(0, 10).map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 bg-black/20 rounded-xl px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold truncate">{c.from_name}</p>
                  <p className="text-white/45 text-xs">
                    {c.line}-я линия · {c.percent}% ·{" "}
                    {c.source_kind === "subscription" ? "подписка" : "курс"}
                  </p>
                </div>
                <span className="text-emerald-300 font-black text-sm shrink-0">
                  +{c.amount_rub.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Выплаты */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-montserrat font-bold text-lg mb-3">Вывод средств</h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-white/55 text-xs font-bold block mb-1.5">Способ</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm"
            >
              <option value="card">Карта</option>
              <option value="sbp">СБП (по телефону)</option>
            </select>
          </div>
          <div>
            <label className="text-white/55 text-xs font-bold block mb-1.5">
              {method === "card" ? "Номер карты" : "Телефон"}
            </label>
            <input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={method === "card" ? "0000 0000 0000 0000" : "+7 900 000-00-00"}
              className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSaveDetails}
          disabled={busy}
          className="text-violet-300 hover:text-violet-200 text-sm font-bold underline underline-offset-2 mb-5 disabled:opacity-50"
        >
          Сохранить реквизиты
        </button>

        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="text-white/55 text-xs font-bold block mb-1.5">Сумма, ₽</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder={String(me.min_payout_rub)}
              inputMode="numeric"
              className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm"
            />
          </div>
          <button
            onClick={handlePayout}
            disabled={busy || !canPayout || !amount}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-40"
          >
            Вывести
          </button>
        </div>

        <p className="text-white/40 text-xs mt-3">
          Минимальная сумма — {me.min_payout_rub} ₽.
          {!canPayout && " Накопите баланс, чтобы заказать выплату."}
          {(me.pending_payout_rub ?? 0) > 0 &&
            ` В обработке: ${me.pending_payout_rub} ₽.`}
        </p>

        {msg && <p className="text-white/80 text-sm mt-3">{msg}</p>}
      </div>
    </>
  );
}
