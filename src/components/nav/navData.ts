export interface MenuLink {
  label: string;
  icon: string;
  path?: string;
  section?: string;
  desc?: string;
}

export interface MenuGroup {
  label: string;
  /** Короткая подпись для узких экранов, где полная не помещается */
  short: string;
  icon: string;
  items: MenuLink[];
}

export const NAV_LINKS = [
  { label: "Репетитор", short: "Репет", icon: "GraduationCap", path: "/tutor" },
  { label: "Курсы", short: "Курсы", icon: "Library", path: "/courses" },
  { label: "Лента", short: "Лента", icon: "Newspaper", path: "/feed" },
];

export const MENU_GROUPS: MenuGroup[] = [
  {
    label: "Детям и школьникам",
    short: "Детям",
    icon: "GraduationCap",
    items: [
      { label: "Малыш 1+", icon: "Baby", path: "/kids", desc: "Развитие малышей от 1 года" },
      { label: "Рисовашка", icon: "Palette", path: "/draw", desc: "Рисование для детей" },
      { label: "Для глухих детей", icon: "Hand", path: "/silent", desc: "Обучение без звука · бесплатно" },
      { label: "Репетитор по подписке", icon: "Infinity", path: "/pricing", desc: "Все предметы без лимита · 1490 ₽/мес" },
      { label: "ИИ-учитель", icon: "Bot", section: "ai-teacher", desc: "Персональный ИИ-репетитор 24/7" },
      { label: "ОГЭ и ЕГЭ", icon: "BookMarked", path: "/exam-bank", desc: "Банк заданий и подготовка к экзаменам" },
      { label: "Домашка", icon: "Camera", path: "/homework", desc: "Проверка домашних заданий по фото" },
      { label: "Олимпиада", icon: "Trophy", path: "/olympiad", desc: "Подготовка к олимпиадам" },
      { label: "Выпускник", icon: "Award", path: "/graduate", desc: "Помощь одиннадцатиклассникам" },
      { label: "МГУ-трек", icon: "Crown", path: "/mgu-track", desc: "Поступление в МГУ" },
      { label: "Заказ курса", icon: "Sparkles", path: "/order", desc: "Нет нужного курса? Соберём под вас" },
    ],
  },
  {
    label: "Взрослым: карьера и ИИ",
    short: "Взрослым",
    icon: "Rocket",
    items: [
      { label: "БИЗНЕС 2026", icon: "Gauge", path: "/bizlab", desc: "Проверка бизнес-идеи на прочность · бесплатно" },
      { label: "Профориентация PRO", icon: "Fingerprint", path: "/career-pro", desc: "Индивидуальный курс под вас · ИИ" },
      { label: "Инструменты руководителя", icon: "Wrench", path: "/instrumenty-rukovoditelya", desc: "4 бесплатных курса с шаблонами" },
      { label: "Бизнес-тренер и коуч", icon: "TrendingUp", path: "/business-coach", desc: "Стратегия роста бизнеса · ИИ" },
      { label: "Финансовый консультант", icon: "ChartNoAxesCombined", path: "/fin-advisor", desc: "Честный ИИ-анализ по вашим цифрам" },
      { label: "Оркестратор", icon: "Music4", path: "/orchestrator", desc: "Онбординг и контроль удалённых команд · ИИ" },
      { label: "Бизнес и MBA", icon: "Briefcase", path: "/courses/business", desc: "Запуск продукта и онлайн-школы" },
      { label: "Продажи B2B", icon: "Handshake", path: "/courses/sales", desc: "Обучение отделов продаж" },
      { label: "Промпт-инженер", icon: "Sparkles", path: "/courses/prompteng", desc: "Профессия будущего с нуля" },
      { label: "Удалённые профессии", icon: "Laptop", path: "/remote-professions", desc: "Работа из дома" },
      { label: "Тренды IT", icon: "Cpu", path: "/tech-trends", desc: "ИИ-аналитика IT-направлений" },
      { label: "Автоматизация", icon: "Workflow", path: "/intensive", desc: "Интенсив по автоматизации" },
    ],
  },
  {
    label: "Психология",
    short: "Психология",
    icon: "HeartHandshake",
    items: [
      { label: "Психологу", icon: "HeartHandshake", path: "/psychology", desc: "Поддержка и помощь онлайн" },
      { label: "Познай себя", icon: "Compass", path: "/know-yourself", desc: "Тесты и профориентация · бесплатно" },
      { label: "Профессия психолога", icon: "Brain", path: "/klinicheskiy-psiholog", desc: "Клиническая психология" },
      { label: "Курс НЛП-практик", icon: "Sparkles", path: "/nlp-master", desc: "НЛП с нуля до практики" },
    ],
  },
  {
    label: "Бизнесу и школам",
    short: "Бизнесу",
    icon: "Building2",
    items: [
      { label: "Для бизнеса", icon: "Building2", path: "/for-business", desc: "Конструктор онлайн-школ" },
      { label: "Корпоративное обучение", icon: "Users", path: "/corporate", desc: "Обучение сотрудников линейке" },
      { label: "Партнёрам", icon: "Handshake", path: "/partners", desc: "Сотрудничество для школ" },
      { label: "Гранты", icon: "Landmark", path: "/grants", desc: "Поиск и оформление грантов" },
    ],
  },
];

export const PARTNERS_LINK = { label: "Партнёрам", icon: "Handshake", path: "/partners" };