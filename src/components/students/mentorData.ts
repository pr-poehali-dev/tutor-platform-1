import func2url from "../../../backend/func2url.json";

export const MENTOR_URL = (func2url as Record<string, string>)["student-mentor"];

export type MentorMode = "topic" | "plan" | "review" | "gost" | "defense";

export interface ModeConfig {
  id: MentorMode;
  label: string;
  icon: string;
  hint: string;
  textLabel: string;
  placeholder: string;
  minText: number;
  example: Partial<MentorForm>;
}

export interface MentorForm {
  workType: string;
  field: string;
  subject: string;
  topic: string;
  deadline: string;
  text: string;
}

export const WORK_TYPES = ["Курсовая", "ВКР / диплом", "Реферат", "Эссе", "Отчёт по практике", "Экзамен / зачёт"];

export const MODES: ModeConfig[] = [
  {
    id: "topic",
    label: "Выбор темы",
    icon: "Lightbulb",
    hint: "5 тем с объектом, предметом, источниками данных и рисками — от простой к сильной",
    textLabel: "Что вам интересно или что уже предложил преподаватель",
    placeholder: "Например: интересует маркетинг в соцсетях и малый бизнес, преподаватель сказал, что тема должна быть с практической частью",
    minText: 10,
    example: { workType: "Курсовая", field: "Экономика", subject: "Маркетинг", text: "Интересует продвижение малого бизнеса в соцсетях, нужна практическая часть на примере реальной компании" },
  },
  {
    id: "plan",
    label: "План работы",
    icon: "ListTree",
    hint: "Цель, задачи, объект и предмет, главы с параграфами, объёмы и график по неделям",
    textLabel: "Пожелания к плану",
    placeholder: "Например: две главы, практика на примере кофейни, методичка требует 30–35 страниц",
    minText: 0,
    example: { workType: "Курсовая", field: "Экономика", subject: "Маркетинг", topic: "Продвижение малого бизнеса в социальных сетях", deadline: "через 6 недель", text: "Практическая часть на примере кофейни, объём 30–35 страниц" },
  },
  {
    id: "review",
    label: "Проверка черновика",
    icon: "FileSearch",
    hint: "Замечания как у строгого научрука: логика, доказательность, стиль и вопросы преподавателя",
    textLabel: "Фрагмент черновика (до 12 000 символов)",
    placeholder: "Вставьте введение, параграф или главу — научрук разберёт текст и подскажет, что исправить",
    minText: 300,
    example: {},
  },
  {
    id: "gost",
    label: "Оформление по ГОСТу",
    icon: "BookMarked",
    hint: "Список литературы по ГОСТ Р 7.0.100-2018 и чек-лист оформления текста",
    textLabel: "Список литературы или вопрос по оформлению",
    placeholder: "Вставьте источники как есть — по одному на строке. Или спросите: «Как оформить таблицы и рисунки?»",
    minText: 10,
    example: { text: "Котлер Ф. Маркетинг менеджмент 2019 Питер\nстатья про SMM для малого бизнеса с сайта rbc.ru, 2024" },
  },
  {
    id: "defense",
    label: "Защита и сессия",
    icon: "Presentation",
    hint: "Речь по таймингу, план слайдов, вопросы комиссии — или план подготовки к экзамену",
    textLabel: "Что готовим",
    placeholder: "Например: защита курсовой через неделю, 7 минут на выступление. Или: экзамен по микроэкономике через 5 дней",
    minText: 10,
    example: { workType: "Курсовая", topic: "Продвижение малого бизнеса в социальных сетях", text: "Защита через неделю, на выступление 7 минут, нужна презентация" },
  },
];

export const EMPTY_FORM: MentorForm = { workType: "Курсовая", field: "", subject: "", topic: "", deadline: "", text: "" };

export async function askMentor(mode: MentorMode, f: MentorForm): Promise<{ answer?: string; error?: string }> {
  try {
    const r = await fetch(`${MENTOR_URL}?action=ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        work_type: f.workType,
        field: f.field,
        subject: f.subject,
        topic: f.topic,
        deadline: f.deadline,
        text: f.text,
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.status === 504) return { error: "Научрук думал слишком долго. Попробуйте ещё раз — обычно со второй попытки получается." };
    if (!r.ok) return { error: d.error || "Не получилось получить ответ. Попробуйте ещё раз." };
    return { answer: d.answer };
  } catch {
    return { error: "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз." };
  }
}
