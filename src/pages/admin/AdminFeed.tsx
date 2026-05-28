import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import {
  fetchPending, moderate, fetchSources, curatorFetchAll, curatorFetchOne,
  setAdminKey, getAdminKey, clearAdminKey, SourceInfo,
  autoModerate, fetchCronLog, CronRun,
  fetchFeedHealth, FeedHealth,
} from "@/components/feed/api";
import { FeedArticle } from "@/components/feed/types";
import AdminFeedAuth from "./AdminFeed/AdminFeedAuth";
import AdminFeedHealthSection from "./AdminFeed/AdminFeedHealthSection";
import AdminFeedCuratorSection from "./AdminFeed/AdminFeedCuratorSection";
import AdminFeedCronHistorySection from "./AdminFeed/AdminFeedCronHistorySection";
import AdminFeedModerationSection from "./AdminFeed/AdminFeedModerationSection";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function AdminFeed() {
  const [adminKey, setAdminKeyState] = useState(getAdminKey());
  const [unlocked, setUnlocked] = useState(!!getAdminKey());

  const [pending, setPending] = useState<FeedArticle[]>([]);
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [cronRuns, setCronRuns] = useState<CronRun[]>([]);
  const [health, setHealth] = useState<FeedHealth | null>(null);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingSources, setLoadingSources] = useState(true);

  const [running, setRunning] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const refreshAll = async () => {
    setLoadingPending(true);
    setLoadingSources(true);
    const [p, s, c, h] = await Promise.all([fetchPending(), fetchSources(), fetchCronLog(), fetchFeedHealth()]);
    setPending(p);
    setSources(s);
    setCronRuns(c);
    setHealth(h);
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
      <AdminFeedAuth
        adminKey={adminKey}
        setAdminKeyState={setAdminKeyState}
        handleUnlock={handleUnlock}
      />
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

        {/* ─── HEALTH-MONITOR ─── */}
        {health && <AdminFeedHealthSection health={health} />}

        {/* ─── ИИ-АГЕНТ ─── */}
        <AdminFeedCuratorSection
          sources={sources}
          loadingSources={loadingSources}
          running={running}
          log={log}
          handleFetchAll={handleFetchAll}
          handleAutoModerate={handleAutoModerate}
          handleFetchOne={handleFetchOne}
        />

        {/* ─── ИСТОРИЯ CRON-ЗАПУСКОВ ─── */}
        <AdminFeedCronHistorySection cronRuns={cronRuns} />

        {/* ─── МОДЕРАЦИЯ ─── */}
        <AdminFeedModerationSection
          pending={pending}
          loadingPending={loadingPending}
          handleModerate={handleModerate}
        />
      </main>
    </div>
  );
}
