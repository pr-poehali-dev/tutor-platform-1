/** Предметы, для которых генератор уроков знает специфику. */
const SUPPORTED = new Set([
  "math", "physics", "english", "russian", "chinese", "korean", "datascience", "product", "avangard",
  "roomscan", "business", "chemistry", "biology", "cs", "ai", "history", "society", "geography",
  "logic", "skills", "career", "literature", "marketing", "robotics", "smartmach", "psychology",
  "personalbrand", "hr", "tenders", "ved", "sales", "gamedev", "3d", "design",
]);

/** Близкие соответствия для курсов без собственного набора тем. */
const ALIASES: Record<string, string> = {
  prompteng: "ai", neuroincome: "ai", cybersec: "cs", devops: "cs", aiagents: "ai", vibecoding: "ai",
  marketplaces: "business", smm: "marketing", accounting: "business", autocad: "design", trading: "business",
};

/** Предмет курса → предмет генератора. Неизвестный предмет НЕ превращается в математику:
 *  сервер сам строит урок по названию курса и урока. */
export function lessonSubject(subject: string): string {
  if (SUPPORTED.has(subject)) return subject;
  return ALIASES[subject] ?? subject ?? "general";
}

export function lessonGrade(grade: string): string {
  if (["5-9", "10-11", "ege"].includes(grade)) return grade;
  if (grade === "oge" || grade === "1-4") return "5-9";
  return "10-11";
}
