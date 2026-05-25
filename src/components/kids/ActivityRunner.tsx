import { useEffect, useRef, useState } from "react";
import func2url from "../../../backend/func2url.json";
import { Activity, AREAS } from "@/components/kids/kidsData";
import { Scene, getInteractive } from "@/components/kids/interactiveData";
import { useKidsProgress } from "@/components/kids/useKidsProgress";
import ActivityRunnerModal from "@/components/kids/ActivityRunnerModal";
import ActivityRunnerHeader from "@/components/kids/ActivityRunnerHeader";
import SceneRenderer from "@/components/kids/SceneRenderer";
import FinishedScreen from "@/components/kids/FinishedScreen";

const TTS_URL = (func2url as Record<string, string>)["tts"];

interface Props {
  activity: Activity;
  onClose: () => void;
}

export default function ActivityRunner({ activity, onClose }: Props) {
  const lesson = getInteractive(activity.id);
  const scenes: Scene[] = lesson?.scenes ?? [];
  const area = AREAS.find((a) => a.id === activity.areaId);

  const [sceneIdx, setSceneIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<"idle" | "correct" | "wrong">("idle");
  const [sortPlaced, setSortPlaced] = useState<Record<number, string>>({});
  const [songStepIdx, setSongStepIdx] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionStars, setSessionStars] = useState(0);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { addStars, recordAnswer, completeActivity } = useKidsProgress();

  const scene = scenes[sceneIdx];
  const totalScenes = scenes.length;

  // Озвучка реплики Лисы при смене сцены
  useEffect(() => {
    if (!scene || !voiceEnabled) return;
    let cancelled = false;
    const text = scene.voice;
    if (!text) return;
    const speak = async () => {
      try {
        // Остановить предыдущий
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const res = await fetch(TTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, teacher_id: "fox" }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const audioData = data.audio || data.audio_base64;
        if (!audioData || cancelled) return;
        const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
        audioRef.current = audio;
        audio.play().catch(() => { /* пользователь не взаимодействовал */ });
      } catch {
        /* noop */
      }
    };
    speak();
    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sceneIdx, voiceEnabled, scene]);

  // Очистка при закрытии
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const replayVoice = async () => {
    if (!scene) return;
    try {
      if (audioRef.current) audioRef.current.pause();
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scene.voice, teacher_id: "fox" }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const audioData = data.audio || data.audio_base64;
      if (!audioData) return;
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audioRef.current = audio;
      await audio.play();
    } catch { /* noop */ }
  };

  const nextScene = () => {
    setSelected(null);
    setVerdict("idle");
    setSortPlaced({});
    setSongStepIdx(0);
    if (sceneIdx + 1 >= totalScenes) {
      // Финиш — записываем прогресс
      completeActivity(activity.id);
      addStars(sessionStars);
      setFinished(true);
      return;
    }
    setSceneIdx(sceneIdx + 1);
  };

  // ─── Обработчик выбора (choose / emotion / counting) ─────────────────
  const handleChoose = (i: number) => {
    if (!scene || !scene.options) return;
    if (verdict === "correct") return;
    setSelected(i);
    const opt = scene.options[i];
    const isCorrect = !!opt.correct;
    setVerdict(isCorrect ? "correct" : "wrong");
    recordAnswer(isCorrect);
    if (isCorrect) {
      const r = scene.reward ?? 1;
      setSessionStars((s) => s + r);
      // Авто-переход после успеха
      setTimeout(() => nextScene(), 1200);
    } else {
      // Дать попробовать ещё
      setTimeout(() => {
        setVerdict("idle");
        setSelected(null);
      }, 900);
    }
  };

  // ─── Обработчик сортировки ───────────────────────────────────────────
  const handleSortPlace = (itemIdx: number, bucketId: string) => {
    if (!scene || !scene.options) return;
    setSortPlaced((prev) => ({ ...prev, [itemIdx]: bucketId }));
    const opt = scene.options[itemIdx];
    const isCorrect = opt.bucketId === bucketId;
    recordAnswer(isCorrect);
    // Когда все размещены — проверяем
    const newPlaced = { ...sortPlaced, [itemIdx]: bucketId };
    if (Object.keys(newPlaced).length === scene.options.length) {
      const allCorrect = scene.options.every((o, idx) => newPlaced[idx] === o.bucketId);
      if (allCorrect) {
        setSessionStars((s) => s + (scene.reward ?? 2));
        setVerdict("correct");
        setTimeout(() => nextScene(), 1500);
      } else {
        setVerdict("wrong");
        setTimeout(() => {
          setSortPlaced({});
          setVerdict("idle");
        }, 1200);
      }
    }
  };

  const handleSongAdvance = () => {
    if (!scene || !scene.songSteps) return;
    if (songStepIdx + 1 >= scene.songSteps.length) {
      setSessionStars((s) => s + (scene.reward ?? 2));
      nextScene();
    } else {
      setSongStepIdx(songStepIdx + 1);
    }
  };

  // ─── Нет интерактивного контента — fallback ─────────────────────────
  if (!lesson || scenes.length === 0) {
    return (
      <ActivityRunnerModal onClose={onClose}>
        <div className="p-6">
          <p className="text-white/65 text-sm">Интерактивная версия этого занятия скоро появится. Используйте инструкцию ниже.</p>
        </div>
      </ActivityRunnerModal>
    );
  }

  // ─── Финальная сцена результатов ─────────────────────────────────────
  if (finished) {
    return (
      <ActivityRunnerModal onClose={onClose} hideHeader>
        <FinishedScreen
          activity={activity}
          sessionStars={sessionStars}
          onClose={onClose}
        />
      </ActivityRunnerModal>
    );
  }

  // ─── Текущая сцена ───────────────────────────────────────────────────
  return (
    <ActivityRunnerModal onClose={onClose}>
      <ActivityRunnerHeader
        activity={activity}
        area={area}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((v) => !v)}
        onClose={onClose}
        sceneIdx={sceneIdx}
        totalScenes={totalScenes}
        sessionStars={sessionStars}
      />

      <SceneRenderer
        scene={scene}
        sceneIdx={sceneIdx}
        selected={selected}
        verdict={verdict}
        sortPlaced={sortPlaced}
        songStepIdx={songStepIdx}
        onReplayVoice={replayVoice}
        onChoose={handleChoose}
        onSortPlace={handleSortPlace}
        onSongAdvance={handleSongAdvance}
        onNextScene={nextScene}
      />
    </ActivityRunnerModal>
  );
}
