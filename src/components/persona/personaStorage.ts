import { DEFAULT_FACE, Persona, PERSONAS } from "./personaTypes";

const KEY = "uchispro_personas_v1";

/**
 * Хранение созданных ботов.
 *
 * Пока держим в браузере: студия — админский инструмент, ботов настраивает
 * один человек. Когда понадобится показывать их всем посетителям,
 * тот же формат уедет в базу без переделки интерфейса.
 */

export function loadPersonas(): Persona[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Persona[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePersonas(list: Persona[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 40)));
  } catch {
    /* переполнение хранилища не должно ломать студию */
  }
}

/** Все доступные боты: встроенные + созданные вручную. */
export function allPersonas(): Persona[] {
  const custom = loadPersonas();
  const customIds = new Set(custom.map((p) => p.id));
  return [...custom, ...PERSONAS.filter((p) => !customIds.has(p.id))];
}

export function blankPersona(): Persona {
  return {
    id: `bot_${Date.now()}`,
    name: "Новый бот",
    fullName: "Новый бот",
    role: "support",
    job: "Опишите задачу бота",
    image: PERSONAS[0].image,
    voice: "nika",
    accent: "#a855f7",
    greeting: "Здравствуйте! Чем могу помочь?",
    persona: "Ты вежливый помощник. Отвечаешь коротко и по делу.",
    face: { ...DEFAULT_FACE },
    quickAsks: ["Расскажи о себе"],
  };
}
