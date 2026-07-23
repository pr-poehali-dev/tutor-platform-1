export interface ChecklistOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface ChecklistStep {
  key: string;
  question: string;
  hint?: string;
  type: "single" | "multi" | "text";
  options?: ChecklistOption[];
  placeholder?: string;
  optional?: boolean;
}

// Чек-лист профориентации: ответы уходят ИИ, который собирает индивидуальный курс.
export const CHECKLIST: ChecklistStep[] = [
  {
    key: "goal",
    question: "Кем вы хотите стать или какой результат получить?",
    hint: "Своими словами — чем конкретнее, тем точнее курс. Например: «сменить профессию на дизайнера», «научиться управлять командой», «запустить своё дело».",
    type: "text",
    placeholder: "Например: хочу освоить аналитику данных и перейти в IT",
  },
  {
    key: "field",
    question: "Какая сфера вам ближе?",
    type: "single",
    options: [
      { value: "it", label: "IT и технологии", emoji: "💻" },
      { value: "design", label: "Дизайн и креатив", emoji: "🎨" },
      { value: "management", label: "Управление и бизнес", emoji: "📈" },
      { value: "marketing", label: "Маркетинг и продажи", emoji: "🎯" },
      { value: "finance", label: "Финансы и аналитика", emoji: "💰" },
      { value: "helping", label: "Помогающие профессии", emoji: "🤝" },
      { value: "creative", label: "Творчество и медиа", emoji: "🎬" },
      { value: "other", label: "Другое / пока не решил", emoji: "✨" },
    ],
  },
  {
    key: "level",
    question: "Ваш текущий уровень в этой сфере?",
    type: "single",
    options: [
      { value: "zero", label: "С нуля, ещё не пробовал", emoji: "🌱" },
      { value: "basic", label: "Есть база, но неуверенно", emoji: "📘" },
      { value: "middle", label: "Уже работаю, хочу вырасти", emoji: "🚀" },
      { value: "switch", label: "Меняю профессию", emoji: "🔄" },
    ],
  },
  {
    key: "skills",
    question: "Какие навыки хотите освоить? (можно несколько)",
    hint: "Отметьте всё, что важно — ИИ соберёт курс вокруг этих навыков.",
    type: "multi",
    options: [
      { value: "hard", label: "Профессиональные (hard) навыки" },
      { value: "tools", label: "Работа с инструментами и программами" },
      { value: "ai", label: "Нейросети и ИИ в работе" },
      { value: "communication", label: "Коммуникация и переговоры" },
      { value: "management", label: "Управление людьми и проектами" },
      { value: "money", label: "Как зарабатывать на этом" },
      { value: "portfolio", label: "Портфолио и первые заказы" },
      { value: "confidence", label: "Уверенность и самопрезентация" },
    ],
  },
  {
    key: "time",
    question: "Сколько времени готовы уделять обучению?",
    type: "single",
    options: [
      { value: "2-3", label: "2–3 часа в неделю", emoji: "🐢" },
      { value: "4-6", label: "4–6 часов в неделю", emoji: "🚶" },
      { value: "7-10", label: "7–10 часов в неделю", emoji: "🏃" },
      { value: "10+", label: "Больше 10 часов — хочу быстро", emoji: "⚡" },
    ],
  },
  {
    key: "motivation",
    question: "Что вас мотивирует сильнее всего?",
    type: "single",
    options: [
      { value: "career", label: "Новая профессия и доход", emoji: "💼" },
      { value: "growth", label: "Рост на текущей работе", emoji: "📈" },
      { value: "business", label: "Своё дело / фриланс", emoji: "🧑‍💻" },
      { value: "self", label: "Развитие для себя", emoji: "🌟" },
    ],
  },
  {
    key: "obstacles",
    question: "Что мешало учиться раньше? (необязательно)",
    hint: "Это поможет собрать курс так, чтобы вы дошли до конца.",
    type: "text",
    placeholder: "Например: не хватало времени, бросал на середине, много воды в курсах",
    optional: true,
  },
];

export function labelFor(step: ChecklistStep, value: string): string {
  return step.options?.find((o) => o.value === value)?.label || value;
}
