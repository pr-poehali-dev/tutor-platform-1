import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { useZnaika, formatZnaika, ZnaikaAchievement } from "@/context/ZnaikaContext";
import ZnaikaShop from "@/components/znaika/ZnaikaShop";

const LEVEL_NAMES = [
  "Новичок", "Любознательный", "Ученик", "Студент", "Знаток",
  "Эксперт", "Мастер", "Гуру", "Легенда",
];

const TIER_COLORS: Record<string, string> = {
  common:    "border-white/15 bg-white/[0.04]",
  rare:      "border-cyan-400/30 bg-cyan-500/[0.06]",
  epic:      "border-purple-400/35 bg-purple-500/[0.08]",
  legendary: "border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-rose-500/10",
};

const TIER_LABEL: Record<string, string> = {
  common: "Обычное",
  rare: "Редкое",
  epic: "Эпическое",
  legendary: "Легендарное",
};

const REASON_LABEL: Record<string, string> = {
  daily_checkin:     "Ежедневный вход",
  streak_bonus:      "Бонус за стрик",
  lesson_completed:  "Урок пройден",
  review_posted:     "Отзыв",
  referral:          "Друг по ссылке",
  purchase_cashback: "Кэшбек с покупки",
  achievement:       "Достижение",
  course_payment:    "Оплата курса",
  feed_reaction:     "Реакция в ленте",
};

