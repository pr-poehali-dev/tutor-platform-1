import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import KsushaAvatar from "@/components/kids/games/KsushaAvatar";
import { KSUSHA_PHRASES, KsushaPhrase } from "@/components/kids/games/ksushaPhrases";
import func2url from "../../../backend/func2url.json";

const KSUSHA_VIDEO_URL = (func2url as Record<string, string>)["ksusha-video"];
const PIN_KEY = "uchispro_admin_pin_v1";
const ADMIN_PIN = "7777";

type JobStatus = "none" | "processing" | "ready" | "failed";

interface RowState {
  status: JobStatus;
  videoUrl?: string;
  error?: string;
}

const STATUS_META: Record<JobStatus, { label: string; color: string; icon: string }> = {
  none: { label: "Не создан", color: "text-white/45", icon: "Circle" },
  processing: { label: "Генерируется…", color: "text-amber-300", icon: "Loader" },
  ready: { label: "Готов", color: "text-emerald-300", icon: "CircleCheck" },
  failed: { label: "Ошибка", color: "text-rose-400", icon: "CircleAlert" },
};

export default function KsushaEngine() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [rows, setRows] = useState<Record<string, RowState>>({});
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY);
    if (saved === ADMIN_PIN) setUnlocked(true);
  }, []);

  const tryUnlock = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(PIN_KEY, pin);
      setUnlocked(true);
      setPinError("");
    } else {
      setPinError("Неверный PIN");
    }
  };

  // Загружаем уже готовые ролики при входе
  const loadReady = useCallback(async () => {
    try {
      const res = await fetch(`${KSUSHA_VIDEO_URL}?action=list`);
      const data = await res.json().catch(() => ({}));
      const videos: Record<string, string> = (data && data.videos) || {};
      setRows((prev) => {
        const next = { ...prev };
        Object.entries(videos).forEach(([key, url]) => {
          next[key] = { status: "ready", videoUrl: url };
        });
        return next;
      });
    } catch {
      /* тихо игнорируем — просто покажем «не создан» */
    }
  }, []);

  useEffect(() => {
    if (unlocked) loadReady();
  }, [unlocked, loadReady]);

  // Запуск генерации одной фразы
  const generateOne = useCallback(async (p: KsushaPhrase) => {
    setRows((prev) => ({ ...prev, [p.key]: { status: "processing" } }));
    try {
      const res = await fetch(`${KSUSHA_VIDEO_URL}?action=generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase_key: p.key, phrase: p.phrase, emotion: p.emotion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRows((prev) => ({ ...prev, [p.key]: { status: "failed", error: data.error || "Ошибка запуска" } }));
        return;
      }
      if (data.status === "ready" && data.video_url) {
        setRows((prev) => ({ ...prev, [p.key]: { status: "ready", videoUrl: data.video_url } }));
      } else {
        setRows((prev) => ({ ...prev, [p.key]: { status: "processing" } }));
      }
    } catch (e) {
      setRows((prev) => ({ ...prev, [p.key]: { status: "failed", error: "Сеть недоступна" } }));
    }
  }, []);

  const generateAll = useCallback(() => {
    KSUSHA_PHRASES.forEach((p) => {
      const cur = rows[p.key];
      if (cur?.status !== "ready" && cur?.status !== "processing") generateOne(p);
    });
  }, [rows, generateOne]);

  // Живой опрос статуса всех «генерящихся» роликов раз в 6 секунд
  useEffect(() => {
    if (!unlocked) return;
    const tick = async () => {
      const processing = KSUSHA_PHRASES.filter((p) => rows[p.key]?.status === "processing");
      if (processing.length === 0) return;
      await Promise.all(
        processing.map(async (p) => {
          try {
            const res = await fetch(`${KSUSHA_VIDEO_URL}?action=status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phrase_key: p.key }),
            });
            const data = await res.json().catch(() => ({}));
            if (data.status === "ready" && data.video_url) {
              setRows((prev) => ({ ...prev, [p.key]: { status: "ready", videoUrl: data.video_url } }));
            } else if (data.status === "failed") {
              setRows((prev) => ({ ...prev, [p.key]: { status: "failed", error: data.error || "Не удалось" } }));
            }
          } catch {
            /* подождём следующего тика */
          }
        })
      );
    };
    pollRef.current = window.setInterval(tick, 6000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [unlocked, rows]);

  const readyCount = KSUSHA_PHRASES.filter((p) => rows[p.key]?.status === "ready").length;
  const processingCount = KSUSHA_PHRASES.filter((p) => rows[p.key]?.status === "processing").length;
  const progress = Math.round((readyCount / KSUSHA_PHRASES.length) * 100);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <Helmet>
          <title>Движок Ксюши · Админ</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Card className="w-full max-w-sm border border-white/10 bg-white/[0.03] p-7">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <Icon name="Lock" size={22} className="text-white/80" />
          </div>
          <h1 className="font-montserrat text-xl font-black text-center mb-2">Движок оживления Ксюши</h1>
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
          {pinError && <p className="text-rose-400 text-xs text-center mt-2">{pinError}</p>}
          <Button onClick={tryUnlock} className="w-full mt-4 bg-gradient-to-r from-amber-500 to-rose-500">
            Войти
          </Button>
          <Link to="/admin" className="block text-center text-white/40 text-xs mt-4 hover:text-white/70">
            ← В админ-хаб
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Движок оживления Ксюши · Админ</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">
        {/* Шапка */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <KsushaAvatar emotion={processingCount > 0 ? "speaking" : "happy"} size="lg" />
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1">Маскот · видеодвижок</div>
              <h1 className="font-montserrat text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent">
                Движок оживления Ксюши
              </h1>
              <p className="text-white/55 text-sm mt-1">
                Одной кнопкой генерируй говорящие ролики и следи за статусом
              </p>
            </div>
          </div>
          <Link to="/admin" className="text-white/45 hover:text-white text-sm flex items-center gap-1 flex-shrink-0">
            <Icon name="ChevronLeft" size={14} /> Хаб
          </Link>
        </div>

        {/* Прогресс + кнопка «Сгенерировать всё» */}
        <Card className="border border-white/10 bg-white/[0.03] p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/70 font-semibold">
                  Готово {readyCount} из {KSUSHA_PHRASES.length}
                </span>
                <span className="text-white/45">{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {processingCount > 0 && (
                <p className="text-amber-300/80 text-xs mt-2 flex items-center gap-1.5">
                  <Icon name="Loader" size={12} className="animate-spin" />
                  Генерируется роликов: {processingCount} — статус обновляется автоматически
                </p>
              )}
            </div>
            <Button
              onClick={generateAll}
              disabled={processingCount > 0}
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 font-bold"
            >
              <Icon name="Sparkles" size={16} className="mr-2" />
              Сгенерировать все ролики
            </Button>
          </div>
        </Card>

        {/* Список фраз */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {KSUSHA_PHRASES.map((p) => {
            const st = rows[p.key] || { status: "none" as JobStatus };
            const meta = STATUS_META[st.status];
            const busy = st.status === "processing";
            return (
              <Card
                key={p.key}
                className="border border-white/10 bg-white/[0.03] hover:border-white/20 transition-all p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <KsushaAvatar
                    emotion={st.status === "ready" ? "speaking" : p.emotion}
                    size="md"
                    videoUrl={st.videoUrl}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-white">{p.title}</span>
                      <span className={`text-[11px] flex items-center gap-1 ${meta.color}`}>
                        <Icon name={meta.icon} size={11} className={busy ? "animate-spin" : ""} />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-white/55 text-xs leading-snug line-clamp-2">«{p.phrase}»</p>
                    {st.error && <p className="text-rose-400/80 text-[11px] mt-1">{st.error}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateOne(p)}
                    disabled={busy}
                    className="border-white/15 hover:bg-white/10 text-xs h-8"
                  >
                    {busy ? (
                      <>
                        <Icon name="Loader" size={13} className="mr-1.5 animate-spin" /> Генерация…
                      </>
                    ) : st.status === "ready" ? (
                      <>
                        <Icon name="RefreshCw" size={13} className="mr-1.5" /> Пересоздать
                      </>
                    ) : (
                      <>
                        <Icon name="Wand2" size={13} className="mr-1.5" /> Сгенерировать
                      </>
                    )}
                  </Button>
                  {st.status === "ready" && st.videoUrl && (
                    <a
                      href={st.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-300/80 hover:text-emerald-300 text-xs flex items-center gap-1"
                    >
                      <Icon name="ExternalLink" size={12} /> Открыть видео
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <p className="text-white/35 text-xs mt-8 leading-relaxed">
          Ролики генерируются через Polza.ai на основе портрета Ксюши. Это занимает 1–2 минуты на
          фразу — статус обновляется сам. Готовые ролики кэшируются и автоматически появляются у
          детей в Познавашке и играх.
        </p>
      </div>
    </div>
  );
}
