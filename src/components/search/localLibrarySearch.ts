import { LIBRARY, LIB_CATEGORIES } from "@/components/kids/libraryData";
import type { SearchItem } from "./api";

/**
 * Поиск по библиотеке сказок, стихов и рассказов.
 *
 * Зачем: библиотека живёт в коде сайта, а не в базе, поэтому серверный поиск
 * её не видел. Люди искали «Колобок», «Три поросёнка», «Муха-Цокотуха»
 * и получали пустую выдачу, хотя половина этих текстов на сайте есть.
 */

/** Приводим запрос к «общему знаменателю»: ё→е, дефисы и пробелы прочь. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,«»"'()\-–—!?:;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Убираем окончание, чтобы «поросёнка» находило «поросята». */
function stem(word: string): string {
  return word.length > 4 ? word.slice(0, Math.max(4, word.length - 2)) : word;
}

/**
 * Слова, по которым ищут «вообще»: «сказки», «стихи», «Пушкин».
 * Такой запрос должен показать подборку, а не пустоту.
 */
const BROAD: Record<string, (it: (typeof LIBRARY)[number]) => boolean> = {
  сказк: (it) => it.category === "fairy_tale",
  стих: (it) => it.category === "poem",
  стишк: (it) => it.category === "poem",
  рассказ: (it) => it.category === "story",
  басн: (it) => it.author.includes("Крылов"),
  народн: (it) => it.author.includes("народная"),
  малыш: (it) => it.ages.includes("1-3") || it.ages.includes("3-5"),
  "на ночь": (it) => it.durationMin <= 4,
  короткие: (it) => it.durationMin <= 3,
};

/**
 * Народные названия и опечатки → что реально есть в библиотеке.
 * Люди ищут не по каталожному названию, а по тому, как запомнили в детстве.
 */
const ALIASES: Record<string, string[]> = {
  "три поросенка": ["волк и семеро козлят", "три медведя"],
  поросенок: ["волк и семеро козлят", "три медведя"],
  "красная шапочка": ["волк и семеро козлят", "заюшкина избушка"],
  золушка: ["сивка бурка", "сказка о рыбаке и рыбке"],
  теремок: ["теремок"],
  колобок: ["колобок"],
  репка: ["репка"],
  "курочка ряба": ["курочка ряба"],
  "маша и медведь": ["маша и медведь", "три медведя"],
  "гуси лебеди": ["сивка бурка", "заюшкина избушка"],
  "по щучьему велению": ["сивка бурка"],
  морозко: ["сивка бурка"],
  "аленький цветочек": ["сказка о рыбаке и рыбке"],
  "кот в сапогах": ["кот петух и лиса"],
  буратино: ["сивка бурка"],
  чиполлино: ["сивка бурка"],
};

/**
 * Тексты, которых на сайте нет и не может быть по закону об авторском праве.
 * Чуковский умер в 1969 году — его сказки перейдут в общественное достояние
 * только в 2040-м. Честно говорим об этом, а не показываем пустоту.
 */
const COPYRIGHT_BLOCKED: { match: string[]; author: string; until: string }[] = [
  {
    match: ["муха цокотуха", "цокотуха", "мойдодыр", "айболит", "тараканище",
            "телефон чуковский", "федорино горе", "краденое солнце", "бармалей",
            "чуковский"],
    author: "Корней Чуковский",
    until: "2040",
  },
  {
    match: ["дядя степа", "michalkov", "михалков"],
    author: "Сергей Михалков",
    until: "2080",
  },
  {
    match: ["винни пух", "карлсон", "маугли", "чебурашка", "простоквашино",
            "дядя федор", "незнайка", "буратино толстой"],
    author: "современные авторы",
    until: "",
  },
];

export interface BlockedNotice {
  author: string;
  until: string;
}

/** Если ищут защищённое авторским правом — вернём объяснение, а не пустоту. */
export function findCopyrightNotice(query: string): BlockedNotice | null {
  const q = normalize(query);
  if (q.length < 3) return null;
  for (const rule of COPYRIGHT_BLOCKED) {
    if (rule.match.some((m) => q.includes(m) || m.includes(q))) {
      return { author: rule.author, until: rule.until };
    }
  }
  return null;
}

const CAT_LABEL: Record<string, string> = Object.fromEntries(
  LIB_CATEGORIES.map((c) => [c.id, c.label]),
);

/** Поиск по библиотеке: название, автор, теги + народные синонимы. */
export function searchLibrary(query: string, limit = 8): SearchItem[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const words = q.split(" ").filter((w) => w.length > 1);
  const aliasTargets = new Set<string>();
  for (const [alias, targets] of Object.entries(ALIASES)) {
    if (q.includes(alias) || alias.includes(q)) {
      targets.forEach((t) => aliasTargets.add(t));
    }
  }

  // Общие запросы: «сказки», «стихи», «басни», «на ночь»
  const broadKey = Object.keys(BROAD).find((k) => q.includes(k));

  const scored = LIBRARY.map((it) => {
    const title = normalize(it.title);
    // Фамилия автора без инициалов: «А. С. Пушкин» → ищется по «пушкин»
    const surname = normalize(it.author.replace(/[А-ЯЁ]\.\s*/g, ""));
    const hay = normalize(`${it.title} ${it.author} ${surname} ${it.tags.join(" ")}`);
    let score = 0;

    if (broadKey && BROAD[broadKey](it)) score += 25;
    if (surname && surname.includes(q) && q.length > 3) score += 45;

    if (title === q) score += 100;
    else if (title.startsWith(q)) score += 70;
    else if (title.includes(q)) score += 55;
    else if (hay.includes(q)) score += 35;

    // Совпадение по основам слов: «поросёнка» → «поросята»
    if (score === 0 && words.length) {
      const hit = words.filter((w) => hay.includes(stem(w))).length;
      if (hit) score += 20 * hit;
    }

    if (aliasTargets.has(title)) score += 30;

    return { it, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ it, score }) => ({
    kind: "lesson" as const,
    title: it.title,
    subtitle: it.author
      ? `${it.author} · ${it.durationMin} мин чтения`
      : `${it.durationMin} мин чтения`,
    category: CAT_LABEL[it.category] || "Библиотека",
    emoji: it.emoji,
    url: `/kids/library/${it.id}`,
    extra: it.morale,
    score,
  }));
}