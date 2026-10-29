import { FeedArticle as FeedArticleType } from "@/components/feed/types";

export interface MatCta {
  title: string;
  text: string;
  href: string;
  icon: string;
  button: string;
}

export interface FeedCtaFlags {
  isForecast: boolean;
  isSchoolBuilder: boolean;
  isGrantAi: boolean;
  isTurnkey: boolean;
  isRadar: boolean;
  isMatAnalytics: boolean;
  isMatDatabases: boolean;
  isMatBi: boolean;
  isMatPipes: boolean;
  matCta: MatCta;
  isWriting: boolean;
  isGrantAiTeam: boolean;
  isGrantAiHiring: boolean;
  hasSpecial: boolean;
}

/** Определяет, какие призывы показывать под статьёй — по тегам и адресу статьи. */
export function getFeedCtaFlags(article: FeedArticleType): FeedCtaFlags {
  const tags = (article.tags || []).map((t) => t.toLowerCase());
  // Статья про прогноз/калькулятор EduFlow AI — ведём прямо на калькулятор.
  const isForecast =
    tags.some((t) => ["eduflow ai", "прогноз"].includes(t)) ||
    /eduflow|prognoz/i.test(article.slug);
  // Важно: раньше сюда попадала любая статья, где в адресе встречалось «shkol»
  // (а это почти всё про школу) — и читатель видел призыв открыть свою онлайн-школу.
  // Теперь ориентируемся на теги и на явные адреса про конструктор.
  // Теги разнородные: «онлайн-школа», «онлайн-школы», «репетиторам», «репетиторы»,
  // «инфобизнес», «бизнес на знаниях». Перечислять их списком бессмысленно —
  // половина статей про запуск школы мимо него проходила и получала общий призыв.
  // «репетиторам» в дательном — это обращение к преподавателю. Просто «репетитор»
  // стоит в статьях для родителей («как выбрать репетитора»), им предлагать
  // открыть школу незачем.
  const B2B_TAG = /(онлайн[- ]школ|конструктор (курсов|школ)|репетиторам|инфобизнес|бизнес на знаниях|edtech|доходимост|методолог)/i;
  const isSchoolBuilder =
    !isForecast &&
    (tags.some((t) => B2B_TAG.test(t)) ||
      /(konstruktor|svoya|sozdat|otkryt|zapustit)[-_]?shkol/i.test(article.slug) ||
      /(shkol[ay]?[-_]za[-_]|metodologiya-uchispro|brosayut-kursy)/i.test(article.slug));
  // Статьи про отдельный сервис grant-ai.ru — ведём на внешний сайт, а не на /grants.
  const isGrantAi =
    tags.some((t) => ["grant-ai", "grant-ai.ru"].includes(t)) ||
    /grant-ai/i.test(article.slug);
  // Статьи о найме на grant-ai.ru: общий текст про гранты там не к месту,
  // ведём сразу в оценку компетенций и HR-помощник.
  // Статьи о разделе «Готовый бизнес под ключ» на mat-labs.ru.
  const isTurnkey = tags.includes("готовый бизнес") && tags.includes("mat-labs.ru");
  // Статьи о «Радаре заказчиков» на mat-labs.ru — ведём в каталог.
  const isRadar = tags.includes("радар заказчиков") && tags.includes("mat-labs.ru");
  // Статьи о разделе «Бизнес-аналитика» на mat-labs.ru — ведём в отчёты о рынках.
  const isMatAnalytics = tags.includes("бизнес-аналитика") && tags.includes("mat-labs.ru");
  // Статьи о модуле «Базы компаний» ведём сразу в каталог баз.
  const isMatDatabases = isMatAnalytics && tags.includes("базы компаний");
  const isMatBi = isMatAnalytics && tags.includes("облачный BI");
  const isMatPipes = isMatAnalytics && !isMatBi && tags.includes("конвейер данных");
  const matCta = isMatPipes
    ? {
        title: "Подключите 1С и CRM бесплатно",
        text: "Данные загружаются сами по расписанию, очищаются от дублей и открываются в дашборде. Тариф «Старт» — 0 ₽ навсегда.",
        href: "https://mat-labs.ru/analytics/pipes",
        icon: "Workflow",
        button: "Открыть конвейер данных",
      }
    : isMatBi
    ? {
        title: "Постройте дашборд из своей таблицы",
        text: "Загрузите выгрузку продаж из Excel или CRM — графики и сравнение с рынком за минуту. Бесплатно и без регистрации.",
        href: "https://mat-labs.ru/analytics/bi",
        icon: "LayoutDashboard",
        button: "Открыть облачный BI",
      }
    : isMatDatabases
    ? {
        title: "Соберите базу компаний под свою задачу",
        text: "26 готовых баз и конструктор выборки. Анализ любой базы — бесплатно и без регистрации.",
        href: "https://mat-labs.ru/analytics/databases",
        icon: "Database",
        button: "Открыть базы компаний",
      }
    : {
        title: "Посмотрите рынок своей ниши",
        text: "Объём, лидеры, приток новичков и риски — для любой отрасли и региона. Превью бесплатно и без регистрации.",
        href: "https://mat-labs.ru/analytics",
        icon: "ChartPie",
        button: "Открыть бизнес-аналитику",
      };
  // Статьи о сочинениях — ведём в Мастерскую сочинений.
  const isWriting = tags.includes("сочинение");
  const isGrantAiTeam = isGrantAi && tags.includes("фонд оплаты труда");
  const isGrantAiHiring = isGrantAi && !isGrantAiTeam && tags.includes("оценка компетенций");
  // Специальные призывы закрывают лишь несколько узких тем.
  // Если ни один не подошёл — показываем общий, подобранный по смыслу статьи,
  // чтобы читатель не уходил с сайта без предложения.
  const specialTags = ["дети", "развитие детей", "дошкольное образование", "аудиосказки",
    "олимпиада", "прораб", "для бизнеса", "обновление"];
  const hasSpecial =
    isGrantAi || isTurnkey || isRadar || isMatAnalytics || isWriting || isForecast || isSchoolBuilder ||
    (article.tags || []).some((t) => specialTags.includes(t.toLowerCase()));

  return {
    isForecast,
    isSchoolBuilder,
    isGrantAi,
    isTurnkey,
    isRadar,
    isMatAnalytics,
    isMatDatabases,
    isMatBi,
    isMatPipes,
    matCta,
    isWriting,
    isGrantAiTeam,
    isGrantAiHiring,
    hasSpecial,
  };
}
