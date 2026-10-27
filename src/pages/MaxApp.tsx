import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "@/lib/helmet";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { getMaxInitData, haptic, launchedFromMax } from "@/components/max/maxBridge";
import { fetchSummary, MaxSummary } from "@/components/max/maxApi";
import TutorTab from "@/components/max/TutorTab";
import HomeworkTab from "@/components/max/HomeworkTab";
import ExamTab from "@/components/max/ExamTab";
import ProfileTab from "@/components/max/ProfileTab";

type Tab = "tutor" | "homework" | "exam" | "profile";
const TABS: { v: Tab; label: string; icon: string }[] = [
  { v: "tutor", label: "Репетитор", icon: "MessageCircle" },
  { v: "homework", label: "Домашка", icon: "Camera" },
  { v: "exam", label: "ОГЭ/ЕГЭ", icon: "Target" },
  { v: "profile", label: "Профиль", icon: "User" },
];
const START_TABS: Record<string, Tab> = { homework: "homework", dz: "homework", exam: "exam", task: "exam", profile: "profile" };

/** Мини-приложение УЧИСЬПРО для мессенджера MAX. */
export default function MaxApp() {
  const auth = useAuth();
  const [fromMax] = useState(launchedFromMax);
  const [phase, setPhase] = useState<"auth" | "ready" | "error">(fromMax ? "auth" : "ready");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("tutor");
  const [summary, setSummary] = useState<MaxSummary | null>(null);
  const [grade, setGrade] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setPhase("auth");
    const { initData, platform } = await getMaxInitData();
    if (!initData) {
      setAuthError("MAX не передал данные для входа. Закройте и откройте приложение заново.");
      setPhase("error");
      return;
    }
    const r = await auth.loginWithMax(initData, platform);
    if (!r.ok) {
      setAuthError(r.message || "Не удалось войти");
      setPhase("error");
      return;
    }
    const start = (r.startParam || "").toLowerCase();
    if (START_TABS[start]) setTab(START_TABS[start]);
    setPhase("ready");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fromMax) signIn();
  }, [fromMax, signIn]);

  const loadSummary = useCallback(async () => {
    if (!auth.token) return;
    const s = await fetchSummary(auth.token);
    if (s) {
      setSummary(s);
      setGrade((g) => g ?? s.grade);
    }
  }, [auth.token]);

  useEffect(() => {
    if (phase === "ready" && auth.isAuthenticated) loadSummary();
  }, [phase, auth.isAuthenticated, loadSummary]);

  useEffect(() => {
    setGrade((g) => g ?? auth.user?.grade ?? null);
  }, [auth.user]);

  useEffect(() => {
    if (phase === "ready" && auth.isAuthenticated && !grade && summary && !summary.grade) setTab("profile");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  const head = (
    <Helmet>
      <title>УЧИСЬПРО в MAX</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
    </Helmet>
  );

  if (phase === "auth" || (auth.loading && !auth.user)) {
    return (
      <Screen>
        {head}
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-bold">У</span>
        <Icon name="Loader2" size={24} className="mt-6 animate-spin text-white/60" />
        <p className="mt-3 text-white/60">Входим через MAX…</p>
      </Screen>
    );
  }

  if (phase === "error") {
    return (
      <Screen>
        {head}
        <Icon name="TriangleAlert" size={36} className="text-amber-300" />
        <p className="mt-4 max-w-xs text-center text-white/80">{authError}</p>
        <button onClick={signIn} className="mt-6 h-12 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground">
          Попробовать ещё раз
        </button>
      </Screen>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <Screen>
        {head}
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-bold">У</span>
        <h1 className="mt-5 text-2xl font-bold">УЧИСЬПРО</h1>
        <p className="mt-2 max-w-xs text-center text-white/65">
          Это приложение для мессенджера MAX. В браузере войдите на сайт — там всё то же самое и даже больше.
        </p>
        <button onClick={auth.openLogin} className="mt-6 h-12 w-full max-w-xs rounded-2xl bg-primary font-semibold text-primary-foreground">
          Войти на сайт
        </button>
        <Link to="/" className="mt-3 text-sm text-white/55 underline">
          На главную учисьпро.рф
        </Link>
      </Screen>
    );
  }

  const name = auth.user?.name || summary?.name || null;

  return (
    <div className="flex h-[100dvh] flex-col bg-background font-golos text-white">
      {head}
      <main className="min-h-0 flex-1 overflow-y-auto">
        {tab === "tutor" && <TutorTab grade={grade} name={name} />}
        {tab === "homework" && <HomeworkTab token={auth.token} grade={grade} />}
        {tab === "exam" && <ExamTab token={auth.token} grade={grade} summary={summary} onAnswered={() => setTimeout(loadSummary, 600)} />}
        {tab === "profile" && (
          <ProfileTab token={auth.token} name={name} grade={grade} avatar={auth.user?.avatar_url} summary={summary} onGrade={(g) => setGrade(g)} />
        )}
      </main>
      <nav className="grid grid-cols-4 border-t border-white/10 bg-background pb-[env(safe-area-inset-bottom)]">
        {TABS.map((t) => (
          <button
            key={t.v}
            onClick={() => {
              haptic();
              setTab(t.v);
            }}
            className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${tab === t.v ? "text-primary" : "text-white/50"}`}
          >
            <Icon name={t.icon} size={22} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-mesh p-6 font-golos text-white">{children}</div>;
}
