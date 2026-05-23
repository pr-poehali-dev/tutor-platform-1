import { PracticeProblem } from "@/components/practice/types";
import { PROBLEMS as RAW_PROBLEMS } from "@/components/math/problemsData";

/** Карта числовых ответов для авто-проверки математических задач Виленкина. */
const ANSWER_MAP: Record<number, { expected: string[]; mode?: "numeric" | "exact"; tol?: number; placeholder?: string }> = {
  1: { expected: ["450"], mode: "numeric", placeholder: "Число, например 450" },
  2: { expected: ["486"], mode: "numeric", placeholder: "Число учеников" },
  3: { expected: ["2.4", "12/5", "2 ч 24 мин"], mode: "numeric", tol: 0.05, placeholder: "Часы (можно дробью 12/5 или 2.4)" },
  4: { expected: ["3600"], mode: "numeric", placeholder: "Цена в рублях" },
  5: { expected: ["28"], mode: "numeric", placeholder: "Процент (число)" },
  6: { expected: ["560"], mode: "numeric", placeholder: "Сумма в рублях" },
  7: { expected: ["4"], mode: "numeric", placeholder: "Число дней" },
  8: { expected: ["0"], mode: "numeric", placeholder: "Температура в °C" },
  9: { expected: ["12"], mode: "numeric", placeholder: "Значение x" },
  10: { expected: ["3"], mode: "numeric", placeholder: "Часы" },
  11: { expected: ["2", "3.33", "10/3"], mode: "numeric", tol: 0.1, placeholder: "Часы по течению" },
  12: { expected: ["4.8", "24/5"], mode: "numeric", tol: 0.05, placeholder: "Дни (4.8 или 24/5)" },
  13: { expected: ["20"], mode: "numeric", placeholder: "Концентрация в %" },
  14: { expected: ["20"], mode: "numeric", placeholder: "Концентрация в %" },
  15: { expected: ["1884"], mode: "numeric", tol: 2, placeholder: "Метры" },
  16: { expected: ["78.5"], mode: "numeric", tol: 0.2, placeholder: "Площадь в м²" },
};

export const MATH_PROBLEMS: PracticeProblem[] = RAW_PROBLEMS.map((p) => {
  const meta = ANSWER_MAP[p.id];
  return {
    ...p,
    expectedAnswers: meta?.expected,
    checkMode: meta?.mode ?? "numeric",
    tolerance: meta?.tol,
    answerPlaceholder: meta?.placeholder,
  };
});

export const MATH_TOPICS = [
  { id: "fractions", label: "Дроби", emoji: "🍕" },
  { id: "percent", label: "Проценты", emoji: "%" },
  { id: "ratio", label: "Пропорции", emoji: "⚖️" },
  { id: "negative", label: "Отриц. числа", emoji: "±" },
  { id: "equations", label: "Уравнения", emoji: "🟰" },
  { id: "motion", label: "Движение", emoji: "🚗" },
  { id: "work", label: "Работа", emoji: "🛠️" },
  { id: "mixture", label: "Смеси и сплавы", emoji: "🧪" },
  { id: "geometry", label: "Геометрия", emoji: "📐" },
];
