#!/usr/bin/env node
/**
 * Эталонная проверка соответствия курсов сайта.
 *
 * Что проверяет:
 *  1. Уникальность id курсов.
 *  2. Заполнены обязательные поля (title, description, tags).
 *  3. Соответствие НАЗВАНИЯ ↔ СОДЕРЖАНИЯ: предмет курса (subject) должен
 *     подтверждаться ключевыми словами в названии / описании / тегах.
 *  4. Соответствие класса (grade) названию: курсы ЕГЭ/ОГЭ обязаны называть
 *     свой экзамен в заголовке.
 *
 * Запуск:  node scripts/checkCoursesIntegrity.mjs
 * Успех — код возврата 0, при найденных проблемах — код 1 (удобно для CI).
 *
 * Это «эталон» соответствия: если кто-то заведёт курс с названием, не
 * отвечающим его содержанию, проверка это поймает.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../src/components/courses/coursesData.ts");

// Ключевые слова, ожидаемые в названии/описании/тегах для каждого предмета.
// Это эталонный словарь тематик сайта.
const SUBJECT_KEYWORDS = {
  math: ["матем", "геометр", "тригонометр", "алгебр", "дроб", "уравнен", "олимпиад", "процент"],
  physics: ["физик", "механик", "электро", "квант", "давлен", "поле"],
  chemistry: ["хими", "реакц", "органич", "вещест", "соединен"],
  cs: ["python", "код", "програм", "веб", "сайт", "scratch", "разработчик", "junior", "информатик"],
  ai: ["нейросет", "ии", " ai", "машинн", "промпт", "telegram", "бот", "ассистент", "agent"],
  english: ["англ", "english", "грамматик"],
  russian: ["русск", "орфограф", "пунктуац", "запят", "сочинен"],
  literature: ["литератур", "сочинен", "классик", "журналист", "слов"],
  history: ["истори", "пирамид", "росси", "всемирн"],
  biology: ["биолог", "анатом", "природ", "тело"],
  society: ["обществ", "финанс", "грамотн"],
  geography: ["географ", "росси", "камчатк", "калининград"],
  logic: ["логик", "головолом", "алгоритм", "мышлен", "комбинатор", "множеств"],
  skills: ["эмоц", "выступлен", "тайм", "менеджмент", "интеллект"],
  career: ["профес", "вуз", "поступлен", "стать", "будущ"],
  business: ["mba", "бизнес", " ип", "налог", "предпринимат", "запуск"],
  marketing: ["маркет", "реклам", "рассыл"],
  chinese: ["китайск", "иероглиф", "тон"],
  korean: ["корейск", "хангыль", "k-pop", "kpop"],
  datascience: ["data", "данн", "sql", "excel", "аналит", "python", "дашборд"],
  product: ["product", "продукт", "менеджер"],
  avangard: ["avangard", "ии", "ассистент", "бизнес", "прораб", "снип", "стройк"],
  roomscan: ["roomscan", "3d", "сканир", "помещен", "замер"],
  gamedev: ["гейм", "игр", "дизайн"],
  "3d": ["3d", "blender", "модел", "анимац"],
  design: ["дизайн", "figma", "график"],
  robotics: ["робот", "arduino"],
  smartmach: ["смартмаш", "производ", "цифровизац", "чпу", "cam", "cae", "mes"],
  prompteng: ["промпт", "prompt"],
  neuroincome: ["нейросет", "заработок", "reels", "контент", "доход"],
  tenders: ["тендер", "госзакуп", "44-фз", "223-фз", "еис"],
  ved: ["вэд", "таможн", "импорт", "контракт", "валют"],
  sales: ["продаж", "b2b", "лид", "сделк"],
  psychology: ["психолог", "кпт", "act", "dbt", "терап", "коуч"],
  personalbrand: ["бренд", "нлп", "влиян", "smm", "репутац", "контент", "эксперт"],
};

function parseCourses(ts) {
  const start = ts.indexOf("export const COURSES");
  const body = ts.slice(start);
  const objects = [...body.matchAll(/\{\s*id:\s*(\d+),([\s\S]*?)\n {2}\}/g)];
  return objects.map((m) => {
    const [, id, txt] = m;
    const str = (name) => {
      const mm = txt.match(new RegExp(name + ':\\s*"((?:[^"\\\\]|\\\\.)*)"'));
      return mm ? mm[1] : "";
    };
    const raw = (name) => {
      const mm = txt.match(new RegExp(name + ":\\s*([\\w\\-]+)"));
      return mm ? mm[1] : "";
    };
    const tagsM = txt.match(/tags:\s*\[([\s\S]*?)\]/);
    return {
      id: Number(id),
      subject: raw("subject") || str("subject"),
      title: str("title"),
      grade: raw("grade") || str("grade"),
      description: str("description"),
      tags: tagsM ? tagsM[1] : "",
    };
  });
}

function main() {
  const ts = readFileSync(DATA_PATH, "utf8");
  const courses = parseCourses(ts);
  const problems = [];

  const seen = new Map();
  for (const c of courses) {
    if (seen.has(c.id)) problems.push(`Дубликат id=${c.id} ("${c.title}" и "${seen.get(c.id)}")`);
    seen.set(c.id, c.title);

    if (!c.title) problems.push(`id=${c.id}: пустое название`);
    if (!c.description || c.description.length < 20)
      problems.push(`id=${c.id} "${c.title}": слишком короткое описание`);

    const blob = `${c.title} ${c.description} ${c.tags}`.toLowerCase();
    const kws = SUBJECT_KEYWORDS[c.subject];
    if (kws && !kws.some((k) => blob.includes(k))) {
      problems.push(
        `id=${c.id} "${c.title}": содержание не подтверждает предмет "${c.subject}" ` +
          `(не найдено ни одного ключевого слова темы)`
      );
    }

    const t = c.title.toLowerCase();
    if (c.grade === "ege" && !t.includes("егэ"))
      problems.push(`id=${c.id} "${c.title}": grade=ege, но в названии нет "ЕГЭ"`);
    if (c.grade === "oge" && !t.includes("огэ"))
      problems.push(`id=${c.id} "${c.title}": grade=oge, но в названии нет "ОГЭ"`);
  }

  console.log(`Проверено курсов: ${courses.length}`);
  if (problems.length === 0) {
    console.log("✓ Эталон соблюдён: все названия курсов соответствуют содержанию.");
    process.exit(0);
  }
  console.log(`\n✗ Найдено расхождений: ${problems.length}\n`);
  for (const p of problems) console.log("  • " + p);
  process.exit(1);
}

main();
