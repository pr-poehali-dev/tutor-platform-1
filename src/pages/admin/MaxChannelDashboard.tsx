import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import func2url from "../../../backend/func2url.json";

const AGENT_URL = (func2url as Record<string, string>)["max-channel-agent"];
const PIN_KEY = "uchispro_admin_pin_v1";
const ADMIN_PIN = "7777";

interface Leader {
  name: string;
  count: number;
}
interface ActiveContest {
  week_ref: string;
  prize_label: string;
  started_at: string | null;
  participants: number;
  leaders: Leader[];
}
interface HistoryItem {
  week_ref: string;
  prize_label: string;
  winner: string;
  finished_at: string | null;
}
interface RecentPost {
  kind: string;
  ok: boolean;
  at: string | null;
  ref: string | null;
}
interface Dashboard {
  channel_linked: boolean;
  channel_title: string | null;
  channel_link: string;
  enabled: boolean;
  total_posted: number;
  welcomed_users: number;
  has_bot_token: boolean;
  post_window: string;
  recent: RecentPost[];
  active_contest: ActiveContest | null;
  contest_history: HistoryItem[];
}

const KIND_LABELS: Record<string, string> = {
  feed_article: "Анонс статьи",
  weekly_digest: "Дайджест недели",
  contest_start: "Старт конкурса",
  contest_reminder: "Напоминание о конкурсе",
  contest_finish: "Итоги конкурса",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function MaxChannelDashboard() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");

  const load = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${AGENT_URL}?action=dashboard`, {
        headers: { "X-Admin-Pin": p },
      });
      if (res.status === 403) {
        sessionStorage.removeItem(PIN_KEY);
        localStorage.removeItem(PIN_KEY);
        setUnlocked(false);
        setError("Неверный PIN — войди заново");
        setData(null);
        return;
      }
      if (!res.ok) throw new Error("failed");
      setData(await res.json());
      setError("");
    } catch {
      setError("Не удалось загрузить данные. Попробуй обновить.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY);
    if (saved === ADMIN_PIN) {
      setPin(saved);
      setUnlocked(true);
      load(saved);
    }
  }, [load]);

  const tryUnlock = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(PIN_KEY, pin);
      setUnlocked(true);
      setError("");
      load(pin);
    } else {
      setError("Неверный PIN");
    }
  };

  const act = async (action: string) => {
    setBusy(action);
    try {
      await fetch(`${AGENT_URL}?action=${action}`, {
        method: "POST",
        headers: { "X-Admin-Pin": pin, "Content-Type": "application/json" },
        body: "{}",
      });
      await load(pin);
    } finally {
      setBusy("");
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <Helmet>
          <title>Канал MAX · управление</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Card className="w-full max-w-sm border border-white/10 bg-white/[0.03] p-7">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <Icon name="Lock" size={22} className="text-white/80" />
          </div>
          <h1 className="font-montserrat text-xl font-black text-center mb-2">Канал в MAX</h1>
          <p className="text-white/55 text-sm text-center mb-5">Введи PIN для входа</p>
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
            className="text-center font-mono tracking-widest"
          />
          {error && <p className="text-rose-400 text-xs text-center mt-2">{error}</p>}
          <Button onClick={tryUnlock} className="w-full mt-4 bg-gradient-to-r from-sky-500 to-blue-600">
            Войти
          </Button>
          <Link to="/admin" className="block text-center text-white/40 text-xs mt-4 hover:text-white/70">
            ← В админ-хаб
          </Link>
        </Card>
      </div>
    );
  }

  const ac = data?.active_contest;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Канал MAX · управление · УЧИСЬПРО</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="text-white/40 text-xs mb-1">Внутренний раздел</div>
            <h1 className="font-montserrat text-3xl md:text-4xl font-black flex items-center gap-3">
              <Icon name="Send" size={28} className="text-sky-400" />
              Канал в MAX
            </h1>
            <p className="text-white/55 text-sm mt-1">
              ИИ-агент сам ведёт канал, проводит конкурсы и приглашает новичков
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => load(pin)} disabled={loading} className="text-white/55 hover:text-white">
            <Icon name="RefreshCw" size={14} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>

        {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}

        {data && (
          <>
            {/* Статус и переключатель */}
            <Card className="border border-white/10 bg-white/[0.03] p-5 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${data.enabled ? "bg-emerald-400" : "bg-white/30"}`}
                  />
                  <div>
                    <div className="font-bold text-white">
                      {data.channel_title || "Канал"} ·{" "}
                      <span className={data.enabled ? "text-emerald-400" : "text-white/50"}>
                        {data.enabled ? "Автопилот включён" : "Автопилот выключен"}
                      </span>
                    </div>
                    <div className="text-white/45 text-xs mt-0.5">
                      Публикации: {data.post_window} · бот {data.has_bot_token ? "подключён" : "не настроен"}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => act("toggle")}
                  disabled={busy === "toggle"}
                  className={data.enabled ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gradient-to-r from-emerald-500 to-green-600"}
                >
                  {data.enabled ? "Выключить" : "Включить"}
                </Button>
              </div>
            </Card>

            {/* Быстрое наполнение канала */}
            {data.total_posted < 3 && (
              <Card className="border border-sky-400/25 bg-gradient-to-br from-sky-500/[0.07] to-transparent p-5 mb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Icon name="Rocket" size={20} className="text-sky-400 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Наполнить канал стартовыми постами</div>
                      <div className="text-white/50 text-xs mt-0.5">
                        Приветствие, рассказ о платформе, полезный лайфхак и запуск первого конкурса
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => act("seed_posts")}
                    disabled={busy === "seed_posts"}
                    className="bg-gradient-to-r from-sky-500 to-blue-600"
                  >
                    {busy === "seed_posts" ? "Публикую…" : "Опубликовать набор"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Второй набор постов */}
            <Card className="border border-violet-400/25 bg-gradient-to-br from-violet-500/[0.07] to-transparent p-5 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon name="Sparkles" size={20} className="text-violet-400 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Опубликовать следующий набор постов</div>
                    <div className="text-white/50 text-xs mt-0.5">
                      Новые темы с картинками: модуль «Малыш», подготовка к ЕГЭ и ОГЭ, мотивация на учёбу
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => act("seed_posts_2")}
                  disabled={busy === "seed_posts_2"}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  {busy === "seed_posts_2" ? "Публикую…" : "Опубликовать набор"}
                </Button>
              </div>
            </Card>

            {/* Метрики */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              {[
                { label: "Постов опубликовано", value: data.total_posted, icon: "MessageSquare", color: "text-sky-300" },
                { label: "Приглашено новичков", value: data.welcomed_users, icon: "UserPlus", color: "text-emerald-300" },
                { label: "Участников конкурса", value: ac?.participants ?? 0, icon: "Trophy", color: "text-amber-300" },
              ].map((m) => (
                <Card key={m.label} className="border border-white/10 bg-white/[0.03] p-4">
                  <Icon name={m.icon} size={18} className={`${m.color} mb-2`} />
                  <div className="text-2xl font-black text-white">{m.value}</div>
                  <div className="text-white/50 text-xs">{m.label}</div>
                </Card>
              ))}
            </div>

            {/* Активный конкурс */}
            <Card className="border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.06] to-transparent p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-montserrat font-bold text-white flex items-center gap-2">
                  <Icon name="Gift" size={18} className="text-amber-400" />
                  Конкурс недели
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => act("start_now")} disabled={busy === "start_now"} className="text-emerald-300 hover:text-emerald-200">
                    <Icon name="Play" size={13} className="mr-1" /> Запустить
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => act("finish_now")} disabled={busy === "finish_now"} className="text-rose-300 hover:text-rose-200">
                    <Icon name="Flag" size={13} className="mr-1" /> Подвести итоги
                  </Button>
                </div>
              </div>
              {ac ? (
                <>
                  <div className="text-white/80 text-sm mb-1">🏆 Приз: {ac.prize_label}</div>
                  <div className="text-white/45 text-xs mb-4">
                    Неделя {ac.week_ref} · старт {fmtDate(ac.started_at)} · участников: {ac.participants}
                  </div>
                  {ac.leaders.length > 0 ? (
                    <div className="space-y-1.5">
                      {ac.leaders.map((l, i) => (
                        <div key={`${l.name}-${i}`} className="flex items-center gap-3 text-sm">
                          <span className="w-6 text-center">{["🥇", "🥈", "🥉"][i] || `${i + 1}.`}</span>
                          <span className="flex-1 text-white/85 truncate">{l.name}</span>
                          <span className="text-amber-300 font-bold">{l.count} акт.</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm">Пока нет активности — ждём участников</p>
                  )}
                </>
              ) : (
                <p className="text-white/50 text-sm">
                  Активного конкурса нет. Запустится автоматически в понедельник или нажми «Запустить».
                </p>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* История конкурсов */}
              <Card className="border border-white/10 bg-white/[0.03] p-5">
                <h2 className="font-montserrat font-bold text-white mb-3 flex items-center gap-2">
                  <Icon name="History" size={16} className="text-white/60" />
                  Прошлые конкурсы
                </h2>
                {data.contest_history.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.contest_history.map((h) => (
                      <div key={h.week_ref} className="text-sm border-b border-white/5 pb-2 last:border-0">
                        <div className="text-white/85">🏆 {h.winner}</div>
                        <div className="text-white/40 text-xs">{h.prize_label} · {fmtDate(h.finished_at)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">Ещё не было завершённых конкурсов</p>
                )}
              </Card>

              {/* Последние посты */}
              <Card className="border border-white/10 bg-white/[0.03] p-5">
                <h2 className="font-montserrat font-bold text-white mb-3 flex items-center gap-2">
                  <Icon name="Newspaper" size={16} className="text-white/60" />
                  Последние публикации
                </h2>
                {data.recent.length > 0 ? (
                  <div className="space-y-2">
                    {data.recent.map((p, i) => (
                      <div key={`${p.kind}-${i}`} className="flex items-center gap-2 text-sm">
                        <Icon name={p.ok ? "CheckCircle2" : "XCircle"} size={14} className={p.ok ? "text-emerald-400" : "text-rose-400"} />
                        <span className="flex-1 text-white/80">{KIND_LABELS[p.kind] || p.kind}</span>
                        <span className="text-white/35 text-xs">{fmtDate(p.at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">Публикаций пока нет</p>
                )}
              </Card>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs">
              <a href={data.channel_link} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200">
                Открыть канал в MAX →
              </a>
              <Link to="/admin" className="text-white/35 hover:text-white/60">
                ← В админ-хаб
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}