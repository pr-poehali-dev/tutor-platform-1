import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FeedArticle } from "@/components/feed/types";
import { trackGoal } from "@/components/analytics/YandexMetrika";
// Число мини-курсов берём из реестра, а не пишем руками: в трёх местах сайта
// стояли разные цифры (26, 30), пока курсов на самом деле был 31.
import { MINI_COURSES } from "@/components/minicourse/registry";

/**
 * Призыв по умолчанию под каждой статьёй ленты.
 *
 * Зачем: до этого призыв показывался только у 23 статей из 295 — с редкими
 * тегами вроде «прораб» или «олимпиада». Остальные 272 статьи человек дочитывал
 * и уходил с сайта, потому что ему не предлагали ничего дальше.
 *
 * Что делает: по теме статьи подбирает подходящий раздел платформы.
 * Читал про нейросети — зовём на курсы по ИИ, читал про ЕГЭ — на подготовку,
 * про гранты — в раздел грантов. Если тема не опознана, ведём на бесплатные
 * мини-курсы: это самый мягкий вход, ничего не нужно платить.
 */

interface Offer {
  emoji: string;
  title: string;
  text: string;
  button: string;
  to: string;
  goal: string;
}

/** Подбираем раздел платформы по словам в заголовке, тексте и тегах. */
function pickOffer(article: FeedArticle): Offer {
  const hay = [
    article.title || "",
    article.summary || "",
    (article.tags || []).join(" "),
    article.category || "",
  ]
    .join(" ")
    .toLowerCase();

  const has = (...words: string[]) => words.some((w) => hay.includes(w));

  // B2B идёт первым намеренно. Раньше любая статья со словом «школа» попадала
  // в ветку ниже и звала читателя на /courses — то есть владельцу школы и
  // репетитору предлагали купить курс для школьника. Из-за этого на
  // /for-business не пришло ни одного перехода из ленты.
  // «выбрать репетитора», «найти репетитора» — это запрос родителя, а не
  // преподавателя. Такие статьи должны уходить в ветку про ИИ-репетитора ниже.
  const isParentSearch = has("выбрать репетитора", "найти репетитора", "как выбрать курс");

  if (
    !isParentSearch &&
    has(
      "онлайн-школ",
      "онлайн школ",
      "репетиторам",
      "репетиторства",
      "методист",
      "инфобизнес",
      "свой курс",
      "свои курсы",
      "продажа курсов",
      "запуск курса",
      "конструктор курсов",
      "доходимость",
      "edtech",
      "getcourse",
      "геткурс",
      "бизнес на знаниях",
      "экспертн",
    )
  ) {
    return {
      emoji: "🏫",
      title: "У вас есть знания и ученики — не хватает только упаковки?",
      text: "ИИ соберёт программу курса с уроками, заданиями и тестами за минуту. Дальше — приём оплат, свой бренд и домен. Без абонплаты: 8% с продаж, платите только когда зарабатываете.",
      button: "Собрать курс бесплатно",
      to: "/repetitoram",
      goal: "article_cta_b2b",
    };
  }

  // Кадры и трудовое право: проверяем до «бизнеса», иначе уйдёт в общую ветку.
  if (has("кадров", "трудовой договор", "трудовая книжка", "гит", "трудовая инспекция", "воинский учёт", "увольнен", "штатное расписание")) {
    return {
      emoji: "📋",
      title: "Проверьте свои кадровые документы за вечер",
      text: "Бесплатный курс из 5 уроков: чек-лист самопроверки, три ошибки, которые находят первыми, и план что чинить. Без карты и регистрации.",
      button: "Открыть бесплатный курс",
      to: "/kadrovye-dokumenty-proverka",
      goal: "article_cta_hr",
    };
  }

  // Реклама и маркетинг — отдельная ветка, иначе такие статьи попадали в общую
  // «бизнес» ниже и вели в каталог мини-курсов, а не к профильному материалу.
  if (has("реклама", "рекламн", "маркетинг", "трафик", "воронка продаж", "окупаемость рекламы", "cpa", "лиды")) {
    return {
      emoji: "📊",
      title: "Посчитайте свою рекламу за вечер",
      text: "Бесплатный курс из 5 уроков: воронка, метрики и практический расчёт по вашей задаче. На выходе — вердикт, окупается реклама или сливает бюджет. Без карты.",
      button: "Открыть бесплатный курс",
      to: "/internet-marketing-s-nulya",
      goal: "article_cta_marketing",
    };
  }

  if (has("нейросет", "искусственный интеллект", "чат-бот", "промпт", "gpt")) {
    return {
      emoji: "🤖",
      title: "Хотите не читать про нейросети, а зарабатывать на них?",
      text: "Бесплатный курс на один вечер: соберёте первую услугу на нейросетях, которую уже можно продавать. Без карты и регистрации.",
      button: "Открыть бесплатный курс",
      to: "/zarabotok-na-neirosetyah",
      goal: "article_cta_ai",
    };
  }

  if (has("егэ", "огэ", "экзамен", "выпускник", "11 класс", "9 класс")) {
    return {
      emoji: "🎯",
      title: "Готовитесь к экзамену?",
      text: "ИИ-репетитор находит ваши пробелы за 5 минут диагностики и ведёт по личному плану до результата. Первый урок бесплатно.",
      button: "Пройти диагностику бесплатно",
      to: "/exam-bank",
      goal: "article_cta_exam",
    };
  }

  if (has("грант", "стипенди", "конкурс", "олимпиад", "субсиди")) {
    return {
      emoji: "🏆",
      title: "Хотите получить грант или стипендию?",
      text: "Собрали действующие конкурсы и гранты для школьников и студентов в одном разделе — с условиями и сроками подачи.",
      button: "Смотреть гранты",
      to: "/grants",
      goal: "article_cta_grants",
    };
  }

  if (has("ребён", "дошкольник", "малыш", "детск", "родител")) {
    return {
      emoji: "🧸",
      title: "Развивающие занятия для детей 1–6 лет",
      text: "Сказки, песни, игры и обучение чтению — с контролем экранного времени. Первые 3 месяца за 1 ₽.",
      button: "Посмотреть занятия",
      to: "/kids",
      goal: "article_cta_kids",
    };
  }

  if (has("бизнес", "предпринимат", "заработ", "профессия", "карьер", "работ", "зарплат")) {
    return {
      emoji: "💼",
      title: "Хотите применить это на практике?",
      text: `${MINI_COURSES.length} бесплатных мини-курсов за один вечер: от запуска бизнеса до разговора о повышении зарплаты. Без карты и регистрации.`,
      button: "Выбрать мини-курс",
      to: "/mini-course",
      goal: "article_cta_business",
    };
  }

  if (has("школ", "урок", "учител", "класс", "учеб", "матем", "физик", "хими", "биолог")) {
    return {
      emoji: "📚",
      title: "Персональный ИИ-репетитор по всем школьным предметам",
      text: "Объяснит любую тему простыми словами, проверит домашку по фото и подберёт задания под ваш уровень. Первый урок бесплатно.",
      button: "Попробовать бесплатно",
      to: "/courses",
      goal: "article_cta_school",
    };
  }

  return {
    emoji: "🎁",
    title: `${MINI_COURSES.length} бесплатных мини-курсов на один вечер`,
    text: "Короткие курсы с готовыми шаблонами: деньги, учёба, здоровье, быт. Открываются сразу — без карты и ограничений по времени.",
    button: "Выбрать курс бесплатно",
    to: "/mini-course",
    goal: "article_cta_default",
  };
}

export default function FeedArticleDefaultCta({ article }: { article: FeedArticle }) {
  const offer = pickOffer(article);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-purple-600/10 to-cyan-600/15 p-6 md:p-8 mb-8 text-center">
      <div
        className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="text-4xl mb-2">{offer.emoji}</div>
        <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
          {offer.title}
        </h3>
        <p className="text-white/75 text-sm md:text-base max-w-lg mx-auto mb-5 leading-relaxed">
          {offer.text}
        </p>
        <Link
          to={offer.to}
          onClick={() => trackGoal(offer.goal, { slug: article.slug })}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-primary/25"
        >
          {offer.button}
          <Icon name="ArrowRight" size={18} />
        </Link>
      </div>
    </div>
  );
}