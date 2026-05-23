import { AGES, AREAS, ACTIVITIES, Activity, AgeStage, AgeSlug } from "@/components/kids/kidsData";

export type ScoreLevel = "behind" | "normal" | "ahead";

export interface DiagnosticOption {
  label: string;
  score: 0 | 1 | 2; // 0 — отстаёт, 1 — норма, 2 — опережает
}

export interface DiagnosticQuestion {
  areaId: string; // соответствует AREAS.id
  text: string;
  options: DiagnosticOption[];
}

/** Карта вопросов: ageSlug → 6 вопросов (по 1 на каждое из 6 направлений) */
type QuestionMap = Record<AgeSlug, DiagnosticQuestion[]>;

export const DIAGNOSTIC_QUESTIONS: QuestionMap = {
  "1-2": [
    {
      areaId: "speech",
      text: "Сколько слов есть в активном словаре малыша?",
      options: [
        { label: "Меньше 5 слов или только лепет", score: 0 },
        { label: "10–30 слов, появляются первые фразы из 2 слов", score: 1 },
        { label: "Больше 50 слов, говорит фразами", score: 2 },
      ],
    },
    {
      areaId: "logic",
      text: "Умеет ли соотносить простые формы (круг/квадрат) с отверстиями?",
      options: [
        { label: "Ещё не пробовали или не получается", score: 0 },
        { label: "С помощью взрослого справляется", score: 1 },
        { label: "Уверенно играет с сортером сам", score: 2 },
      ],
    },
    {
      areaId: "world",
      text: "Узнаёт ли животных на картинках и подражает их голосам?",
      options: [
        { label: "Пока не узнаёт", score: 0 },
        { label: "Знает 3–5 животных", score: 1 },
        { label: "Знает 10+ животных, легко повторяет звуки", score: 2 },
      ],
    },
    {
      areaId: "motor",
      text: "Как держит ложку и пьёт из кружки?",
      options: [
        { label: "Нужна помощь взрослого", score: 0 },
        { label: "Ест ложкой сам, иногда промахивается", score: 1 },
        { label: "Аккуратно ест и пьёт сам", score: 2 },
      ],
    },
    {
      areaId: "creative",
      text: "Интересуется ли карандашами/красками?",
      options: [
        { label: "Не интересуется", score: 0 },
        { label: "Любит чиркать, ставит точки и линии", score: 1 },
        { label: "Сам просит порисовать, рисует круги", score: 2 },
      ],
    },
    {
      areaId: "social",
      text: "Как малыш реагирует на эмоции близких?",
      options: [
        { label: "Не замечает", score: 0 },
        { label: "Реагирует, но не всегда понимает", score: 1 },
        { label: "Подходит обнять/пожалеть, считывает настроение", score: 2 },
      ],
    },
  ],
  "2-3": [
    {
      areaId: "speech",
      text: "Говорит ли ребёнок фразами из 3-4 слов?",
      options: [
        { label: "Только отдельные слова", score: 0 },
        { label: "Простые фразы, иногда с ошибками", score: 1 },
        { label: "Свободно строит предложения", score: 2 },
      ],
    },
    {
      areaId: "logic",
      text: "Считает ли до 3 или больше?",
      options: [
        { label: "Не считает", score: 0 },
        { label: "Знает счёт до 3", score: 1 },
        { label: "Считает до 5+ и понимает «сколько»", score: 2 },
      ],
    },
    {
      areaId: "world",
      text: "Различает ли время суток (день/ночь) и времена года?",
      options: [
        { label: "Пока не понимает", score: 0 },
        { label: "Знает день и ночь", score: 1 },
        { label: "Знает день/ночь и хотя бы 2 сезона", score: 2 },
      ],
    },
    {
      areaId: "motor",
      text: "Умеет ли застёгивать крупные пуговицы / надевать носки?",
      options: [
        { label: "Ещё не получается", score: 0 },
        { label: "Носки — да, пуговицы — пока нет", score: 1 },
        { label: "Делает сам и носки, и пуговицы", score: 2 },
      ],
    },
    {
      areaId: "creative",
      text: "Лепит ли из пластилина простые фигурки (шарик, колбаска)?",
      options: [
        { label: "Не лепит", score: 0 },
        { label: "Катает шарики и колбаски с помощью", score: 1 },
        { label: "Сам делает несколько фигурок", score: 2 },
      ],
    },
    {
      areaId: "social",
      text: "Играет ли рядом с другими детьми?",
      options: [
        { label: "Прячется или плачет", score: 0 },
        { label: "Играет рядом, но не вместе", score: 1 },
        { label: "Делится игрушками, играет вместе", score: 2 },
      ],
    },
  ],
  "3-4": [
    {
      areaId: "speech",
      text: "Может ли пересказать короткую сказку или мультик?",
      options: [
        { label: "Только отдельные слова", score: 0 },
        { label: "Перескажет с подсказками", score: 1 },
        { label: "Подробно рассказывает сам", score: 2 },
      ],
    },
    {
      areaId: "logic",
      text: "Считает ли до 10?",
      options: [
        { label: "До 3", score: 0 },
        { label: "До 5–7", score: 1 },
        { label: "До 10 и обратно", score: 2 },
      ],
    },
    {
      areaId: "world",
      text: "Знает ли названия 3+ профессий и что они делают?",
      options: [
        { label: "Пока не знает", score: 0 },
        { label: "Знает 1–2 (врач, продавец)", score: 1 },
        { label: "Знает 5+ профессий", score: 2 },
      ],
    },
    {
      areaId: "motor",
      text: "Как ребёнок держит карандаш?",
      options: [
        { label: "В кулаке", score: 0 },
        { label: "Тремя пальцами, но напряжённо", score: 1 },
        { label: "Уверенно, как взрослый", score: 2 },
      ],
    },
    {
      areaId: "creative",
      text: "Рисует ли узнаваемые фигуры (человечек, домик, солнце)?",
      options: [
        { label: "Только каракули", score: 0 },
        { label: "Рисует круги, линии, иногда «головонога»", score: 1 },
        { label: "Узнаваемые человечки и предметы", score: 2 },
      ],
    },
    {
      areaId: "social",
      text: "Понимает ли «свои» и «чужие» эмоции?",
      options: [
        { label: "Пока нет", score: 0 },
        { label: "Узнаёт радость, грусть, злость", score: 1 },
        { label: "Различает 5+ эмоций, говорит про чувства", score: 2 },
      ],
    },
  ],
  "4-5": [
    {
      areaId: "speech",
      text: "Знает ли ребёнок буквы алфавита?",
      options: [
        { label: "Меньше 5 букв", score: 0 },
        { label: "Знает 10–20 букв", score: 1 },
        { label: "Знает большинство букв, читает слоги", score: 2 },
      ],
    },
    {
      areaId: "logic",
      text: "Считает ли до 20 и понимает состав чисел?",
      options: [
        { label: "До 10", score: 0 },
        { label: "До 20, но без состава чисел", score: 1 },
        { label: "До 20, знает состав 5 и 10", score: 2 },
      ],
    },
    {
      areaId: "world",
      text: "Знает ли свой адрес, имена родителей, день рождения?",
      options: [
        { label: "Только имя", score: 0 },
        { label: "Знает имена родителей и сколько лет", score: 1 },
        { label: "Знает адрес, ДР, имена родителей", score: 2 },
      ],
    },
    {
      areaId: "motor",
      text: "Может ли вырезать ножницами по линии?",
      options: [
        { label: "Не работает с ножницами", score: 0 },
        { label: "Режет по прямой, но криво", score: 1 },
        { label: "Точно режет по прямой и кривой", score: 2 },
      ],
    },
    {
      areaId: "creative",
      text: "Сам ли придумывает сюжеты в играх?",
      options: [
        { label: "Играет в простые повторяющиеся действия", score: 0 },
        { label: "Иногда строит небольшие сюжеты", score: 1 },
        { label: "Развёрнутые сюжетно-ролевые игры", score: 2 },
      ],
    },
    {
      areaId: "social",
      text: "Способен ли подождать или уступить очередь?",
      options: [
        { label: "С трудом, через слёзы", score: 0 },
        { label: "Иногда — с напоминанием", score: 1 },
        { label: "Спокойно ждёт и уступает", score: 2 },
      ],
    },
  ],
  "5-6": [
    {
      areaId: "speech",
      text: "Читает ли по слогам?",
      options: [
        { label: "Пока не читает", score: 0 },
        { label: "Читает простые слова из 2-3 слогов", score: 1 },
        { label: "Бегло читает предложения", score: 2 },
      ],
    },
    {
      areaId: "logic",
      text: "Складывает ли в пределах 10?",
      options: [
        { label: "Только с пальцами или предметами", score: 0 },
        { label: "На пальцах быстро", score: 1 },
        { label: "Складывает и вычитает в уме", score: 2 },
      ],
    },
    {
      areaId: "world",
      text: "Знает ли названия 5+ стран или планет?",
      options: [
        { label: "Только Россию", score: 0 },
        { label: "Россию и 2-3 страны/планеты", score: 1 },
        { label: "Знает много стран, планет, материков", score: 2 },
      ],
    },
    {
      areaId: "motor",
      text: "Как обстоят дела со штриховкой и прописями?",
      options: [
        { label: "Карандаш плохо слушается", score: 0 },
        { label: "Штрихует, обводит крупные линии", score: 1 },
        { label: "Уверенно пишет буквы и цифры", score: 2 },
      ],
    },
    {
      areaId: "creative",
      text: "Сколько времени может усидеть за одним занятием?",
      options: [
        { label: "Меньше 5 минут", score: 0 },
        { label: "10 минут", score: 1 },
        { label: "20+ минут, увлекается", score: 2 },
      ],
    },
    {
      areaId: "social",
      text: "Готов ли спокойно слушать инструкцию и следовать ей?",
      options: [
        { label: "Часто отвлекается, не дослушивает", score: 0 },
        { label: "Слушает, но нужно повторять", score: 1 },
        { label: "Слушает с первого раза и делает", score: 2 },
      ],
    },
  ],
};

