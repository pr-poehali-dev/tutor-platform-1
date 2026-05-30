import { useCallback, useState } from "react";
import { GameSlug } from "./gamesData";

const WINS_TO_LEVEL_UP = 2;

interface LevelState {
  level: number; // 1, 2, 3, ... без предела
  streak: number; // текущая серия побед подряд
}

function storageKey(slug: GameSlug) {
  return `kids_game_level_${slug}`;
}

function load(slug: GameSlug): LevelState {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (raw) {
      const v = JSON.parse(raw);
      if (typeof v.level === "number" && typeof v.streak === "number") {
        return { level: Math.max(1, v.level), streak: Math.max(0, v.streak) };
      }
    }
  } catch {
    // ignore
  }
  return { level: 1, streak: 0 };
}

function save(slug: GameSlug, state: LevelState) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * Адаптивная сложность для игр против Ксюши.
 * Малыш выигрывает 2 партии подряд → уровень повышается (без предела).
 * Поражение → серия побед сбрасывается (уровень не понижается).
 *
 * registerWin / registerLoss возвращают объект с флагом leveledUp,
 * чтобы игра могла озвучить повышение уровня.
 */
export function useGameLevel(slug: GameSlug) {
  const [state, setState] = useState<LevelState>(() => load(slug));

  const registerWin = useCallback((): { level: number; leveledUp: boolean } => {
    let result = { level: state.level, leveledUp: false };
    setState((prev) => {
      const streak = prev.streak + 1;
      let level = prev.level;
      let nextStreak = streak;
      let leveledUp = false;
      if (streak >= WINS_TO_LEVEL_UP) {
        level = prev.level + 1;
        nextStreak = 0; // обнуляем счётчик серии после повышения
        leveledUp = true;
      }
      const next = { level, streak: nextStreak };
      save(slug, next);
      result = { level, leveledUp };
      return next;
    });
    return result;
  }, [slug, state.level]);

  const registerLoss = useCallback(() => {
    setState((prev) => {
      const next = { level: prev.level, streak: 0 };
      save(slug, next);
      return next;
    });
  }, [slug]);

  // Ничья не влияет на серию (не считаем ни победой, ни поражением)
  const winsToNext = Math.max(0, WINS_TO_LEVEL_UP - state.streak);

  return {
    level: state.level,
    streak: state.streak,
    winsToNext,
    registerWin,
    registerLoss,
  };
}
