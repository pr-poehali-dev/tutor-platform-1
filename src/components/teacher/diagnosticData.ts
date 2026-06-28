// Диагностические тесты по предметам. Вопросы идут от простого к сложному,
// каждый привязан к разделу курса (moduleId). По числу правильных ответов
// определяем уровень и рекомендуем раздел, с которого начать.

export interface DiagQuestion {
  id: string;
  moduleId: string; // раздел курса, который проверяет вопрос
  text: string;
  options: string[];
  correct: number; // индекс правильного варианта
}

export interface DiagResult {
  level: string;
  emoji: string;
  comment: string;
}

// Вопросы упорядочены по нарастанию сложности.
export const DIAGNOSTICS: Record<string, DiagQuestion[]> = {
  physics: [
    {
      id: "dp-1",
      moduleId: "ph-kin",
      text: "Тело прошло 100 м за 20 с равномерно. Чему равна его скорость?",
      options: ["2 м/с", "5 м/с", "20 м/с", "2000 м/с"],
      correct: 1,
    },
    {
      id: "dp-2",
      moduleId: "ph-dyn",
      text: "Что утверждает второй закон Ньютона?",
      options: [
        "Тело покоится без сил",
        "Сила равна массе на ускорение (F = ma)",
        "Действие равно противодействию",
        "Энергия сохраняется",
      ],
      correct: 1,
    },
    {
      id: "dp-3",
      moduleId: "ph-curr",
      text: "По закону Ома сила тока на участке равна:",
      options: [
        "Произведению напряжения и сопротивления",
        "Напряжению, делённому на сопротивление",
        "Сопротивлению, делённому на напряжение",
        "Сумме напряжения и сопротивления",
      ],
      correct: 1,
    },
    {
      id: "dp-4",
      moduleId: "ph-mkt",
      text: "В каком процессе газа температура остаётся постоянной?",
      options: ["Изобарном", "Изохорном", "Изотермическом", "Адиабатном"],
      correct: 2,
    },
    {
      id: "dp-5",
      moduleId: "ph-quant",
      text: "Уравнение Эйнштейна для фотоэффекта связывает энергию фотона с:",
      options: [
        "Только с массой электрона",
        "Работой выхода и кинетической энергией электрона",
        "Силой тока в цепи",
        "Температурой металла",
      ],
      correct: 1,
    },
  ],
  math: [
    {
      id: "dm-1",
      moduleId: "m-base",
      text: "Сколько будет 25% от числа 80?",
      options: ["15", "20", "25", "40"],
      correct: 1,
    },
    {
      id: "dm-2",
      moduleId: "m-algebra",
      text: "Корни уравнения x² − 5x + 6 = 0 это:",
      options: ["1 и 6", "2 и 3", "−2 и −3", "0 и 5"],
      correct: 1,
    },
    {
      id: "dm-3",
      moduleId: "m-trig",
      text: "Чему равен sin(30°)?",
      options: ["0", "1/2", "√3/2", "1"],
      correct: 1,
    },
    {
      id: "dm-4",
      moduleId: "m-log",
      text: "Чему равен log₂(8)?",
      options: ["2", "3", "4", "8"],
      correct: 1,
    },
    {
      id: "dm-5",
      moduleId: "m-calc",
      text: "Производная функции f(x) = x³ равна:",
      options: ["3x²", "x²", "3x", "x⁴/4"],
      correct: 0,
    },
  ],
  cs: [
    {
      id: "dc-1",
      moduleId: "cs-base",
      text: "Число 5 в двоичной системе записывается как:",
      options: ["100", "101", "110", "111"],
      correct: 1,
    },
    {
      id: "dc-2",
      moduleId: "cs-logic",
      text: "Результат выражения «истина И ложь» равен:",
      options: ["Истина", "Ложь", "Не определено", "Зависит от порядка"],
      correct: 1,
    },
    {
      id: "dc-3",
      moduleId: "cs-python",
      text: "Что выведет код на Python: print(2 ** 3)?",
      options: ["6", "8", "9", "23"],
      correct: 1,
    },
    {
      id: "dc-4",
      moduleId: "cs-adv",
      text: "Рекурсивная функция — это функция, которая:",
      options: [
        "Выполняется один раз",
        "Вызывает саму себя",
        "Не возвращает значение",
        "Работает только с числами",
      ],
      correct: 1,
    },
    {
      id: "dc-5",
      moduleId: "cs-ege",
      text: "Алгоритм бинарного поиска работает только на массиве, который:",
      options: [
        "Заполнен случайно",
        "Отсортирован",
        "Состоит из строк",
        "Пустой",
      ],
      correct: 1,
    },
  ],
};

// Определяем уровень и рекомендуемый раздел по числу правильных ответов.
export function evaluateDiagnostic(
  courseId: string,
  answers: number[],
): { result: DiagResult; recommendedModuleId: string } {
  const questions = DIAGNOSTICS[courseId] || [];
  const correctFlags = questions.map((q, i) => answers[i] === q.correct);
  const score = correctFlags.filter(Boolean).length;

  // Рекомендуем первый раздел, где ученик ошибся (с него и начинать).
  const firstWrongIdx = correctFlags.findIndex(f => !f);
  const recommendedModuleId =
    firstWrongIdx === -1
      ? questions[questions.length - 1].moduleId // всё верно — берём финальный блок (ЕГЭ/ДВИ)
      : questions[firstWrongIdx].moduleId;

  let result: DiagResult;
  if (score <= 1) {
    result = { level: "Начальный уровень", emoji: "🌱", comment: "Начнём с основ — построим прочный фундамент шаг за шагом." };
  } else if (score <= 3) {
    result = { level: "Базовый уровень", emoji: "📘", comment: "Хорошая база есть. Подтянем пробелы и пойдём дальше." };
  } else if (score === 4) {
    result = { level: "Уверенный уровень", emoji: "🚀", comment: "Сильный результат! Сфокусируемся на сложных темах." };
  } else {
    result = { level: "Продвинутый уровень", emoji: "🏆", comment: "Отличная подготовка! Идём прямо к задачам ЕГЭ и ДВИ Бауманки." };
  }

  return { result, recommendedModuleId };
}
