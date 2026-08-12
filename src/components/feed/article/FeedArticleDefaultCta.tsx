import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FeedArticle } from "@/components/feed/types";
import { trackGoal } from "@/components/analytics/YandexMetrika";

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

  if (has("нейросет", "искусственный интеллект", "чат-бот", "промпт", "gpt")) {
    return {
      emoji: "🤖",
      title: "Хотите не читать про нейросети, а зарабатывать на них?",
      text: "Бесплатный мини-курс: первые 5 000 ₽ на нейросетях за один вечер. Без карты и регистрации — открывается сразу.",
      button: "Открыть бесплатный курс",
      to: "/mini-course",
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
      text: "26 бесплатных мини-курсов за один вечер: от запуска бизнеса до разговора о повышении зарплаты. Без карты и регистрации.",
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
    title: "26 бесплатных мини-курсов на один вечер",
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
