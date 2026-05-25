import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import func2url from "../../../backend/func2url.json";

interface CheckResult {
  name: string;
  status: "ok" | "warn" | "error" | "pending";
  detail?: string;
  durationMs?: number;
}

/** Админ-страница «Здоровье сайта»: проверяет доступность всех backend-функций и ключевых страниц. */
export default function SiteHealth() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);

  const runChecks = async () => {
    setRunning(true);
    const results: CheckResult[] = [];
    const urls = func2url as Record<string, string>;

    // 1) Проверяем backend-функции через OPTIONS (preflight)
    for (const [name, url] of Object.entries(urls)) {
      const started = performance.now();
      try {
        const res = await fetch(url, { method: "OPTIONS" });
        const duration = Math.round(performance.now() - started);
        if (res.ok || res.status === 200 || res.status === 204) {
          results.push({ name: `backend/${name}`, status: "ok", detail: `HTTP ${res.status}`, durationMs: duration });
        } else {
          results.push({ name: `backend/${name}`, status: "warn", detail: `HTTP ${res.status}`, durationMs: duration });
        }
      } catch (e) {
        const duration = Math.round(performance.now() - started);
        results.push({
          name: `backend/${name}`,
          status: "error",
          detail: e instanceof Error ? e.message : "Нет ответа",
          durationMs: duration,
        });
      }
      setChecks([...results]);
    }

    // 2) Проверка ключевых ассетов
    const assets = ["/robots.txt", "/sitemap.xml", "/favicon.svg"];
    for (const path of assets) {
      const started = performance.now();
      try {
        const res = await fetch(path, { method: "HEAD" });
        const duration = Math.round(performance.now() - started);
        results.push({
          name: `asset ${path}`,
          status: res.ok ? "ok" : "warn",
          detail: `HTTP ${res.status}`,
          durationMs: duration,
        });
      } catch {
        results.push({ name: `asset ${path}`, status: "error", detail: "Не загрузился" });
      }
      setChecks([...results]);
    }

    // 3) Проверка наличия Метрики
    const hasMetrika = typeof window !== "undefined" && typeof (window as unknown as { ym?: unknown }).ym === "function";
    results.push({
      name: "Яндекс.Метрика",
      status: hasMetrika ? "ok" : "warn",
      detail: hasMetrika ? "Скрипт ym() загружен" : "Скрипт ym() не найден",
    });
    setChecks([...results]);

    // 4) Проверка localStorage
    try {
      localStorage.setItem("__health__", "1");
      localStorage.removeItem("__health__");
      results.push({ name: "localStorage", status: "ok", detail: "Доступен" });
    } catch {
      results.push({ name: "localStorage", status: "warn", detail: "Заблокирован" });
    }
    setChecks([...results]);

    setRunning(false);
  };

  useEffect(() => {
    runChecks();
     
  }, []);

  const okCount = checks.filter((c) => c.status === "ok").length;
  const errorCount = checks.filter((c) => c.status === "error").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  const statusStyle: Record<CheckResult["status"], { cls: string; icon: string }> = {
    ok: { cls: "bg-emerald-500/15 border-emerald-500/35 text-emerald-300", icon: "CheckCircle2" },
    warn: { cls: "bg-amber-500/15 border-amber-500/35 text-amber-300", icon: "AlertTriangle" },
    error: { cls: "bg-rose-500/15 border-rose-500/35 text-rose-300", icon: "XCircle" },
    pending: { cls: "bg-white/8 border-white/15 text-white/55", icon: "Loader2" },
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Здоровье сайта — УЧИСЬПРО (админ)"
        description="Проверка доступности backend-функций, ассетов и аналитики."
        noindex
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide">УЧИСЬПРО</span>
          </Link>
          <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">Админ · Здоровье</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 rounded-full px-4 py-1.5 mb-5">
          <Icon name="HeartPulse" size={14} className="text-emerald-300" />
          <span className="text-sm text-emerald-200 font-bold uppercase tracking-wider">Site health</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Здоровье <span className="gradient-text-purple">сайта</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mb-8">
          Автоматическая проверка backend-функций, ассетов и аналитики. Запускается при открытии страницы.
        </p>

        {/* Сводка */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl">✅</p>
            <p className="font-montserrat font-black text-white text-2xl tabular-nums mt-1">{okCount}</p>
            <p className="text-white/45 text-xs">Работают</p>
          </div>
          <div className="bg-card border border-amber-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl">⚠️</p>
            <p className="font-montserrat font-black text-white text-2xl tabular-nums mt-1">{warnCount}</p>
            <p className="text-white/45 text-xs">Предупреждения</p>
          </div>
          <div className="bg-card border border-rose-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl">❌</p>
            <p className="font-montserrat font-black text-white text-2xl tabular-nums mt-1">{errorCount}</p>
            <p className="text-white/45 text-xs">Ошибки</p>
          </div>
        </div>

        <button
          onClick={runChecks}
          disabled={running}
          className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-60"
        >
          <Icon name={running ? "Loader2" : "RefreshCw"} size={14} className={running ? "animate-spin" : ""} />
          {running ? "Проверяю..." : "Перепроверить"}
        </button>

        {/* Список проверок */}
        <div className="space-y-2">
          {checks.length === 0 && (
            <div className="bg-card border border-white/10 rounded-2xl p-8 text-center text-white/55 text-sm">
              <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-3 text-purple-300" />
              Запускаю проверки...
            </div>
          )}
          {checks.map((c, i) => {
            const s = statusStyle[c.status];
            return (
              <div
                key={i}
                className={`flex items-center gap-3 border rounded-2xl px-4 py-3 ${s.cls.replace("text-", "bg-").split(" ")[0].replace("bg-", "bg-")} ${s.cls}`}
              >
                <Icon name={s.icon} size={18} className={c.status === "pending" ? "animate-spin" : ""} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-semibold truncate">{c.name}</p>
                  {c.detail && <p className="text-xs opacity-75 truncate">{c.detail}</p>}
                </div>
                {c.durationMs !== undefined && (
                  <span className="text-xs tabular-nums opacity-65 flex-shrink-0">{c.durationMs} мс</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Полезные ссылки админа */}
        <div className="mt-8 grid sm:grid-cols-3 gap-3">
          <Link to="/admin/ads" className="bg-card border border-white/10 hover:border-white/25 rounded-2xl p-4 transition-colors">
            <Icon name="Megaphone" size={18} className="text-amber-300 mb-2" />
            <p className="text-white font-semibold text-sm">Менеджер рекламы</p>
            <p className="text-white/45 text-xs mt-1">Объявления для Директа</p>
          </Link>
          <Link to="/admin/yookassa-setup" className="bg-card border border-white/10 hover:border-white/25 rounded-2xl p-4 transition-colors">
            <Icon name="CreditCard" size={18} className="text-cyan-300 mb-2" />
            <p className="text-white font-semibold text-sm">Платежи ЮKassa</p>
            <p className="text-white/45 text-xs mt-1">Настройка приёма</p>
          </Link>
          <a href="https://metrika.yandex.ru" target="_blank" rel="noreferrer" className="bg-card border border-white/10 hover:border-white/25 rounded-2xl p-4 transition-colors">
            <Icon name="BarChart3" size={18} className="text-purple-300 mb-2" />
            <p className="text-white font-semibold text-sm">Яндекс.Метрика</p>
            <p className="text-white/45 text-xs mt-1">Внешний кабинет</p>
          </a>
        </div>
      </div>
    </div>
  );
}
