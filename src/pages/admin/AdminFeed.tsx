import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import {
  fetchPending, moderate, fetchSources, curatorFetchAll, curatorFetchOne,
  setAdminKey, getAdminKey, clearAdminKey, SourceInfo,
  autoModerate, fetchCronLog, CronRun,
} from "@/components/feed/api";
import { FeedArticle, CATEGORY_META } from "@/components/feed/types";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

function dt(iso: string | null): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}

export default function AdminFeed() {
  const [adminKey, setAdminKeyState] = useState(getAdminKey());
  const [unlocked, setUnlocked] = useState(!!getAdminKey());

  const [pending, setPending] = useState<FeedArticle[]>([]);
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [cronRuns, setCronRuns] = useState<CronRun[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingSources, setLoadingSources] = useState(true);

  const [running, setRunning] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const refreshAll = async () => {
    setLoadingPending(true);
    setLoadingSources(true);
    const [p, s, c] = await Promise.all([fetchPending(), fetchSources(), fetchCronLog()]);
    setPending(p);
    setSources(s);
    setCronRuns(c);
    setLoadingPending(false);
    setLoadingSources(false);
  };

  const handleAutoModerate = async () => {
    setRunning("ИИ-модератор анализирует статьи читателей...");
    setLog((l) => ["⏳ Запуск автомодерации pending-статей...", ...l]);
    const res = await autoModerate(30);
    setRunning(null);
    if (res.ok) {
      setLog((l) => [
        `✓ Автомодерация: проверено ${res.moderated}, одобрено ${res.approved}, отклонено ${res.rejected}, на флаге ${res.flagged}`,
        ...(res.details || []).map((d) =>
          `  ${d.verdict === "approve" ? "✓" : d.verdict === "reject" ? "✗" : "⚠"} #${d.id} (${d.score}/100): ${d.title}`
        ),
        ...l,
      ].slice(0, 60));
      refreshAll();
    } else {
      setLog((l) => ["✗ Автомодерация не отработала. Проверь ADMIN_KEY и POLZA_API_KEY.", ...l]);
    }
  };

  useEffect(() => {
    if (unlocked) refreshAll();
  }, [unlocked]);

  const handleUnlock = () => {
    if (!adminKey.trim()) return;
    setAdminKey(adminKey.trim());
    setUnlocked(true);
  };

  const handleLock = () => {
    clearAdminKey();
    setAdminKey("");
    setUnlocked(false);
    setPending([]);
    setSources([]);
  };

  const handleModerate = async (id: number, decision: "approve" | "reject") => {
    let reason: string | undefined;
    if (decision === "reject") {
      reason = prompt("Причина отклонения (вернётся автору):") || undefined;
      if (reason === undefined) return;
    }
    const ok = await moderate(id, decision, reason);
    if (ok) {
      setPending((prev) => prev.filter((a) => a.id !== id));
      setLog((l) => [`✓ ${decision === "approve" ? "Опубликовано" : "Отклонено"}: #${id}`, ...l].slice(0, 20));
    } else {
      setLog((l) => [`✗ Ошибка модерации #${id}`, ...l].slice(0, 20));
    }
  };

  const handleFetchAll = async () => {
    setRunning("ИИ-куратор обходит все источники...");
    setLog((l) => ["⏳ Запуск ИИ-куратора по всем источникам...", ...l]);
    const res = await curatorFetchAll(3);
    setRunning(null);
    if (res.ok) {
      setLog((l) => [
        `✓ ИИ-куратор: создано ${res.total_created} статей из ${res.results?.length || 0} источников`,
        ...(res.results || []).map((r) =>
          r.error ? `  ✗ ${r.source}: ${r.error}` : `  + ${r.source}: ${r.created || 0} статей`
        ),
        ...l,
      ].slice(0, 50));
      refreshAll();
    } else {
      setLog((l) => ["✗ ИИ-куратор не отработал. Проверь ADMIN_KEY и доступ к источникам.", ...l]);
    }
  };

  const handleFetchOne = async (code: string) => {
    setRunning(`Обработка ${code}...`);
    setLog((l) => [`⏳ Запуск источника ${code}...`, ...l]);
    const res = await curatorFetchOne(code, 5);
    setRunning(null);
    if (res.ok && res.result) {
      const r = res.result;
      setLog((l) => [
        r.error ? `✗ ${code}: ${r.error}` : `✓ ${code}: создано ${r.created || 0} статей`,
        ...l,
      ].slice(0, 50));
      refreshAll();
    } else {
      setLog((l) => [`✗ ${code}: ошибка запуска`, ...l]);
    }
  };

  // ─── Экран ввода ключа ───────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-4">
        <Seo title="Админ-панель Ленты — УЧИСЬПРО" description="Модерация статей и управление ИИ-куратором." canonical={`${SITE_URL}/admin/feed`} noindex />
        <div className="max-w-md w-full bg-card border border-white/10 rounded-3xl p-6 md:p-7">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="font-montserrat font-black text-2xl mb-1">Админ-панель «Лента»</h1>
            <p className="text-white/55 text-sm">Введи секретный ключ для модерации статей</p>
          </div>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKeyState(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="ADMIN_KEY"
            className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 mb-3"
          />
          <button
            onClick={handleUnlock}
            disabled={!adminKey.trim()}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            <Icon name="LogIn" size={14} />
            Войти
          </button>
          <Link to="/feed" className="block text-center text-white/45 hover:text-white text-xs mt-4">
            ← Вернуться в публичную ленту
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Админ-панель Ленты — УЧИСЬПРО" description="Модерация статей и управление ИИ-куратором." canonical={`${SITE_URL}/admin/feed`} noindex />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">Админ · Лента</span>
          <button
            onClick={handleLock}
            className="inline-flex items-center gap-1 bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg"
          >
            <Icon name="Lock" size={11} />
            Выйти
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* ─── ИИ-АГЕНТ ─── */}
        <section className="bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 rounded-3xl p-5 md:p-6">
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Bot" size={16} className="text-cyan-300" />
                <span className="text-cyan-300 text-[11px] uppercase tracking-wider font-bold">ИИ-куратор</span>
              </div>
              <h2 className="font-montserrat font-black text-white text-xl md:text-2xl">Менеджер модуля «Лента»</h2>
              <p className="text-white/65 text-sm mt-1 max-w-2xl">
                Парсит RSS-ленты выбранных источников, рерайтит тексты через ИИ под формат «Хочу всё знать» и публикует в общую ленту.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleFetchAll}
                disabled={!!running}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {running ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Sparkles" size={14} />}
                Обход источников
              </button>
              <button
                onClick={handleAutoModerate}
                disabled={!!running}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-black text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {running ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="ShieldCheck" size={14} />}
                Автомодерация pending
              </button>
            </div>
          </div>

          {/* Информация об автозапуске */}
          <div className="bg-black/20 border border-white/10 rounded-xl p-3 mb-3 flex items-start gap-2 flex-wrap">
            <Icon name="Clock" size={14} className="text-cyan-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 text-xs">
              <p className="text-white font-bold mb-0.5">Автоматический запуск раз в 6 часов</p>
              <p className="text-white/55">
                Cron (по расписанию <code className="text-cyan-300">0 */6 * * *</code>) запускает обход источников + автомодерацию ожидающих статей пользователей. Ничего нажимать не нужно.
              </p>
            </div>
          </div>

          {running && (
            <div className="bg-white/[0.05] border border-white/10 rounded-xl p-3 mb-3 text-cyan-200 text-xs flex items-center gap-2">
              <Icon name="Loader2" size={14} className="animate-spin" />
              {running}
            </div>
          )}

          {/* Источники */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {loadingSources ? (
              <p className="text-white/45 text-sm col-span-full text-center py-4">Загружаю источники...</p>
            ) : sources.length === 0 ? (
              <p className="text-white/45 text-sm col-span-full text-center py-4">Нет настроенных источников. Проверь админский ключ.</p>
            ) : sources.map((s) => {
              const meta = CATEGORY_META[s.category];
              return (
                <div key={s.code} className="bg-white/[0.04] border border-white/10 rounded-2xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm">{meta?.emoji}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${meta?.tone.split(" ")[0] || "text-white"}`}>{meta?.label}</span>
                      </div>
                      <p className="font-bold text-white text-sm leading-tight truncate">{s.name}</p>
                      <p className="text-white/45 text-[10px] truncate">{s.code}</p>
                    </div>
                    <button
                      onClick={() => handleFetchOne(s.code)}
                      disabled={!!running}
                      className="bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-100 text-xs font-bold px-2.5 py-1 rounded-lg disabled:opacity-50 flex-shrink-0"
                    >
                      <Icon name="Play" size={11} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/45">
                    <span>Обновлено: {dt(s.last_fetched_at)}</span>
                    {s.last_fetch_count !== null && (
                      <span className="text-emerald-300 font-bold">+{s.last_fetch_count}</span>
                    )}
                  </div>
                  {s.last_error && (
                    <p className="text-rose-300 text-[10px] mt-1 truncate" title={s.last_error}>
                      ⚠ {s.last_error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Лог */}
          {log.length > 0 && (
            <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto">
              <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1">Лог операций</p>
              <div className="space-y-0.5 font-mono text-[11px]">
                {log.map((line, i) => (
                  <div key={i} className={
                    line.startsWith("✓") ? "text-emerald-300" :
                    line.startsWith("✗") ? "text-rose-300" :
                    line.startsWith("⏳") ? "text-cyan-300" :
                    "text-white/65"
                  }>{line}</div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ─── ИСТОРИЯ CRON-ЗАПУСКОВ ─── */}
        <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="History" size={16} className="text-cyan-300" />
              <span className="text-cyan-300 text-[11px] uppercase tracking-wider font-bold">Автозапуски</span>
            </div>
            <span className="text-white/55 text-xs">Раз в 6 часов · последних: <span className="text-white font-bold">{cronRuns.length}</span></span>
          </div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">История работы ИИ-агента</h2>

          {cronRuns.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-white/55 text-sm mb-1">Cron ещё ни разу не запускался</p>
              <p className="text-white/35 text-xs">
                Первый автозапуск произойдёт в ближайшие 6 часов или нажми «Обход источников» вручную.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cronRuns.map((r) => {
                const isError = r.status === "error";
                const isRunning = r.status === "running";
                return (
                  <div
                    key={r.id}
                    className={`bg-white/[0.04] border rounded-2xl p-3 ${
                      isError ? "border-rose-500/35" :
                      isRunning ? "border-cyan-500/35 bg-cyan-500/[0.05]" :
                      "border-emerald-500/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Icon
                          name={isError ? "AlertCircle" : isRunning ? "Loader2" : "CheckCircle2"}
                          size={14}
                          className={`${isError ? "text-rose-300" : isRunning ? "text-cyan-300 animate-spin" : "text-emerald-300"}`}
                        />
                        <span className="text-white font-bold text-sm">#{r.id}</span>
                        <span className="text-white/45 text-[11px]">{dt(r.started_at)}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isError ? "bg-rose-500/20 text-rose-200" :
                        isRunning ? "bg-cyan-500/20 text-cyan-200" :
                        "bg-emerald-500/20 text-emerald-200"
                      }`}>
                        {isError ? "Ошибка" : isRunning ? "Выполняется" : "Готово"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="bg-black/20 rounded-lg px-2 py-1.5">
                        <p className="text-white/45 text-[10px] uppercase font-bold">Спарсено</p>
                        <p className="text-white font-bold tabular-nums">+{r.fetched}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg px-2 py-1.5">
                        <p className="text-white/45 text-[10px] uppercase font-bold">Проверено</p>
                        <p className="text-white font-bold tabular-nums">{r.moderated}</p>
                      </div>
                      <div className="bg-emerald-500/10 rounded-lg px-2 py-1.5">
                        <p className="text-emerald-300/65 text-[10px] uppercase font-bold">Одобрено</p>
                        <p className="text-emerald-200 font-bold tabular-nums">{r.approved}</p>
                      </div>
                      <div className="bg-rose-500/10 rounded-lg px-2 py-1.5">
                        <p className="text-rose-300/65 text-[10px] uppercase font-bold">Отклонено</p>
                        <p className="text-rose-200 font-bold tabular-nums">{r.rejected}</p>
                      </div>
                      <div className="bg-amber-500/10 rounded-lg px-2 py-1.5">
                        <p className="text-amber-300/65 text-[10px] uppercase font-bold">На флаге</p>
                        <p className="text-amber-200 font-bold tabular-nums">{r.flagged}</p>
                      </div>
                    </div>
                    {r.error_message && (
                      <p className="text-rose-300 text-[11px] mt-2 truncate" title={r.error_message}>
                        ⚠ {r.error_message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── МОДЕРАЦИЯ ─── */}
        <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={16} className="text-amber-300" />
              <span className="text-amber-300 text-[11px] uppercase tracking-wider font-bold">Ручная модерация</span>
            </div>
            <span className="text-white/55 text-xs">На рассмотрении: <span className="text-white font-bold">{pending.length}</span></span>
          </div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-1">Статьи пользователей</h2>
          <p className="text-white/55 text-xs mb-4">
            ИИ-модератор уже отметил каждую статью оценкой 0-100. Можешь утвердить вердикт ИИ или принять собственное решение.
          </p>

          {loadingPending ? (
            <p className="text-white/45 text-sm text-center py-8">Загружаю...</p>
          ) : pending.length === 0 ? (
            <div className="text-center py-10 bg-white/[0.03] rounded-2xl">
              <div className="text-4xl mb-2 opacity-50">📭</div>
              <p className="text-white/55 text-sm">Сейчас всё проверено — новых статей на модерации нет.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((a) => {
                const meta = CATEGORY_META[a.category];
                return (
                  <div key={a.id} className={`border rounded-2xl p-4 ${
                    a.auto_moderation_verdict === "flag" ? "bg-amber-500/[0.06] border-amber-500/35" :
                    a.auto_moderation_verdict === "reject" ? "bg-rose-500/[0.05] border-rose-500/30" :
                    "bg-white/[0.04] border-white/10"
                  }`}>
                    <div className="flex items-start gap-3 mb-3 flex-wrap">
                      <div className="text-3xl">{meta.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.tone}`}>
                            {meta.label}
                          </span>
                          <span className="text-white/45 text-[11px]">#{a.id} · {dt(a.created_at)}</span>
                          {a.auto_moderation_verdict && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              a.auto_moderation_verdict === "approve" ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/35" :
                              a.auto_moderation_verdict === "reject" ? "bg-rose-500/15 text-rose-200 border-rose-500/35" :
                              "bg-amber-500/15 text-amber-200 border-amber-500/35"
                            }`} title={a.auto_moderation_reasoning || ""}>
                              <Icon name="Bot" size={10} />
                              ИИ: {a.auto_moderation_verdict === "approve" ? "Одобрить" : a.auto_moderation_verdict === "reject" ? "Отклонить" : "Сомневается"}
                              {typeof a.auto_moderation_score === "number" && (
                                <span className="opacity-65">· {a.auto_moderation_score}/100</span>
                              )}
                            </span>
                          )}
                        </div>
                        <h3 className="font-montserrat font-black text-white text-base md:text-lg leading-tight mb-1">{a.title}</h3>
                        {a.author_display_name && (
                          <p className="text-white/45 text-xs flex items-center gap-1">
                            <Icon name="User" size={11} />
                            Автор: {a.author_display_name}
                          </p>
                        )}
                        {a.auto_moderation_reasoning && (
                          <p className="text-white/55 text-[11px] mt-1.5 italic flex items-start gap-1">
                            <Icon name="Bot" size={10} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                            <span>Объяснение ИИ: {a.auto_moderation_reasoning}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {a.summary && (
                      <p className="text-white/75 text-sm mb-2 italic border-l-2 border-cyan-500/40 pl-3">{a.summary}</p>
                    )}
                    <div className="bg-black/20 border border-white/8 rounded-xl p-3 mb-3 max-h-48 overflow-y-auto">
                      <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{a.content}</p>
                    </div>

                    {a.source_url && (
                      <p className="text-white/45 text-xs mb-3 truncate">
                        Источник: <a href={a.source_url} target="_blank" rel="nofollow noopener noreferrer" className="text-cyan-300 hover:text-cyan-200">{a.source_url}</a>
                      </p>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleModerate(a.id, "approve")}
                        className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-100 text-xs font-bold px-3 py-2 rounded-lg"
                      >
                        <Icon name="Check" size={12} />
                        Одобрить и опубликовать
                      </button>
                      <button
                        onClick={() => handleModerate(a.id, "reject")}
                        className="inline-flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-100 text-xs font-bold px-3 py-2 rounded-lg"
                      >
                        <Icon name="X" size={12} />
                        Отклонить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}