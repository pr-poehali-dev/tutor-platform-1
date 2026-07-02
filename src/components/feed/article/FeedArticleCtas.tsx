import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FeedArticle as FeedArticleType } from "@/components/feed/types";

interface Props {
  article: FeedArticleType;
}

export default function FeedArticleCtas({ article }: Props) {
  return (
    <>
      {/* CTA «Малыш» — для статей про детей/дошкольников */}
      {article.tags && article.tags.some((t) => ["дети", "развитие детей", "дошкольное образование", "аудиосказки"].includes(t.toLowerCase())) && (
        <div className="relative overflow-hidden rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-600/30 via-rose-500/20 to-amber-500/20 p-5 md:p-6 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">🦊</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Откройте «Малыш» прямо сейчас
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-4">
              Сказки с озвучкой, обучение чтению, умные игры и песни для детей от 2 лет. Бесплатно, без карты — первое занятие за полминуты.
            </p>
            <Link
              to="/kids"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black px-6 py-3 rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-pink-500/20"
            >
              <Icon name="Sparkles" size={18} />
              Войти в Малыша
            </Link>
          </div>
        </div>
      )}

      {/* CTA олимпиады — для статей с тегом «олимпиада» */}
      {article.tags && article.tags.some((t) => t.toLowerCase() === "олимпиада") && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-purple-700/40 to-cyan-700/30 p-5 md:p-6 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Готов проверить свои силы?
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-4">
              Пройди мини-олимпиаду без ошибок и забери главный приз — 5000 ЗНАЕК.
            </p>
            <Link
              to="/olympiad"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-6 py-3 rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/20"
            >
              <Icon name="Rocket" size={18} />
              Участвовать в олимпиаде
            </Link>
          </div>
        </div>
      )}

      {/* CTA курс прораба — для статей с тегом «прораб» */}
      {article.tags && article.tags.some((t) => t.toLowerCase() === "прораб") && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-slate-800/60 to-amber-700/30 p-5 md:p-6 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">👷</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Освойте профессию прораба
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-4">
              10 модулей и 56 уроков: СНиПы, планирование, охрана труда и заработок на ремонте. Бесплатно, с именным сертификатом.
            </p>
            <Link
              to="/course-checkout/72"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-6 py-3 rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/20"
            >
              <Icon name="HardHat" size={18} />
              Перейти к курсу
            </Link>
          </div>
        </div>
      )}

      {/* CTA конструктор школ — для статей с тегом «для бизнеса» */}
      {article.tags && article.tags.some((t) => t.toLowerCase() === "для бизнеса") && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-700/30 via-fuchsia-600/20 to-cyan-700/30 p-5 md:p-6 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Запустите свою онлайн-школу за вечер
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-4">
              ИИ соберёт курс за час и станет преподавателем для ваших учеников 24/7. Ваш бренд, ваш домен. Без абонплаты — только процент с продаж.
            </p>
            <Link
              to="/for-business"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-6 py-3 rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-violet-500/20"
            >
              <Icon name="Rocket" size={18} />
              Получить демо и цену
            </Link>
          </div>
        </div>
      )}

      {/* CTA три обновлённых курса — для статьи с тегом «обновление» */}
      {article.tags && article.tags.some((t) => t.toLowerCase() === "обновление") && (
        <div className="relative overflow-hidden rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-700/30 via-fuchsia-600/20 to-cyan-700/30 p-5 md:p-6 mb-8">
          <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5 text-center">
              Открой обновлённый курс
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-5 text-center">
              Доступ навсегда, чек по 54-ФЗ, оплата защищена через ЮKassa.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link
                to="/course-checkout/17"
                className="flex flex-col items-center gap-1.5 bg-white/8 hover:bg-white/14 border border-white/15 rounded-xl px-4 py-4 transition-colors text-center"
              >
                <span className="text-3xl">🌍</span>
                <span className="text-white font-bold text-sm leading-tight">Английский с нуля</span>
                <span className="gradient-text-purple font-black text-base">6 599 ₽</span>
              </Link>
              <Link
                to="/course-checkout/57"
                className="flex flex-col items-center gap-1.5 bg-white/8 hover:bg-white/14 border border-white/15 rounded-xl px-4 py-4 transition-colors text-center"
              >
                <span className="text-3xl">📣</span>
                <span className="text-white font-bold text-sm leading-tight">Интернет-маркетолог</span>
                <span className="gradient-text-purple font-black text-base">9 900 ₽</span>
              </Link>
              <Link
                to="/course-checkout/65"
                className="flex flex-col items-center gap-1.5 bg-white/8 hover:bg-white/14 border border-white/15 rounded-xl px-4 py-4 transition-colors text-center"
              >
                <span className="text-3xl">🤖</span>
                <span className="text-white font-bold text-sm leading-tight">Нейросети с нуля</span>
                <span className="gradient-text-purple font-black text-base">12 900 ₽</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}