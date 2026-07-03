import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FeedArticle as FeedArticleType } from "@/components/feed/types";
import { trackGoal } from "@/components/analytics/YandexMetrika";

interface Props {
  article: FeedArticleType;
}

export default function FeedArticleCtas({ article }: Props) {
  const tags = (article.tags || []).map((t) => t.toLowerCase());
  // Статья про прогноз/калькулятор EduFlow AI — ведём прямо на калькулятор.
  const isForecast =
    tags.some((t) => ["eduflow ai", "прогноз"].includes(t)) ||
    /eduflow|prognoz/i.test(article.slug);
  const isSchoolBuilder =
    !isForecast &&
    (tags.some((t) => ["онлайн-школа", "конструктор курсов", "конструктор школ"].includes(t)) ||
      /shkol/i.test(article.slug));
  const isGrants =
    tags.some((t) => ["гранты", "заявка на грант", "конкурсы"].includes(t)) ||
    /grant/i.test(article.slug);

  return (
    <>
      {/* CTA прогноз EduFlow AI — прямой переход к калькулятору прибыли школы */}
      {isForecast && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-700/40 via-fuchsia-600/20 to-cyan-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 rounded-full px-3 py-1 mb-3">
              <Icon name="Sparkles" size={12} className="text-violet-200" />
              <span className="text-violet-100 text-[11px] font-bold uppercase tracking-wider">EduFlow AI</span>
            </div>
            <h3 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
              Посчитайте прибыль своей школы за 30 секунд
            </h3>
            <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto mb-4">
              Задайте нишу, цену курса и бюджет — ИИ-прогноз покажет выручку, доходимость и чистую
              прибыль ещё до первого вложенного рубля. Бесплатно и без регистрации.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-white/60 text-xs mb-5">
              <span className="inline-flex items-center gap-1.5"><Icon name="TrendingUp" size={13} className="text-emerald-300" /> Выручка и прибыль</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="Percent" size={13} className="text-cyan-300" /> ROMI рекламы</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="Clock" size={13} className="text-fuchsia-300" /> Срок окупаемости</span>
            </div>
            <Link
              to="/for-business#forecast"
              onClick={() => trackGoal("article_forecast_cta_click", { slug: article.slug })}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-violet-500/25"
            >
              <Icon name="Calculator" size={18} />
              Открыть калькулятор прогноза
            </Link>
          </div>
        </div>
      )}

      {/* CTA помощник по грантам — прямой переход к подготовке заявки */}
      {isGrants && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-700/35 via-fuchsia-600/20 to-cyan-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Подготовьте заявку на грант с ИИ
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-4">
              Опишите грант и проект — ИИ-эксперт соберёт готовый пакет: текст, смету, календарный план и оценку шансов.
              Черновик бесплатно, полный пакет — дешевле рынка в десятки раз.
            </p>
            <Link
              to="/grants"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/20"
            >
              <Icon name="Wand2" size={18} />
              Подготовить заявку
            </Link>
          </div>
        </div>
      )}

      {/* CTA конструктор школ — прямой переход к запуску школы */}
      {isSchoolBuilder && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-700/35 via-fuchsia-600/20 to-cyan-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
              Создайте свою школу прямо сейчас
            </h3>
            <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto mb-3">
              Опишите тему — ИИ соберёт программу курса за минуту. Подключите оплаты, бренд и персонального
              ИИ-преподавателя. Первый курс можно собрать бесплатно, без карты.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-white/60 text-xs mb-5">
              <span className="inline-flex items-center gap-1.5"><Icon name="Sparkles" size={13} className="text-violet-300" /> Курс за минуту</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="Wallet" size={13} className="text-cyan-300" /> Приём оплат</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="GraduationCap" size={13} className="text-fuchsia-300" /> ИИ-наставник 24/7</span>
            </div>
            <Link
              to="/school-builder"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-violet-500/25"
            >
              <Icon name="Rocket" size={18} />
              Создать свою школу
            </Link>
            <div className="mt-3">
              <Link to="/for-business" className="text-white/45 hover:text-white/70 text-xs underline underline-offset-2 transition-colors">
                Узнать о возможностях для бизнеса
              </Link>
            </div>
          </div>
        </div>
      )}

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