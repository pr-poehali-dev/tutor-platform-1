/**
 * Профориентационный тест "Познай себя".
 *
 * Опирается на 4 модели:
 * 1) RIASEC (Холланд) — 6 типов личности
 * 2) Ценности труда (Шварц + Спрангер)
 * 3) Способности (когнитивные, аналитика, креатив, коммуникация)
 * 4) Школьные предметы — какие даются и нравятся
 *
 * Результат: профиль личности + 10 рекомендованных профессий
 * + подходящие специальности и конкретные вузы из базы.
 */

// ─── RIASEC (Holland Codes) ─────────────────────────────────────────────
export type RiasecCode = "R" | "I" | "A" | "S" | "E" | "C";

export const RIASEC_LABELS: Record<RiasecCode, { label: string; emoji: string; description: string }> = {
  R: { label: "Реалист", emoji: "🔧", description: "Любишь руками, технику, конкретику. Инженер, военный, IT-инфраструктура, биотех-лаборант." },
  I: { label: "Исследователь", emoji: "🔬", description: "Анализ, гипотезы, наука. Учёный, аналитик данных, врач-исследователь, программист." },
  A: { label: "Художник", emoji: "🎨", description: "Творчество и самовыражение. Дизайнер, режиссёр, писатель, архитектор." },
  S: { label: "Социальный", emoji: "🤝", description: "Помогать людям, учить, лечить. Врач, педагог, психолог, тренер." },
  E: { label: "Предприниматель", emoji: "📈", description: "Влиять, вести, продавать. Менеджер, юрист, маркетолог, политик." },
  C: { label: "Организатор", emoji: "📋", description: "Структура, данные, точность. Финансист, бухгалтер, аналитик, госслужащий." },
};

// ─── Ценности труда ─────────────────────────────────────────────────────
export type ValueCode =
  | "stability"      // Стабильность, гарантии
  | "income"         // Высокий доход
  | "creativity"     // Творческая свобода
  | "service"        // Служение людям/обществу
  | "science"        // Познание истины
  | "power"          // Влияние, статус
  | "freedom"        // Независимость, удалёнка
  | "team";          // Команда, принадлежность

export const VALUE_LABELS: Record<ValueCode, { label: string; emoji: string }> = {
  stability:  { label: "Стабильность",     emoji: "🛡" },
  income:     { label: "Высокий доход",    emoji: "💰" },
  creativity: { label: "Творчество",       emoji: "🎨" },
  service:    { label: "Служение людям",   emoji: "❤️" },
  science:    { label: "Наука и истина",   emoji: "🔬" },
  power:      { label: "Влияние и статус", emoji: "👑" },
  freedom:    { label: "Свобода",          emoji: "🕊" },
  team:       { label: "Команда",          emoji: "👥" },
};

// ─── Способности ────────────────────────────────────────────────────────
export type AbilityCode =
  | "analytical"  // Логика, математика
  | "verbal"      // Слова, тексты
  | "spatial"     // Пространство, чертежи
  | "mechanical"  // Техника, схемы
  | "creative"    // Идеи, ассоциации
  | "social"      // Эмпатия, общение
  | "memory"      // Запоминание фактов
  | "leadership"; // Организация людей

export const ABILITY_LABELS: Record<AbilityCode, { label: string; emoji: string }> = {
  analytical: { label: "Аналитика",      emoji: "🧮" },
  verbal:     { label: "Слова и тексты", emoji: "✍" },
  spatial:    { label: "Пространство",   emoji: "📐" },
  mechanical: { label: "Техника",        emoji: "⚙" },
  creative:   { label: "Креатив",        emoji: "💡" },
  social:     { label: "Общение",        emoji: "💬" },
  memory:     { label: "Память",         emoji: "🧠" },
  leadership: { label: "Лидерство",      emoji: "🚩" },
};