export default function Znaika() {
  const { isAuthenticated, openLogin, user } = useAuth();
  const { state, loading, refresh, checkIn } = useZnaika();
  const [checking, setChecking] = useState(false);
  const [flash, setFlash] = useState<{ msg: string; type: "ok" | "info" } | null>(null);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  const levelName = state ? LEVEL_NAMES[Math.min(state.level - 1, LEVEL_NAMES.length - 1)] : "—";

  const levelProgress = useMemo(() => {
    if (!state || !state.next_level_at) return 100;
    const totalEarned = state.total_earned;
    const prevThreshold = state.next_level_at - 500 > 0 ? Math.max(0, state.next_level_at - (state.next_level_at - state.total_spent)) : 0;
    const range = state.next_level_at - prevThreshold;
    if (range <= 0) return 100;
    const progress = ((totalEarned - prevThreshold) / range) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [state]);

  const earnedAchievements = state?.achievements.filter((a) => a.earned) ?? [];
  const lockedAchievements = state?.achievements.filter((a) => !a.earned) ?? [];

  const handleCheckIn = async () => {
    setChecking(true);
    const result = await checkIn();
    setChecking(false);
    if (result.already) {
      setFlash({ msg: "Сегодня уже отмечались — заходи завтра!", type: "info" });
    } else if (result.ok) {
      const total = (result.awarded ?? []).reduce((s, a) => s + a.amount, 0);
      setFlash({ msg: `+${total} ЗНАЕК зачислено`, type: "ok" });
    }
    setTimeout(() => setFlash(null), 3500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Seo
          title="ЗНАЙКИ — игровая валюта и бонусы УЧИСЬПРО"
          description="ЗНАЙКИ — внутренняя валюта УЧИСЬПРО. Учись, заходи каждый день, приглашай друзей и копи ЗНАЙКИ: 1 ЗНАЙКА = 1 ₽ скидки при оплате курса (до 30% стоимости)."
          canonical="https://учисьпро.рф/znaika"
          keywords="знайки, бонусы учисьпро, кэшбек за обучение, скидка на курсы, реферальная программа, геймификация обучения"
        />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Icon name="Coins" size={40} className="text-amber-300" />
          </div>
          <h1 className="font-montserrat text-3xl md:text-4xl font-black mb-3">ЗНАЙКИ — валюта УЧИСЬПРО</h1>
          <p className="text-white/70 mb-8">
            Учись, заходи каждый день, приглашай друзей — и копи ЗНАЙКИ. <br />
            1 ЗНАЙКА = 1 ₽ скидки при оплате курса (до 30% стоимости).
          </p>
          <Button onClick={openLogin} size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500">
            Войти, чтобы начать копить
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Мои ЗНАЙКИ — баланс и достижения"
        description="Личный баланс ЗНАЕК, уровень, серия дней и достижения в УЧИСЬПРО."
        canonical="https://учисьпро.рф/znaika"
        noindex
      />

      {flash && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-fade-in ${
          flash.type === "ok"
            ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-100"
            : "bg-white/10 border-white/20 text-white"
        }`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name={flash.type === "ok" ? "CheckCircle2" : "Info"} size={16} />
            {flash.msg}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">
        {/* Хедер страницы */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/cabinet" className="text-white/60 hover:text-white text-sm flex items-center gap-1">
              <Icon name="ChevronLeft" size={16} />
              В кабинет
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            disabled={loading}
            className="text-white/60 hover:text-white"
          >
            <Icon name="RefreshCw" size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Главная карточка баланса */}
        <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-cyan-500/10 p-6 md:p-8 mb-6">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-500/20 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-white/60 text-sm mb-2 font-medium tracking-wide">Баланс ЗНАЕК</div>
              <div className="flex items-baseline gap-3">
                <span className="font-montserrat text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent">
                  {state ? formatZnaika(state.balance) : "—"}
                </span>
                <Icon name="Coins" size={28} className="text-amber-300" />
              </div>
              <div className="text-white/50 text-xs mt-2">
                ≈ скидка {state ? formatZnaika(Math.min(state.balance, Math.floor(state.balance))) : "0"} ₽ при оплате курса
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white/50 text-xs">Уровень</div>
                <div className="font-montserrat text-2xl font-bold text-white">
                  {state?.level ?? 1}
                </div>
                <div className="text-purple-200 text-xs font-medium">{levelName}</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-right">
                <div className="text-white/50 text-xs">Серия</div>
                <div className="flex items-center justify-end gap-1.5">
                  <Icon name="Flame" size={20} className="text-orange-400" />
                  <span className="font-montserrat text-2xl font-bold text-white">
                    {state?.current_streak ?? 0}
                  </span>
                </div>
                <div className="text-orange-200/70 text-xs">дней подряд</div>
              </div>
            </div>
          </div>

          {/* Прогресс уровня */}
          {state?.next_level_at && (
            <div className="relative mt-6">
              <div className="flex items-center justify-between text-xs text-white/55 mb-1.5">
                <span>До уровня {state.level + 1}</span>
                <span>{formatZnaika(state.total_earned)} / {formatZnaika(state.next_level_at)}</span>
              </div>
              <Progress value={levelProgress} className="h-1.5 bg-white/10" />
            </div>
          )}

          {/* Чек-ин */}
          <div className="relative mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Button
              onClick={handleCheckIn}
              disabled={checking}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-orange-500/20"
            >
              <Icon name="Calendar" size={16} className="mr-2" />
              {checking ? "Записываю..." : "Отметиться сегодня (+10)"}
            </Button>
            <div className="text-xs text-white/55 leading-relaxed">
              7 дней подряд = <span className="text-amber-200 font-semibold">+50 бонус</span>,&nbsp;
              30 дней = <span className="text-amber-200 font-semibold">+200 бонус</span>
            </div>
          </div>
        </Card>

        {/* Сводка */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon="TrendingUp" label="Всего заработано" value={state ? formatZnaika(state.total_earned) : "—"} accent="text-emerald-300" />
          <StatCard icon="TrendingDown" label="Потрачено" value={state ? formatZnaika(state.total_spent) : "—"} accent="text-rose-300" />
          <StatCard icon="Award" label="Достижений" value={`${earnedAchievements.length} / ${state?.achievements.length ?? 0}`} accent="text-purple-300" />
          <StatCard icon="Trophy" label="Лучшая серия" value={`${state?.longest_streak ?? 0} дн.`} accent="text-amber-300" />
        </div>

        {/* Как заработать */}
        <div className="mb-8">
          <h2 className="font-montserrat text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Sparkles" size={20} className="text-amber-300" />
            Как заработать ЗНАЙКИ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <EarnRow icon="Calendar" title="Ежедневный вход" reward="+5" hint="каждый день · бонус +25 за 7 дней, +100 за 30" />
            <EarnRow icon="BookOpen" title="Прохождение урока" reward="+3" hint="до 10 уроков в день" />
            <EarnRow icon="ShoppingBag" title="Покупка курса" reward="+2%" hint="кэшбек ЗНАЙКАМИ от суммы покупки" />
            <EarnRow icon="UserPlus" title="Привёл друга" reward="+500 / +300" hint="за регистрацию и за первую покупку друга" />
            <EarnRow icon="MessageSquare" title="Отзыв о курсе" reward="+50" hint="развёрнутый отзыв от 100 символов" />
            <EarnRow icon="Trophy" title="Достижения" reward="+50…+5000" hint="за прохождение этапов и марафонов" />
          </div>
        </div>

        {/* Магазин ЗНАЕК */}
        <div className="mb-8">
          <ZnaikaShop />
        </div>

        {/* Достижения */}
        <div className="mb-8">
          <h2 className="font-montserrat text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Medal" size={20} className="text-purple-300" />
            Достижения
            <span className="text-sm text-white/40 font-normal ml-2">
              {earnedAchievements.length} / {state?.achievements.length ?? 0}
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...earnedAchievements, ...lockedAchievements].map((a) => (
              <AchievementCard key={a.code} a={a} />
            ))}
          </div>
        </div>

        {/* История */}
        <div>
          <h2 className="font-montserrat text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="History" size={20} className="text-cyan-300" />
            История начислений
          </h2>
          <Card className="border border-white/10 bg-white/[0.02] divide-y divide-white/5">
            {(!state?.transactions || state.transactions.length === 0) && (
              <div className="text-white/50 text-sm text-center py-10">
                Пока пусто. Отметься сегодня — и появится первая запись.
              </div>
            )}
            {state?.transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                    tx.kind === "earn" ? "bg-emerald-500/10 border-emerald-400/25" : "bg-rose-500/10 border-rose-400/25"
                  }`}>
                    <Icon
                      name={tx.kind === "earn" ? "Plus" : "Minus"}
                      size={14}
                      className={tx.kind === "earn" ? "text-emerald-300" : "text-rose-300"}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {tx.description || REASON_LABEL[tx.reason] || tx.reason}
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(tx.created_at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </div>
                </div>
                <div className={`font-montserrat font-bold text-sm flex-shrink-0 ${tx.amount > 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {tx.amount > 0 ? "+" : ""}{formatZnaika(tx.amount)}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Куда потратить */}
        <Card className="mt-8 border border-white/10 bg-gradient-to-br from-purple-500/8 to-cyan-500/8 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center flex-shrink-0">
              <Icon name="Gift" size={22} className="text-purple-200" />
            </div>
            <div className="flex-1">
              <h3 className="font-montserrat text-lg font-bold mb-1">На что потратить ЗНАЙКИ</h3>
              <p className="text-white/65 text-sm mb-4">
                Оплати до <span className="text-purple-200 font-semibold">{state?.discount_percent ?? 30}%</span> стоимости любого курса.
                1 ЗНАЙКА = 1 ₽ скидки. {user?.name ? `${user.name}, ` : ""}твоя текущая макс. скидка: <span className="text-amber-300 font-bold">{state ? formatZnaika(state.balance) : "0"} ₽</span>.
              </p>
              <Link to="/courses">
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400">
                  Выбрать курс
                  <Icon name="ArrowRight" size={14} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <SiteFooter />
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (
    <Card className="border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-white/55 text-xs mb-2">
        <Icon name={icon} size={14} className={accent} />
        {label}
      </div>
      <div className={`font-montserrat font-bold text-xl ${accent}`}>{value}</div>
    </Card>
  );
}

function EarnRow({ icon, title, reward, hint }: { icon: string; title: string; reward: string; hint: string }) {
  return (
    <Card className="border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size={18} className="text-amber-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-sm text-white">{title}</div>
          <span className="font-montserrat font-bold text-amber-300 text-sm">{reward}</span>
        </div>
        <div className="text-white/50 text-xs">{hint}</div>
      </div>
    </Card>
  );
}

function AchievementCard({ a }: { a: ZnaikaAchievement }) {
  return (
    <Card className={`border p-3 transition-all ${
      a.earned
        ? TIER_COLORS[a.tier] || TIER_COLORS.common
        : "border-white/8 bg-white/[0.015] opacity-55"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          a.earned
            ? "bg-gradient-to-br from-amber-400/25 to-orange-500/20 border border-amber-400/30"
            : "bg-white/5 border border-white/10"
        }`}>
          <Icon
            name={a.earned ? a.icon : "Lock"}
            size={18}
            className={a.earned ? "text-amber-200" : "text-white/40"}
            fallback="Award"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white truncate">{a.title}</div>
          <div className="text-xs text-white/55 leading-snug">{a.description}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/15 text-white/55">
              {TIER_LABEL[a.tier]}
            </Badge>
            <span className="text-amber-300 text-xs font-bold">+{a.reward}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}