import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import func2url from "../../backend/func2url.json";
import {
  ALL_VARIANTS, VideoVariant, totalDuration,
} from "@/components/promo/videoScripts";
import { renderVideo } from "@/components/promo/videoRenderer";

const PROMO_VOICE_URL = (func2url as Record<string, string>)["promo-voice"];
const SITE = "https://xn--h1agdcde2c.xn--p1ai";

interface Generated {
  videoUrl: string;
  mimeType: string;
  audioUrl: string;
  sizeMb: number;
  durationSec: number;
}

export default function PromoVideo() {
  const [variantId, setVariantId] = useState<VideoVariant["id"]>("shorts60");
  const variant = useMemo(
    () => ALL_VARIANTS.find((v) => v.id === variantId) || ALL_VARIANTS[0],
    [variantId],
  );

  const [stage, setStage] = useState<"idle" | "voice" | "render" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Record<string, Generated>>({});
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Проверка поддержки MediaRecorder + Canvas.captureStream
    const c = document.createElement("canvas");
    const hasCapture = typeof (c as HTMLCanvasElement & { captureStream?: () => MediaStream }).captureStream === "function";
    const hasRecorder = typeof MediaRecorder !== "undefined";
    setSupported(hasCapture && hasRecorder);
  }, []);

  const current = generated[variantId];

  const handleGenerate = async () => {
    setStage("voice");
    setProgress(0);
    setProgressText("Озвучиваем голосом Filipp…");
    setErrorMsg(null);

    try {
      // 1) Озвучка
      const voiceResp = await fetch(PROMO_VOICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: variant.id,
          scenes: variant.scenes.map((s) => ({ text: s.voice, duration: s.duration })),
        }),
      });
      const voiceData = await voiceResp.json().catch(() => ({}));
      if (!voiceResp.ok) {
        const reason = voiceData?.detail || voiceData?.error || `HTTP ${voiceResp.status}`;
        throw new Error(`Не удалось сгенерировать озвучку: ${reason}`);
      }
      // Бэк возвращает base64 (обходит CORS на CDN) + опционально URL для скачивания
      if (!voiceData.audio_base64 && !voiceData.audio_url) {
        throw new Error(voiceData.error || "Бэкенд не вернул аудио-данные");
      }

      // 2) Видео — приоритет base64, чтобы не падать на CORS
      setStage("render");
      setProgressText("Рендерим видео…");
      const result = await renderVideo({
        variant,
        voiceBase64: voiceData.audio_base64,
        voiceUrl: voiceData.audio_url || undefined,
        onProgress: (p, s) => {
          setProgress(p);
          setProgressText(s);
        },
      });

      // 3) Готово. audioUrl сохраняем для кнопки «Скачать MP3».
      // Если CDN недоступен — собираем data-URL из base64.
      const audioDownloadUrl = voiceData.audio_url
        || (voiceData.audio_base64 ? `data:audio/mpeg;base64,${voiceData.audio_base64}` : "");

      setGenerated((prev) => ({
        ...prev,
        [variant.id]: {
          videoUrl: result.url,
          mimeType: result.mimeType,
          audioUrl: audioDownloadUrl,
          sizeMb: result.blob.size / (1024 * 1024),
          durationSec: result.durationMs / 1000,
        },
      }));
      setStage("ready");
      setProgress(1);
      setProgressText("Готово!");
    } catch (e) {
      setStage("error");
      const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
      setErrorMsg(msg);
    }
  };

  const downloadFilename = (v: VideoVariant, mime: string) => {
    const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
    return `uchispro-${v.id}-${v.aspect.replace(":", "x")}.${ext}`;
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Промо-ролик УЧИСЬПРО — скачать видео для соцсетей"
        description="Готовые промо-ролики УЧИСЬПРО с озвучкой. 3 формата: Shorts 60 сек 9:16, минута 16:9, полный обзор 2 минуты. Скачай и опубликуй в VK Клипы, Rutube, TikTok, Дзен."
        canonical={`${SITE}/promo/video`}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Промо-ролики" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-8 pb-16">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
            <Icon name="Video" size={14} className="text-purple-300" />
            <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">Промо-ролики для соцсетей</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3 leading-tight">
            Готовые ролики <span className="gradient-text-purple">УЧИСЬПРО</span><br />
            для VK, Rutube, Дзен и TikTok
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Выбери формат, нажми «Создать ролик» — за минуту получишь видео с озвучкой и сможешь скачать.
            Старые ролики сохраняются — можешь сделать сразу все три.
          </p>
        </div>

        {/* Выбор варианта */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {ALL_VARIANTS.map((v) => {
            const active = v.id === variantId;
            const isReady = !!generated[v.id];
            return (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`relative text-left rounded-2xl border-2 p-4 transition-all ${
                  active
                    ? "bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20"
                    : "bg-white/[0.03] border-white/10 hover:border-white/25"
                }`}
              >
                {isReady && (
                  <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon name="Check" size={10} />
                    готов
                  </div>
                )}
                <div className="text-3xl mb-2">{v.aspect === "9:16" ? "📱" : "🖥"}</div>
                <p className="font-montserrat font-black text-white text-base mb-1">
                  {v.aspect === "9:16" ? "Shorts" : v.id === "wide60" ? "Минута 16:9" : "Полный обзор"}
                </p>
                <p className="text-white/65 text-xs mb-2">{v.label}</p>
                <div className="flex flex-wrap gap-1">
                  {v.platforms.slice(0, 3).map((p) => (
                    <span key={p} className="text-[10px] bg-white/8 border border-white/10 rounded-md px-1.5 py-0.5 text-white/70">
                      {p}
                    </span>
                  ))}
                </div>
                <p className="text-white/45 text-[11px] mt-2">
                  {totalDuration(v)} сек · {v.scenes.length} сцен
                </p>
              </button>
            );
          })}
        </div>

        {/* Несовместимость */}
        {!supported && (
          <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Icon name="AlertTriangle" size={18} className="text-amber-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm mb-1">Твой браузер не поддерживает рендер видео</p>
              <p className="text-white/70 text-xs">Открой страницу в Chrome, Edge или Firefox последней версии. Safari пока не умеет записывать canvas.</p>
            </div>
          </div>
        )}

        {/* Превью / плеер */}
        <div className={`relative rounded-3xl overflow-hidden border border-white/10 bg-black mb-4 ${
          variant.aspect === "9:16" ? "max-w-[400px] mx-auto aspect-[9/16]" : "aspect-video"
        }`}>
          {current ? (
            <video
              src={current.videoUrl}
              controls
              autoPlay
              loop
              poster={variant.posterUrl}
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <>
              <img
                src={variant.posterUrl}
                alt={`Постер ролика: ${variant.label}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col items-center justify-end text-center p-6 pb-8">
                <p className="text-white/95 font-bold text-base md:text-lg drop-shadow-lg mb-2">
                  Жми «Создать ролик» — через минуту здесь будет видео
                </p>
                <p className="text-white/70 text-xs md:text-sm">
                  Сейчас показана обложка-постер для соцсетей
                </p>
              </div>
            </>
          )}
        </div>

        {/* Кнопка скачать постер отдельно */}
        <div className="text-center mb-6">
          <a
            href={variant.posterUrl}
            download={`uchispro-poster-${variant.id}.jpg`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100 text-sm font-bold underline underline-offset-4"
          >
            <Icon name="Image" size={14} />
            Скачать обложку-постер для соцсетей ({variant.aspect})
          </a>
        </div>

        {/* Прогресс / кнопки */}
        {(stage === "voice" || stage === "render") && (
          <div className="bg-card/60 border border-white/10 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Loader2" size={18} className="animate-spin text-purple-300" />
              <p className="font-bold text-white text-sm">{progressText}</p>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="text-white/55 text-xs mt-2">
              {stage === "render" && "Не закрывай вкладку — рендер идёт у тебя в браузере."}
              {stage === "voice" && "Голос Filipp синтезируется на сервере, потом начнём собирать видео."}
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <Icon name="AlertCircle" size={18} className="text-rose-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white text-sm mb-1">Ошибка генерации</p>
              <p className="text-white/70 text-xs mb-2">{errorMsg}</p>
              <button
                onClick={handleGenerate}
                className="text-rose-200 hover:text-white text-xs font-bold underline underline-offset-2"
              >
                Попробовать ещё раз
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={!supported || stage === "voice" || stage === "render"}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-sm md:text-base px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
          >
            <Icon name="Wand2" size={16} />
            {current ? "Пересоздать ролик" : "Создать ролик"}
          </button>

          {current && (
            <>
              <a
                href={current.videoUrl}
                download={downloadFilename(variant, current.mimeType)}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm md:text-base px-5 py-3.5 rounded-xl transition-colors"
              >
                <Icon name="Download" size={16} />
                Скачать ({current.sizeMb.toFixed(1)} МБ)
              </a>
              <a
                href={current.audioUrl}
                download={`uchispro-voice-${variant.id}.mp3`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm px-4 py-3.5 rounded-xl transition-colors"
              >
                <Icon name="Music" size={14} />
                Только озвучка MP3
              </a>
            </>
          )}
        </div>

        {/* Сценарий */}
        <div className="bg-card/60 border border-white/10 rounded-3xl p-5 md:p-7 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-montserrat font-black text-white text-xl md:text-2xl">Сценарий и раскадровка</h2>
            <p className="text-white/55 text-xs">
              {variant.scenes.length} сцен · {totalDuration(variant)} сек · голос Filipp
            </p>
          </div>
          <div className="space-y-2">
            {variant.scenes.map((s, i) => (
              <div
                key={i}
                className={`bg-gradient-to-r ${s.bg} rounded-xl p-3 md:p-4 flex items-start gap-3 border border-white/10`}
              >
                <div className="text-2xl md:text-3xl flex-shrink-0">{s.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="font-montserrat font-black text-white text-sm md:text-base">
                      {i + 1}. {s.title.replace("\n", " · ")}
                    </span>
                    <span className="text-white/60 text-[11px] font-bold bg-black/25 rounded-md px-1.5 py-0.5">
                      {s.duration}c
                    </span>
                  </div>
                  <p className="text-white/85 text-xs md:text-sm italic leading-relaxed">«{s.voice}»</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Инструкция по публикации */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-3xl p-5 md:p-7">
          <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
            Куда и как публиковать
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { p: "VK Клипы", w: "Загрузи Shorts 9:16. Добавь хештеги #учисьпро #ЕГЭ #репетитор. Закрепи ссылку учисьпро.рф в описании.", icon: "Video" },
              { p: "Rutube", w: "Подходит вариант 16:9 (минута или 2 мин). В описании укажи акцию ДОБРО и ссылку.", icon: "PlaySquare" },
              { p: "Дзен Видео", w: "Лучше 9:16. В заголовке: «Школьники, всё бесплатно до 15 июня». Дзен любит конкретику.", icon: "Newspaper" },
              { p: "TikTok", w: "Только Shorts 9:16. Первые 3 секунды — хук «Репетитор больше не нужен». Звук — нашу озвучку Filipp.", icon: "Music" },
            ].map((x) => (
              <div key={x.p} className="bg-white/[0.04] border border-white/8 rounded-2xl p-3 flex gap-3">
                <Icon name={x.icon} size={18} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm mb-1">{x.p}</p>
                  <p className="text-white/65 text-xs leading-snug">{x.w}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}