/**
 * Рендер промо-ролика в браузере: Canvas → MediaRecorder → WebM/MP4.
 *
 * Идея: для каждой сцены сценария рисуем красивый кадр с градиентом,
 * эмодзи и анимацией текста. Параллельно проигрываем аудио-дорожку
 * (озвучка диктора + лёгкая фоновая музыка опционально). MediaRecorder
 * захватывает поток с canvas + аудио и отдаёт готовый файл.
 *
 * Работает в Chrome, Edge, Firefox (с разной кодек-поддержкой).
 * Safari не поддерживает MediaRecorder на canvas → даём fallback: WebM.
 */

import { VideoScene, VideoVariant } from "./videoScripts";

export interface RenderOptions {
  variant: VideoVariant;
  /** Готовая дорожка озвучки (MP3 от SpeechKit), URL. */
  voiceUrl?: string;
  /** Альтернатива voiceUrl: MP3 в base64 (обходит CORS на CDN). */
  voiceBase64?: string;
  /** Прогресс рендера (0..1). */
  onProgress?: (progress: number, stage: string) => void;
}

export interface RenderResult {
  blob: Blob;
  url: string;
  mimeType: string;
  durationMs: number;
}

const FPS = 30;

// ─── Утилиты рисования ────────────────────────────────────────────────────

