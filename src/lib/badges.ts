export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  check: (s: BadgeStats) => boolean;
}

export interface BadgeStats {
  lessons_completed: number;
  tasks_solved: number;
  streak_days: number;
  total_xp: number;
  favorites_count: number;
  my_courses_count: number;
  unique_subjects: number;
}

export const BADGES: BadgeDef[] = [
  { id: "first_step", name: "Первый шаг", emoji: "🎯", description: "Прошёл первый урок", rarity: "common", check: (s) => s.lessons_completed >= 1 },
  { id: "warmup", name: "Разминка", emoji: "🔥", description: "Решил 10 задач", rarity: "common", check: (s) => s.tasks_solved >= 10 },
  { id: "curious", name: "Любознательный", emoji: "🧐", description: "Добавил 3 курса в избранное", rarity: "common", check: (s) => s.favorites_count >= 3 },
  { id: "rookie", name: "Новичок", emoji: "🌱", description: "Прошёл 5 уроков", rarity: "common", check: (s) => s.lessons_completed >= 5 },
  { id: "streak_3", name: "Тройка", emoji: "⚡", description: "3 дня подряд занятий", rarity: "common", check: (s) => s.streak_days >= 3 },

  { id: "streak_7", name: "Неделя силы", emoji: "💪", description: "7 дней подряд занятий", rarity: "rare", check: (s) => s.streak_days >= 7 },
  { id: "marathoner", name: "Марафонец", emoji: "🏃", description: "50 задач решено", rarity: "rare", check: (s) => s.tasks_solved >= 50 },
  { id: "explorer", name: "Исследователь", emoji: "🗺️", description: "Курсы по 3 разным предметам", rarity: "rare", check: (s) => s.unique_subjects >= 3 },
  { id: "xp_500", name: "Прокачка", emoji: "📈", description: "Накопил 500 XP", rarity: "rare", check: (s) => s.total_xp >= 500 },
  { id: "lessons_20", name: "Усердный ученик", emoji: "📚", description: "20 уроков пройдено", rarity: "rare", check: (s) => s.lessons_completed >= 20 },

  { id: "streak_14", name: "Две недели огня", emoji: "🔥🔥", description: "14 дней подряд занятий", rarity: "epic", check: (s) => s.streak_days >= 14 },
  { id: "scholar", name: "Школяр", emoji: "🎓", description: "100 задач решено", rarity: "epic", check: (s) => s.tasks_solved >= 100 },
  { id: "polyglot", name: "Полиглот", emoji: "🌍", description: "Курсы по 5 разным предметам", rarity: "epic", check: (s) => s.unique_subjects >= 5 },
  { id: "xp_2000", name: "Эксперт", emoji: "🧠", description: "Накопил 2000 XP", rarity: "epic", check: (s) => s.total_xp >= 2000 },
  { id: "lessons_50", name: "Профессионал", emoji: "👨‍🎓", description: "50 уроков пройдено", rarity: "epic", check: (s) => s.lessons_completed >= 50 },

  { id: "streak_30", name: "Несокрушимый", emoji: "🏆", description: "30 дней подряд занятий", rarity: "legendary", check: (s) => s.streak_days >= 30 },
  { id: "master", name: "Мастер", emoji: "👑", description: "500 задач решено", rarity: "legendary", check: (s) => s.tasks_solved >= 500 },
  { id: "legend", name: "Легенда", emoji: "⭐", description: "Накопил 10 000 XP", rarity: "legendary", check: (s) => s.total_xp >= 10000 },
];

export const RARITY_COLORS: Record<BadgeDef["rarity"], { bg: string; ring: string; text: string }> = {
  common:    { bg: "from-slate-500/20 to-slate-400/10",  ring: "ring-slate-400/40",  text: "text-slate-300" },
  rare:      { bg: "from-cyan-500/25 to-blue-500/15",    ring: "ring-cyan-400/50",   text: "text-cyan-300" },
  epic:      { bg: "from-purple-500/25 to-pink-500/15",  ring: "ring-purple-400/50", text: "text-purple-300" },
  legendary: { bg: "from-amber-500/30 to-orange-500/20", ring: "ring-amber-400/60",  text: "text-amber-300" },
};

/** Уровни: каждый = 500 XP. Возвращает (level, xpInLevel, xpToNext, progress%) */
export function calcLevel(xp: number): { level: number; xpInLevel: number; xpToNext: number; progress: number } {
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const xpToNext = 500 - xpInLevel;
  const progress = (xpInLevel / 500) * 100;
  return { level, xpInLevel, xpToNext, progress };
}

export const LEVEL_TITLES = [
  "Новичок", "Ученик", "Студент", "Подмастерье", "Знаток",
  "Эксперт", "Магистр", "Профессор", "Гений", "Легенда",
];

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || "Легенда";
}