export interface AreaResult {
  areaId: string;
  areaLabel: string;
  areaEmoji: string;
  areaColor: string;
  score: number; // 0-2
  level: ScoreLevel;
  comment: string;
  priority: number; // 0 — высокий, 1 — средний, 2 — низкий (для сортировки)
}

export interface DiagnosticResult {
  age: AgeStage;
  total: number; // сумма очков 0-12
  totalMax: number;
  areas: AreaResult[];
  generalComment: string;
  recommendedActivities: Activity[];
}

function levelFromScore(score: number): { level: ScoreLevel; comment: string; priority: number } {
  if (score <= 0) return { level: "behind", comment: "Здесь стоит уделить особое внимание — есть пространство для роста.", priority: 0 };
  if (score === 1) return { level: "normal", comment: "Соответствует возрастной норме. Продолжаем в том же темпе.", priority: 1 };
  return { level: "ahead", comment: "Ребёнок опережает сверстников. Можно давать более сложные задания.", priority: 2 };
}

function generalCommentByTotal(total: number, max: number): string {
  const pct = (total / max) * 100;
  if (pct >= 80) return "Отличный результат! Ребёнок развивается выше возрастной нормы. Главное — поддерживать интерес и не перегружать.";
  if (pct >= 50) return "Хороший возрастной баланс. Есть точки роста, но в целом развитие идёт гармонично.";
  if (pct >= 25) return "Есть несколько направлений, где стоит подтянуть. Не переживайте — мы подобрали занятия именно под них.";
  return "Сейчас важно много заниматься в спокойном ритме. Каждый ребёнок развивается в своём темпе — мы поможем по шагам.";
}