// ─── Школьные предметы (что нравится) ───────────────────────────────────
export type SchoolSubject =
  | "math" | "physics" | "informatics" | "chemistry" | "biology"
  | "russian" | "literature" | "english" | "history" | "social" | "geography" | "art" | "pe";

export const SCHOOL_LABELS: Record<SchoolSubject, { label: string; emoji: string }> = {
  math:        { label: "Математика",     emoji: "🔢" },
  physics:     { label: "Физика",         emoji: "⚛" },
  informatics: { label: "Информатика",    emoji: "💻" },
  chemistry:   { label: "Химия",          emoji: "🧪" },
  biology:     { label: "Биология",       emoji: "🌱" },
  russian:     { label: "Русский язык",   emoji: "🇷🇺" },
  literature:  { label: "Литература",     emoji: "📖" },
  english:     { label: "Английский",     emoji: "🇬🇧" },
  history:     { label: "История",        emoji: "🏛" },
  social:      { label: "Обществознание", emoji: "⚖" },
  geography:   { label: "География",      emoji: "🌍" },
  art:         { label: "Изо/музыка",     emoji: "🎨" },
  pe:          { label: "Физкультура",    emoji: "🏃" },
};

// ─── Вопрос теста ───────────────────────────────────────────────────────
export type Scale =
  | { kind: "riasec"; code: RiasecCode }
  | { kind: "value"; code: ValueCode }
  | { kind: "ability"; code: AbilityCode }
  | { kind: "school"; code: SchoolSubject };

export interface Question {
  id: string;
  block: TestBlockCode;
  /** Текст утверждения. Ученик оценивает по 5-балльной шкале. */
  text: string;
  /** На какие шкалы идут баллы при положительном ответе. */
  scales: Scale[];
  /** Если true — высокий ответ снимает баллы (обратный вопрос). */
  reversed?: boolean;
}

// ─── Блоки теста ────────────────────────────────────────────────────────
export type TestBlockCode = "interests" | "abilities" | "values" | "subjects" | "scenarios" | "self";

export interface TestBlock {
  code: TestBlockCode;
  title: string;
  emoji: string;
  description: string;
  /** Количество вопросов в блоке. */
  size: number;
}

// ─── Ответ ──────────────────────────────────────────────────────────────
/** 1 — совсем не про меня, 5 — это прям я. */
export type Answer = 1 | 2 | 3 | 4 | 5;

// ─── Профессия ──────────────────────────────────────────────────────────
export interface Profession {
  id: string;
  title: string;
  emoji: string;
  short: string;
  /** Шкалы, по которым она подбирается. Чем больше совпадений с верхушкой профиля — тем выше ранг. */
  riasec: RiasecCode[];
  values: ValueCode[];
  abilities: AbilityCode[];
  /** Какие школьные предметы важны. */
  subjects: SchoolSubject[];
  /** Какие ЕГЭ нужны. Используется для подсветки и связки с курсами. */
  egeSubjects: string[];
  /** Связь с университетами через id факультетов (из graduateData). */
  universityIds: string[];
  /** Зарплатная вилка в РФ (медиана), тыс. ₽. */
  salaryFrom: number;
  salaryTo: number;
  /** Рост спроса 2025–2030: rising / stable / declining. */
  outlook: "rising" | "stable" | "declining";
  /** Описание дня типичного специалиста. */
  dayInLife: string;
}

// ─── Профиль результата ─────────────────────────────────────────────────
export interface TestResult {
  /** Распределение баллов по RIASEC (нормализовано в 0..100). */
  riasec: Record<RiasecCode, number>;
  /** Топ-3 RIASEC. */
  topRiasec: RiasecCode[];
  values: Record<ValueCode, number>;
  topValues: ValueCode[];
  abilities: Record<AbilityCode, number>;
  topAbilities: AbilityCode[];
  subjects: Record<SchoolSubject, number>;
  topSubjects: SchoolSubject[];
  /** Топ-10 профессий, отсортированных по релевантности (0..100). */
  professions: { profession: Profession; score: number }[];
}
