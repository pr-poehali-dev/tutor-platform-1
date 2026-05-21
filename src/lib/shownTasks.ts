/**
 * Хранилище задач, которые пользователь уже видел.
 * Хранится в localStorage по ключу subject+topic+grade.
 * Передаётся на бэкенд при генерации новых задач, чтобы не было повторов.
 */

const STORAGE_KEY = "uchispro_shown_tasks_v1";
const MAX_PER_TOPIC = 80; // больше — чтобы реально широкое разнообразие
const MAX_RETURN = 25; // сколько отдаём бэкенду (промпт не должен раздуться)

type Store = Record<string, string[]>;

function key(subject: string, topic: string, grade?: string): string {
  return `${subject}::${grade || "-"}::${topic.toLowerCase().trim()}`;
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function save(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function normalize(question: string): string {
  return question.replace(/\s+/g, " ").trim();
}

/**
 * Получить список последних задач, чтобы исключить их при следующей генерации.
 */
export function getShownQuestions(subject: string, topic: string, grade?: string): string[] {
  if (!subject || !topic) return [];
  const store = load();
  const arr = store[key(subject, topic, grade)] || [];
  return arr.slice(-MAX_RETURN);
}

/**
 * Добавить задачи в историю «уже показанного». Дубликаты не сохраняются.
 */
export function addShownQuestions(
  subject: string,
  topic: string,
  questions: string[],
  grade?: string,
): void {
  if (!subject || !topic || !Array.isArray(questions) || questions.length === 0) return;
  const store = load();
  const k = key(subject, topic, grade);
  const existing = store[k] || [];
  const seen = new Set(existing.map((q) => q.toLowerCase()));
  for (const raw of questions) {
    const q = normalize(raw);
    if (!q) continue;
    if (seen.has(q.toLowerCase())) continue;
    existing.push(q);
    seen.add(q.toLowerCase());
  }
  // ограничиваем размер
  store[k] = existing.slice(-MAX_PER_TOPIC);
  save(store);
}

/**
 * Очистить историю задач по теме (если пользователь хочет начать заново).
 */
export function clearShownQuestions(subject: string, topic: string, grade?: string): void {
  if (!subject || !topic) return;
  const store = load();
  delete store[key(subject, topic, grade)];
  save(store);
}

/**
 * Сколько задач уже видел пользователь по теме.
 */
export function getShownCount(subject: string, topic: string, grade?: string): number {
  const store = load();
  return (store[key(subject, topic, grade)] || []).length;
}
