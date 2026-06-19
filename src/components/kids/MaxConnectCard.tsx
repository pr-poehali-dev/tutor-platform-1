import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import func2url from "../../../backend/func2url.json";

const MAX_URL = (func2url as Record<string, string>)["max-bot"];

interface NotifySettings {
  notify_daily_report: boolean;
  notify_reminders: boolean;
  notify_achievements: boolean;
}

interface LinkStatus {
  status: "pending" | "linked" | "revoked";
  link_code: string;
  max_user_name?: string | null;
  bot_username?: string;
  settings: NotifySettings;
}

const TOGGLES: { key: keyof NotifySettings; title: string; desc: string }[] = [
  { key: "notify_daily_report", title: "Ежедневный отчёт", desc: "Чем малыш занимался и сколько ЗНАЕК заработал" },
  { key: "notify_reminders", title: "Напоминания", desc: "Если ребёнок давно не заходил" },
  { key: "notify_achievements", title: "Достижения", desc: "Новые ступеньки и награды" },
];

/** Подключение мессенджера MAX для уведомлений родителю о занятиях ребёнка. */
export default function MaxConnectCard() {
  const { token, isAuthenticated, openLogin } = useAuth();
  const [data, setData] = useState<LinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const call = useCallback(
    async (action: string, method: "GET" | "POST", body?: object) => {
      const res = await fetch(`${MAX_URL}?action=${action}`, {
        method,
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        ...(method === "POST" ? { body: JSON.stringify(body || {}) } : {}),
      });
      return res.json();
    },
    [token]
  );

  const load = useCallback(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    call("link_status", "GET")
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [call, token]);

  useEffect(() => { load(); }, [load]);

  const copyCode = () => {
    if (!data) return;
    navigator.clipboard?.writeText(data.link_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const toggle = async (key: keyof NotifySettings) => {
    if (!data) return;
    const next = { ...data.settings, [key]: !data.settings[key] };
    setData({ ...data, settings: next });
    setBusy(true);
    await call("update_settings", "POST", next).catch(() => {});
    setBusy(false);
  };

  const unlink = async () => {
    setBusy(true);
    await call("unlink", "POST").catch(() => {});
    setBusy(false);
    load();
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-600/15 to-blue-600/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="MessageCircle" size={18} className="text-violet-300" />
          <h3 className="text-white font-bold text-sm">Уведомления в MAX</h3>
        </div>
        <p className="text-white/55 text-xs mb-3">Войдите в аккаунт, чтобы получать отчёты о занятиях ребёнка в мессенджере MAX.</p>
        <button onClick={openLogin} className="text-violet-300 text-sm font-bold hover:text-violet-200">Войти →</button>
      </div>
    );
  }

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/50 text-sm">Загрузка…</div>;
  }

  const linked = data?.status === "linked";

  return (
    <div className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-600/15 to-blue-600/10 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="MessageCircle" size={18} className="text-violet-300" />
        <h3 className="text-white font-bold text-sm">Уведомления в MAX</h3>
        {linked && (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/25 rounded-full px-2 py-0.5">
            <Icon name="Check" size={11} /> Подключено
          </span>
        )}
      </div>

      {!linked ? (
        <>
          <p className="text-white/55 text-xs mb-3 leading-relaxed">
            Получайте отчёты о занятиях малыша прямо в мессенджере MAX. Подключение за минуту:
          </p>
          <ol className="text-white/70 text-xs space-y-2 mb-3 list-decimal list-inside">
            <li>Откройте бота{data?.bot_username ? <> <b className="text-white">@{data.bot_username}</b></> : " УЧИСЬПРО"} в MAX</li>
            <li>Отправьте ему команду:</li>
          </ol>
          <div className="flex items-center gap-2 mb-2">
            <code className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white font-mono text-sm tracking-wider">
              /start {data?.link_code}
            </code>
            <button
              onClick={copyCode}
              className="shrink-0 inline-flex items-center gap-1 bg-violet-500/20 border border-violet-400/40 text-violet-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-violet-500/30 transition-colors"
            >
              <Icon name={copied ? "Check" : "Copy"} size={13} />
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </div>
          <p className="text-white/40 text-[11px]">Код привязан к вашему аккаунту — никому его не передавайте.</p>
        </>
      ) : (
        <>
          <p className="text-white/55 text-xs mb-3">
            {data?.max_user_name ? <>Привязан аккаунт <b className="text-white">{data.max_user_name}</b>. </> : null}
            Выберите, что присылать:
          </p>
          <div className="space-y-2 mb-3">
            {TOGGLES.map((row) => (
              <label key={row.key} className="flex items-center justify-between gap-3 cursor-pointer">
                <div className="min-w-0">
                  <p className="text-white/85 text-xs font-bold">{row.title}</p>
                  <p className="text-white/45 text-[11px]">{row.desc}</p>
                </div>
                <button
                  onClick={() => toggle(row.key)}
                  disabled={busy}
                  className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${
                    data?.settings[row.key] ? "bg-violet-500" : "bg-white/15"
                  }`}
                  style={{ height: "1.375rem" }}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      data?.settings[row.key] ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
          <button
            onClick={unlink}
            disabled={busy}
            className="text-white/45 hover:text-rose-300 text-xs font-semibold transition-colors"
          >
            Отключить MAX
          </button>
        </>
      )}
    </div>
  );
}