function parseGradient(bg: string): { from: string; via?: string; to: string } {
  const colors: Record<string, string> = {
    "purple-600": "#9333ea", "purple-500": "#a855f7",
    "pink-500": "#ec4899", "pink-400": "#f472b6",
    "orange-500": "#f97316", "orange-400": "#fb923c",
    "rose-500": "#f43f5e", "rose-400": "#fb7185", "rose-600": "#e11d48",
    "red-600": "#dc2626",
    "yellow-300": "#fde047", "yellow-200": "#fef08a",
    "cyan-500": "#06b6d4", "cyan-400": "#22d3ee",
    "blue-500": "#3b82f6",
    "violet-600": "#7c3aed",
    "fuchsia-500": "#d946ef",
    "emerald-500": "#10b981",
    "teal-500": "#14b8a6",
    "amber-500": "#f59e0b",
    "indigo-600": "#4f46e5",
  };
  const parts = bg.split(" ").map((p) => p.replace(/^(from-|via-|to-)/, ""));
  const from = colors[parts[0]] || "#7c3aed";
  const via = bg.includes("via-") ? colors[parts[1]] : undefined;
  const to = colors[parts[parts.length - 1]] || "#ec4899";
  return { from, via, to };
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number,
  H: number,
  zoom: number,
) {
  // object-fit: cover + лёгкий Ken Burns zoom (1.0 → ~1.08)
  const scale = Math.max(W / img.width, H / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  scene: VideoScene,
  sceneProgress: number,
  isVertical: boolean,
  photos: Map<string, HTMLImageElement>,
) {
  const photo = scene.photoUrl ? photos.get(scene.photoUrl) : undefined;

  // ── Фото-фон с медленным зумом (Ken Burns) — оживляет статичный кадр
  if (photo) {
    const zoom = 1.0 + sceneProgress * 0.08;
    drawCover(ctx, photo, W, H, zoom);
    // Лёгкая цветная подложка от градиента сцены (для брендового настроения)
    const grad = ctx.createLinearGradient(0, 0, W, H);
    const { from, via, to } = parseGradient(scene.bg);
    grad.addColorStop(0, from + "55");      // ~33% прозрачность
    if (via) grad.addColorStop(0.5, via + "33");
    grad.addColorStop(1, to + "55");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else {
    // Fallback — старый градиентный фон
    const grad = ctx.createLinearGradient(0, 0, W, H);
    const { from, via, to } = parseGradient(scene.bg);
    grad.addColorStop(0, from);
    if (via) grad.addColorStop(0.5, via);
    grad.addColorStop(1, to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Затемнение снизу — чтобы текст читался поверх любого фото
  const fade = ctx.createLinearGradient(0, H * 0.35, 0, H);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(0.5, "rgba(0,0,0,0.55)");
  fade.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);

  // ── Виньетка по краям для глубины
  const vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H));
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  // ── Маленький эмодзи-бейдж над заголовком (без огромной картинки)
  const badgeY = isVertical ? H * 0.5 : H * 0.52;
  const emojiSize = Math.floor(Math.min(W, H) * 0.07);
  ctx.font = `${emojiSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = Math.min(1, sceneProgress * 6);
  ctx.fillText(scene.emoji, W / 2, badgeY);
  ctx.globalAlpha = 1;

  // ── Тёмная плашка под заголовком
  const titleY = isVertical ? H * 0.6 : H * 0.62;
  const lines = scene.title.split("\n");
  const titleFontSize = Math.floor(Math.min(W, H) * (isVertical ? 0.085 : 0.075));

  // Заголовок с подсветкой
  ctx.font = `900 ${titleFontSize}px Montserrat, "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;

  // Лёгкий слайд снизу-вверх в начале сцены
  const slideOffset = Math.max(0, (1 - sceneProgress * 4)) * 40;
  ctx.fillStyle = "#ffffff";
  lines.forEach((line, i) => {
    ctx.fillText(
      line,
      W / 2,
      titleY + i * titleFontSize * 1.1 + slideOffset,
    );
  });
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // ── Подзаголовок
  if (scene.subtitle) {
    const subY = titleY + lines.length * titleFontSize * 1.1 + (isVertical ? 60 : 50);
    const subFontSize = Math.floor(Math.min(W, H) * (isVertical ? 0.045 : 0.04));
    ctx.font = `700 ${subFontSize}px Montserrat, "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = scene.accent ? "#fde047" : "rgba(255,255,255,0.85)";
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 12;
    ctx.fillText(scene.subtitle, W / 2, subY + slideOffset * 0.6);
    ctx.shadowBlur = 0;
  }

  // ── Логотип в углу
  const logoY = isVertical ? H * 0.93 : H * 0.92;
  const logoFontSize = Math.floor(Math.min(W, H) * 0.035);
  ctx.font = `900 ${logoFontSize}px Montserrat, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 10;
  ctx.fillText("🚀 УЧИСЬПРО · учисьпро.рф", W / 2, logoY);
  ctx.shadowBlur = 0;

  // ── Прогресс-полоска снизу
  const barH = Math.max(4, Math.floor(H * 0.006));
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(0, H - barH, W, barH);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(0, H - barH, W * sceneProgress, barH);
}

// ─── Главный рендер ───────────────────────────────────────────────────────

/** Подбирает доступный MIME-тип видео-кодека. */
function pickMimeType(): string {
  const candidates = [
    "video/mp4;codecs=h264,aac",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
      return m;
    }
  }
  return "video/webm";
}

export async function renderVideo(opts: RenderOptions): Promise<RenderResult> {
  const { variant, voiceUrl, voiceBase64, onProgress } = opts;
  const plannedSec = variant.scenes.reduce((s, sc) => s + sc.duration, 0);
  const isVertical = variant.aspect === "9:16";

  // 1) Получаем аудио-байты. Приоритет — base64 (обходит CORS на CDN).
  onProgress?.(0.05, "Загружаем озвучку…");
  let audioBuf: ArrayBuffer;
  if (voiceBase64) {
    // Декодируем base64 в ArrayBuffer прямо в браузере, без сети
    const binary = atob(voiceBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    audioBuf = bytes.buffer;
  } else if (voiceUrl) {
    const audioResp = await fetch(voiceUrl);
    if (!audioResp.ok) {
      throw new Error(`Не удалось скачать озвучку (HTTP ${audioResp.status})`);
    }
    audioBuf = await audioResp.arrayBuffer();
  } else {
    throw new Error("Не передана озвучка: нужен voiceBase64 или voiceUrl");
  }

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("Браузер не поддерживает Web Audio API — обнови Safari/Chrome.");
  }
  const audioCtx = new AudioCtx();
  const audioBuffer = await audioCtx.decodeAudioData(audioBuf.slice(0));

  // Реальная длительность озвучки. Берём максимум из планового и фактического
  // + 0.4 сек "хвоста", чтобы фраза не обрывалась на полуслове.
  const audioSec = audioBuffer.duration;
  const totalSec = Math.max(plannedSec, audioSec) + 0.4;
  const totalMs = totalSec * 1000;

  // 2) Canvas
  const canvas = document.createElement("canvas");
  canvas.width = variant.width;
  canvas.height = variant.height;
  const ctx = canvas.getContext("2d")!;

  // 2.1) Предзагрузка реалистичных фото-фонов для каждой сцены.
  // Используем crossOrigin=anonymous, чтобы canvas не «протух» от CORS.
  onProgress?.(0.07, "Загружаем фото…");
  const photos = new Map<string, HTMLImageElement>();
  await Promise.all(
    variant.scenes.map(
      (sc) =>
        new Promise<void>((resolve) => {
          if (!sc.photoUrl || photos.has(sc.photoUrl)) {
            resolve();
            return;
          }
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            photos.set(sc.photoUrl!, img);
            resolve();
          };
          // Если фото не загрузилось — не падаем, просто оставим градиент
          img.onerror = () => resolve();
          img.src = sc.photoUrl;
        }),
    ),
  );

  // 3) Стрим видео + стрим аудио → MediaRecorder
  const videoStream = canvas.captureStream(FPS);
  const audioDest = audioCtx.createMediaStreamDestination();
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioDest);
  source.connect(audioCtx.destination); // чтобы пользователь слышал во время записи

  const audioTrack = audioDest.stream.getAudioTracks()[0];
  if (audioTrack) videoStream.addTrack(audioTrack);

  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(videoStream, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
    audioBitsPerSecond: 128_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  // 4) Запускаем
  const startTime = performance.now();
  recorder.start(250);
  source.start();
  onProgress?.(0.1, "Рендерим кадры…");

  // 5) Цикл рисования
  await new Promise<void>((resolve) => {
    function tick() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / 1000, totalSec);

      // Найти текущую сцену
      let acc = 0;
      let scene = variant.scenes[0];
      let sceneStart = 0;
      for (const s of variant.scenes) {
        if (t < acc + s.duration) {
          scene = s;
          sceneStart = acc;
          break;
        }
        acc += s.duration;
      }
      const sceneProgress = Math.min(1, (t - sceneStart) / scene.duration);

      drawScene(ctx, variant.width, variant.height, scene, sceneProgress, isVertical, photos);

      onProgress?.(0.1 + (t / totalSec) * 0.85, `Сцена ${variant.scenes.indexOf(scene) + 1}/${variant.scenes.length}`);

      // +600 мс хвоста после конца озвучки — recorder успевает зафиксировать
      // последние аудио-пакеты, фраза не обрывается.
      if (elapsed < totalMs + 600) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }
    tick();
  });

  // 6) Финал
  recorder.stop();
  source.stop();

  const finalBlob: Blob = await new Promise((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  onProgress?.(1, "Готово!");
  return {
    blob: finalBlob,
    url: URL.createObjectURL(finalBlob),
    mimeType,
    durationMs: totalMs,
  };
}