/**
 * Правила бесплатного доступа — «сколько отдаём даром».
 *
 * Логика продаж простая и честная: человек должен получить реальную пользу
 * бесплатно, упереться в границу на самом интересном месте и понять,
 * что дальше — за небольшие деньги.
 *
 * Все числа собраны здесь, чтобы менять их в одном месте без правки экранов.
 */

/** Сколько уроков мини-курса открыто без регистрации. */
export const FREE_LESSONS_BEFORE_SIGNUP = 1;

/** Сколько вопросов ИИ-репетитору можно задать без регистрации. */
export const FREE_AI_QUESTIONS_ANON = 5;

/** Сколько вопросов в сутки после регистрации, но без подписки. */
export const FREE_AI_QUESTIONS_USER = 15;

/** Сколько задач в тренажёре решается с разбором бесплатно. */
export const FREE_TASKS_WITH_SOLUTION = 3;

/** Ключи счётчиков в браузере. */
const K_AI = "uchispro_ai_used_v1";
const K_TASKS = "uchispro_tasks_used_v1";

interface Counter {
  /** Дата в формате ГГГГ-ММ-ДД — счётчик обнуляется каждые сутки. */
  day: string;
  n: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(key: string): Counter {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { day: today(), n: 0 };
    const c = JSON.parse(raw) as Counter;
    // Новый день — начинаем заново, чтобы человек возвращался завтра.
    return c.day === today() ? c : { day: today(), n: 0 };
  } catch {
    return { day: today(), n: 0 };
  }
}

function write(key: string, c: Counter) {
  try {
    localStorage.setItem(key, JSON.stringify(c));
  } catch {
    /* приватный режим браузера — лимит просто не сохранится */
  }
}

/** Сколько вопросов ИИ уже задано сегодня. */
export function aiUsed(): number {
  return read(K_AI).n;
}

/** Засчитать вопрос ИИ. Возвращает новое количество. */
export function aiConsume(): number {
  const c = read(K_AI);
  const next = { day: c.day, n: c.n + 1 };
  write(K_AI, next);
  return next.n;
}

/** Лимит вопросов для текущего состояния входа. */
export function aiLimit(isAuthenticated: boolean): number {
  return isAuthenticated ? FREE_AI_QUESTIONS_USER : FREE_AI_QUESTIONS_ANON;
}

/** Исчерпан ли лимит вопросов. */
export function aiExhausted(isAuthenticated: boolean, hasSubscription: boolean): boolean {
  if (hasSubscription) return false;
  return aiUsed() >= aiLimit(isAuthenticated);
}

/** Сколько задач с разбором уже открыто сегодня. */
export function tasksUsed(): number {
  return read(K_TASKS).n;
}

/** Засчитать открытый разбор задачи. */
export function tasksConsume(): number {
  const c = read(K_TASKS);
  const next = { day: c.day, n: c.n + 1 };
  write(K_TASKS, next);
  return next.n;
}

/** Исчерпан ли лимит разборов. */
export function tasksExhausted(hasSubscription: boolean): boolean {
  if (hasSubscription) return false;
  return tasksUsed() >= FREE_TASKS_WITH_SOLUTION;
}
