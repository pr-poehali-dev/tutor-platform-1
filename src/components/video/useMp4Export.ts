import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import func2url from "../../../backend/func2url.json";
import { VideoScene } from "@/components/video/VideoStudioPlayer";

const TTS_URL = (func2url as Record<string, string>)["tts"];

// CDN core ffmpeg.wasm — нужен SharedArrayBuffer, поэтому используем mt
const FFMPEG_CORE_CDN = "https://unpkg.com/@ffmpeg/[email protected]/dist/umd";

export interface ExportState {
  phase: "idle" | "loading-ffmpeg" | "preparing" | "audio" | "encoding" | "finalizing" | "done" | "error";
  progress: number; // 0..1
  message: string;
  resultUrl?: string;
  error?: string;
}

interface ExportOptions {
  scenes: VideoScene[];
  voiceId?: string;
  width?: number;
  height?: number;
  fps?: number;
  title?: string;
}

/** Хук экспорта MP4 через ffmpeg.wasm — собирает картинки + TTS-голос в видео. */
export function useMp4Export() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [state, setState] = useState<ExportState>({ phase: "idle", progress: 0, message: "" });

  const loadFfmpeg = useCallback(async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;
    setState({ phase: "loading-ffmpeg", progress: 0.02, message: "Загружаю ffmpeg (один раз, ~25 МБ)..." });

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on("log", () => {
      /* можно включить для отладки */
    });
    ffmpeg.on("progress", ({ progress }) => {
      const p = Math.max(0, Math.min(1, progress));
      setState((s) => ({
        ...s,
        phase: "encoding",
        progress: 0.45 + p * 0.45,
        message: `Кодирование видео: ${Math.round(p * 100)}%`,
      }));
    });

    // Грузим core с CDN (single-thread версия — не требует cross-origin isolation)
    const coreURL = await toBlobURL(`${FFMPEG_CORE_CDN}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${FFMPEG_CORE_CDN}/ffmpeg-core.wasm`, "application/wasm");
    await ffmpeg.load({ coreURL, wasmURL });
    return ffmpeg;
  }, []);

  /** Получает TTS-аудио для текста, возвращает Uint8Array MP3. */
  const fetchTtsBytes = async (text: string, voiceId: string): Promise<Uint8Array | null> => {
    if (!text.trim()) return null;
    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, teacher_id: voiceId }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const b64 = data.audio || data.audio_base64;
      if (!b64) return null;
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    } catch {
      return null;
    }
  };

  const exportMp4 = useCallback(async (opts: ExportOptions) => {
    const { scenes, voiceId = "nika" } = opts;
    const W = opts.width ?? 1024;
    const H = opts.height ?? 576;
    const FPS = opts.fps ?? 24;

    setState({ phase: "loading-ffmpeg", progress: 0.01, message: "Запуск..." });

    try {
      const validScenes = scenes.filter((s) => !!s.image_url);
      if (validScenes.length === 0) {
        setState({ phase: "error", progress: 0, message: "Нет сцен с картинками", error: "Сначала сгенерируйте кадры FLUX" });
        return null;
      }

      const ffmpeg = await loadFfmpeg();

      setState({ phase: "preparing", progress: 0.1, message: "Скачиваю кадры..." });

      // 1) Загружаем все картинки и пишем в FS
      for (let i = 0; i < validScenes.length; i++) {
        const s = validScenes[i];
        const imgData = await fetchFile(s.image_url!);
        await ffmpeg.writeFile(`img${i}.png`, imgData);
        setState((st) => ({ ...st, progress: 0.1 + (i / validScenes.length) * 0.15, message: `Кадр ${i + 1}/${validScenes.length}` }));
      }

      setState({ phase: "audio", progress: 0.25, message: "Озвучиваю голосом..." });

      // 2) Генерируем TTS для каждой сцены
      const audioFiles: string[] = [];
      for (let i = 0; i < validScenes.length; i++) {
        const s = validScenes[i];
        const audio = await fetchTtsBytes(s.narration, voiceId);
        if (audio && audio.length > 0) {
          const filename = `audio${i}.mp3`;
          await ffmpeg.writeFile(filename, audio);
          audioFiles.push(filename);
        } else {
          audioFiles.push("");
        }
        setState((st) => ({ ...st, progress: 0.25 + (i / validScenes.length) * 0.2, message: `Озвучка ${i + 1}/${validScenes.length}` }));
      }

      setState({ phase: "encoding", progress: 0.45, message: "Кодирую видео..." });

      // 3) Создаём концат-список картинок с длительностями
      // Формат для concat demuxer:
      //   file 'img0.png'
      //   duration 10
      //   file 'img1.png'
      //   duration 8
      //   file 'img1.png'         <- последний файл нужно повторить!
      let concatList = "";
      for (let i = 0; i < validScenes.length; i++) {
        concatList += `file 'img${i}.png'\n`;
        concatList += `duration ${validScenes[i].duration_sec}\n`;
      }
      // Повторяем последний (требование concat demuxer)
      concatList += `file 'img${validScenes.length - 1}.png'\n`;
      await ffmpeg.writeFile("list.txt", new TextEncoder().encode(concatList));

      // 4) Собираем общий аудиотрек: склеиваем mp3 в один файл
      let combinedAudio = false;
      const audioFilesNonEmpty = audioFiles.filter(Boolean);
      if (audioFilesNonEmpty.length > 0) {
        let audioList = "";
        for (let i = 0; i < validScenes.length; i++) {
          if (audioFiles[i]) {
            audioList += `file '${audioFiles[i]}'\n`;
          }
        }
        if (audioList) {
          await ffmpeg.writeFile("audio_list.txt", new TextEncoder().encode(audioList));
          // Конкатенация mp3 через concat demuxer
          await ffmpeg.exec([
            "-f", "concat",
            "-safe", "0",
            "-i", "audio_list.txt",
            "-c", "copy",
            "voice.mp3",
          ]);
          combinedAudio = true;
        }
      }

      // 5) Кодируем видео из картинок (с fade-переходами через filter не делаем — слишком медленно;
      // используем формат с длительностями кадров и стандартным кодеком h264).
      const videoArgs = [
        "-f", "concat",
        "-safe", "0",
        "-i", "list.txt",
        "-vsync", "vfr",
        "-pix_fmt", "yuv420p",
        "-vf", `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS}`,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "26",
        "video.mp4",
      ];
      await ffmpeg.exec(videoArgs);

      setState({ phase: "finalizing", progress: 0.92, message: "Склейка видео и звука..." });

      // 6) Финал: muxim видео и голос в MP4
      let outputName = "output.mp4";
      if (combinedAudio) {
        await ffmpeg.exec([
          "-i", "video.mp4",
          "-i", "voice.mp3",
          "-c:v", "copy",
          "-c:a", "aac",
          "-b:a", "128k",
          "-shortest",
          "output.mp4",
        ]);
      } else {
        outputName = "video.mp4";
      }

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as Uint8Array], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setState({ phase: "done", progress: 1, message: "Готово!", resultUrl: url });
      return url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState({ phase: "error", progress: 0, message: "Ошибка экспорта", error: msg });
      return null;
    }
  }, [loadFfmpeg]);

  const reset = useCallback(() => {
    setState({ phase: "idle", progress: 0, message: "" });
  }, []);

  return { state, exportMp4, reset };
}
