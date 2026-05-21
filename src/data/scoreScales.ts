export interface ScoreScale {
  id: string;
  name: string;
  type: "ЕГЭ" | "ОГЭ";
  maxPrimary: number;
  passingPrimary: number;
  passingSecondary: number;
  description: string;
  scale: Array<{ primary: number; secondary: number }>;
}

const linearScale = (
  maxPrimary: number,
  maxSecondary: number = 100,
  passPrimary: number = 0,
  passSecondary: number = 0,
): Array<{ primary: number; secondary: number }> => {
  const arr: Array<{ primary: number; secondary: number }> = [];
  for (let p = 0; p <= maxPrimary; p++) {
    let s = 0;
    if (p === 0) s = 0;
    else if (p <= passPrimary) s = Math.round((p / passPrimary) * passSecondary);
    else
      s = Math.round(
        passSecondary +
          ((p - passPrimary) / (maxPrimary - passPrimary)) * (maxSecondary - passSecondary),
      );
    arr.push({ primary: p, secondary: Math.min(s, maxSecondary) });
  }
  return arr;
};

export const SCORE_SCALES: ScoreScale[] = [
  {
    id: "math-prof",
    name: "Математика (профиль)",
    type: "ЕГЭ",
    maxPrimary: 32,
    passingPrimary: 7,
    passingSecondary: 27,
    description: "Минимальный для аттестата — 27 баллов, для вуза обычно от 39.",
    scale: linearScale(32, 100, 7, 27),
  },
  {
    id: "math-base",
    name: "Математика (база)",
    type: "ЕГЭ",
    maxPrimary: 21,
    passingPrimary: 7,
    passingSecondary: 3,
    description: "Оценивается по 5-балльной шкале. Оценка 3 — с 7 первичных баллов.",
    scale: [
      { primary: 0, secondary: 2 },
      { primary: 1, secondary: 2 },
      { primary: 2, secondary: 2 },
      { primary: 3, secondary: 2 },
      { primary: 4, secondary: 2 },
      { primary: 5, secondary: 2 },
      { primary: 6, secondary: 2 },
      { primary: 7, secondary: 3 },
      { primary: 8, secondary: 3 },
      { primary: 9, secondary: 3 },
      { primary: 10, secondary: 3 },
      { primary: 11, secondary: 3 },
      { primary: 12, secondary: 4 },
      { primary: 13, secondary: 4 },
      { primary: 14, secondary: 4 },
      { primary: 15, secondary: 4 },
      { primary: 16, secondary: 4 },
      { primary: 17, secondary: 5 },
      { primary: 18, secondary: 5 },
      { primary: 19, secondary: 5 },
      { primary: 20, secondary: 5 },
      { primary: 21, secondary: 5 },
    ],
  },
  {
    id: "russian",
    name: "Русский язык",
    type: "ЕГЭ",
    maxPrimary: 50,
    passingPrimary: 10,
    passingSecondary: 24,
    description: "Минимальный для аттестата — 24, для вуза — 36 баллов.",
    scale: linearScale(50, 100, 10, 24),
  },
  {
    id: "physics",
    name: "Физика",
    type: "ЕГЭ",
    maxPrimary: 45,
    passingPrimary: 11,
    passingSecondary: 36,
    description: "Минимальный для вуза — 36 баллов.",
    scale: linearScale(45, 100, 11, 36),
  },
  {
    id: "informatics",
    name: "Информатика",
    type: "ЕГЭ",
    maxPrimary: 29,
    passingPrimary: 6,
    passingSecondary: 40,
    description: "Минимальный для вуза — 40 баллов.",
    scale: linearScale(29, 100, 6, 40),
  },
  {
    id: "social",
    name: "Обществознание",
    type: "ЕГЭ",
    maxPrimary: 58,
    passingPrimary: 14,
    passingSecondary: 42,
    description: "Минимальный для вуза — 42 балла.",
    scale: linearScale(58, 100, 14, 42),
  },
];

export const getScale = (id: string) => SCORE_SCALES.find((s) => s.id === id);

export const primaryToSecondary = (scaleId: string, primary: number): number => {
  const scale = getScale(scaleId);
  if (!scale) return 0;
  const point = scale.scale.find((p) => p.primary === primary);
  return point?.secondary ?? 0;
};

export const getGrade = (
  scaleId: string,
  secondary: number,
): { grade: string; color: string; comment: string } => {
  const scale = getScale(scaleId);
  if (!scale) return { grade: "—", color: "#888", comment: "" };

  if (scale.id === "math-base") {
    const map: Record<number, { grade: string; color: string; comment: string }> = {
      2: { grade: "2", color: "#ef4444", comment: "Не сдано — аттестат не получить" },
      3: { grade: "3", color: "#f59e0b", comment: "Аттестат получен" },
      4: { grade: "4", color: "#3b82f6", comment: "Хорошо" },
      5: { grade: "5", color: "#10b981", comment: "Отлично" },
    };
    return map[secondary] ?? { grade: "—", color: "#888", comment: "" };
  }

  if (secondary < scale.passingSecondary)
    return {
      grade: "Не сдано",
      color: "#ef4444",
      comment: `Минимум для аттестата — ${scale.passingSecondary} баллов.`,
    };
  if (secondary < 60)
    return {
      grade: "Слабо",
      color: "#f59e0b",
      comment: "Для большинства вузов нужно от 60 баллов.",
    };
  if (secondary < 80)
    return {
      grade: "Хорошо",
      color: "#3b82f6",
      comment: "Достаточно для региональных вузов и многих московских.",
    };
  if (secondary < 90)
    return {
      grade: "Очень хорошо",
      color: "#a855f7",
      comment: "Конкурентный балл для топовых вузов.",
    };
  return {
    grade: "Отлично",
    color: "#10b981",
    comment: "Высокий результат — путь в ведущие вузы страны.",
  };
};
