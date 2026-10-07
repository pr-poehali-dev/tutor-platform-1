import type { LearnerDirection } from "@/lib/directions";

export interface MenuLink {
  label: string;
  icon: string;
  path?: string;
  section?: string;
  desc?: string;
}

/**
 * Меню каждого направления — не больше 5 пунктов.
 * Родитель малыша не видит «НЛП» и «Бизнес 2026», взрослый — «Домашку».
 */
export const DIRECTION_MENU: Record<LearnerDirection, MenuLink[]> = {
  kids: [
    { label: "Занятия по возрасту", icon: "Baby", path: "/kids", desc: "Развитие от 1 до 6 лет" },
    { label: "Песни", icon: "Music", path: "/kids/songs", desc: "Развивающие песенки" },
    { label: "Сказки", icon: "BookOpen", path: "/kids/library", desc: "Аудиосказки и книжки" },
    { label: "Подготовка к школе", icon: "Pencil", path: "/kids/reading", desc: "Чтение, счёт, логика" },
    { label: "Рисовашка", icon: "Palette", path: "/draw", desc: "Учимся рисовать" },
  ],
  school: [
    { label: "ИИ-репетитор", icon: "GraduationCap", path: "/tutor", desc: "Все предметы, 24/7" },
    { label: "Домашка", icon: "Camera", path: "/homework", desc: "Разбор по фото" },
    { label: "ОГЭ и ЕГЭ", icon: "BookMarked", path: "/exam-bank", desc: "Банк заданий и калькулятор" },
    { label: "Поступление", icon: "Award", path: "/graduate", desc: "Подбор вуза и МГУ-трек" },
    { label: "Лента", icon: "Newspaper", path: "/feed?d=school", desc: "«Хочу всё знать»" },
  ],
  adult: [
    { label: "Все программы", icon: "Library", path: "/kursy-dlya-vzroslyh", desc: "40+ курсов: ИИ, IT, бизнес" },
    { label: "Нейросети", icon: "Sparkles", path: "/ai-assistant", desc: "ИИ для работы за 5 дней" },
    { label: "Удалёнка", icon: "Laptop", path: "/remote-professions", desc: "Профессии для работы из дома" },
    { label: "Руководителю", icon: "Briefcase", path: "/for-managers", desc: "Разборы и шаблоны" },
    { label: "Своё дело", icon: "Rocket", path: "/business-2026", desc: "Где и что открывать" },
  ],
};

/** Блок «Партнёрам и бизнесу» — не направление обучения, живёт отдельно. */
export const BUSINESS_LINKS: MenuLink[] = [
  { label: "Своя онлайн-школа", icon: "Building2", path: "/for-business", desc: "Платформа под вашим брендом" },
  { label: "Корпоративное обучение", icon: "Users", path: "/corporate", desc: "Обучение сотрудников" },
  { label: "Репетиторам", icon: "Wand2", path: "/repetitoram", desc: "Свой курс за минуту" },
  { label: "Школам и центрам", icon: "School", path: "/for-schools", desc: "Сотрудничество" },
  { label: "Партнёрская программа", icon: "Handshake", path: "/partners", desc: "Доход с оплат" },
  { label: "Гранты", icon: "Landmark", path: "/grants", desc: "Заявка на грант с ИИ" },
  { label: "Партнёрство с Точка Банк", icon: "BadgeCheck", path: "/feed/partnyorskie-programmy-s-bankom-tochka", desc: "Наш партнёр" },
];