/**
 * answers: ageSlug + { areaId: scoreValue }
 * Возвращает разбор по направлениям и подборку занятий с приоритетом отстающих.
 */
export function calculateResult(ageSlug: AgeSlug, answers: Record<string, number>): DiagnosticResult {
  const age = AGES.find((a) => a.slug === ageSlug)!;
  const questions = DIAGNOSTIC_QUESTIONS[ageSlug];

  const areas: AreaResult[] = questions.map((q) => {
    const areaMeta = AREAS.find((a) => a.id === q.areaId)!;
    const score = answers[q.areaId] ?? 0;
    const { level, comment, priority } = levelFromScore(score);
    return {
      areaId: q.areaId,
      areaLabel: areaMeta.label,
      areaEmoji: areaMeta.emoji,
      areaColor: areaMeta.color,
      score,
      level,
      comment,
      priority,
    };
  });

  const total = areas.reduce((s, a) => s + a.score, 0);
  const totalMax = questions.length * 2;

  // Подборка занятий: сначала по отстающим направлениям, потом средние
  const sortedAreas = [...areas].sort((a, b) => a.priority - b.priority);
  const recommendedActivities: Activity[] = [];
  for (const area of sortedAreas) {
    const inArea = ACTIVITIES.filter((a) => a.ageSlug === ageSlug && a.areaId === area.areaId);
    recommendedActivities.push(...inArea);
    if (recommendedActivities.length >= 6) break;
  }
  // Если меньше 4 — добавим из остальных направлений возраста
  if (recommendedActivities.length < 4) {
    const ids = new Set(recommendedActivities.map((a) => a.id));
    const fill = ACTIVITIES.filter((a) => a.ageSlug === ageSlug && !ids.has(a.id));
    recommendedActivities.push(...fill.slice(0, 4 - recommendedActivities.length));
  }

  return {
    age,
    total,
    totalMax,
    areas,
    generalComment: generalCommentByTotal(total, totalMax),
    recommendedActivities: recommendedActivities.slice(0, 8),
  };
}
