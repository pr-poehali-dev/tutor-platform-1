/** Подбор персоны/голоса ИИ-преподавателя по предмету курса.
 *  Голоса: alex (М, математика/IT/инженерия), sofia (Ж, языки),
 *  dmitry (М, естественные науки), nika (Ж, гуманитарные). */
const SUBJECT_TO_TEACHER: Record<string, string> = {
  math: "alex",
  cs: "alex",
  ai: "alex",
  datascience: "alex",
  logic: "alex",
  robotics: "alex",
  smartmach: "alex",
  product: "alex",
  gamedev: "alex",
  "3d": "alex",
  design: "alex",

  physics: "dmitry",
  chemistry: "dmitry",
  biology: "dmitry",
  geography: "dmitry",

  english: "sofia",
  chinese: "sofia",
  korean: "sofia",

  russian: "nika",
  literature: "nika",
  history: "nika",
  society: "nika",
  career: "nika",
  skills: "nika",
  business: "nika",
  marketing: "nika",
  avangard: "alex",
  roomscan: "dmitry",
};

export function teacherForSubject(subject: string): string {
  return SUBJECT_TO_TEACHER[subject] || "alex";
}

export const TEACHER_DISPLAY: Record<string, { name: string; emoji: string }> = {
  alex: { name: "Алекс", emoji: "👨‍🏫" },
  sofia: { name: "София", emoji: "👩‍🏫" },
  dmitry: { name: "Дмитрий", emoji: "🧑‍🔬" },
  nika: { name: "Ника", emoji: "👩‍🎓" },
};
