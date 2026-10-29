import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import { FeedArticle as FeedArticleType } from "@/components/feed/types";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { MatCta } from "./feedCtaFlags";

interface Props {
  article: FeedArticleType;
  isWriting: boolean;
  isMatAnalytics: boolean;
  isMatPipes: boolean;
  isMatBi: boolean;
  isMatDatabases: boolean;
  matCta: MatCta;
  isRadar: boolean;
  isTurnkey: boolean;
}

/** Призывы: Мастерская сочинений и сервисы mat-labs.ru (аналитика, Радар, готовый бизнес). */
export default function FeedArticleServiceCtas({ article, isWriting, isMatAnalytics, isMatPipes, isMatBi, isMatDatabases, matCta, isRadar, isTurnkey }: Props) {
  return (
    <>
      {/* CTA: Мастерская сочинений для статей о сочинениях */}
      {isWriting && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-600/30 via-rose-600/15 to-violet-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-amber-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">✍️</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Пишите сочинения на высокий балл
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-5">
              Итоговое сочинение, ЕГЭ и журналистские жанры — с наставником, который разбирает ваши тексты.
            </p>
            <Link
              to="/writing-craft"
              onClick={() => trackGoal("article_writing_click", { slug: article.slug })}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-amber-500/25"
            >
              <Icon name="PenLine" size={18} />
              Записаться в Мастерскую сочинений
            </Link>
          </div>
        </div>
      )}

      {/* CTA mat-labs.ru: бизнес-аналитика */}
      {isMatAnalytics && (
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-700/30 via-indigo-600/20 to-violet-700/35 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-cyan-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
              <Icon name={matCta.icon} fallback="BarChart3" size={28} className="text-cyan-200" />
            </div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              {matCta.title}
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-5">
              {matCta.text}
            </p>
            <a
              href={matCta.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGoal(isMatPipes ? "article_mat_pipes_click" : isMatBi ? "article_mat_bi_click" : isMatDatabases ? "article_mat_databases_click" : "article_mat_analytics_click", { slug: article.slug })}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-cyan-500/25"
            >
              <Icon name="BarChart3" size={18} />
              {matCta.button}
            </a>
          </div>
        </div>
      )}

      {/* CTA mat-labs.ru: Радар заказчиков */}
      {isRadar && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-700/35 via-indigo-600/20 to-cyan-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-violet-500/20 flex items-center justify-center">
              <Icon name="Radar" size={28} className="text-violet-200" />
            </div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Найдите заказчиков с бюджетом
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-5">
              18 тысяч компаний, получивших господдержку в 2024–2026 годах. Каталог бесплатный,
              контакты — пробный доступ на 3 дня без карты.
            </p>
            <a
              href="https://mat-labs.ru/radar"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGoal("article_radar_click", { slug: article.slug })}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-violet-500/25"
            >
              <Icon name="Search" size={18} />
              Открыть Радар заказчиков
            </a>
          </div>
        </div>
      )}

      {/* CTA mat-labs.ru: готовый IT-бизнес под своим брендом */}
      {isTurnkey && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-700/35 via-teal-600/20 to-violet-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-emerald-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Проверьте, свободен ли ваш город
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-5">
              Бесплатный разбор за 30 минут: обсудим нишу, город и ваш опыт. Каждый проект можно
              посмотреть вживую до оплаты.
            </p>
            <a
              href="https://mat-labs.ru/gotovyy-biznes"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGoal("article_turnkey_click", { slug: article.slug })}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-emerald-500/25"
            >
              <Icon name="Rocket" size={18} />
              Выбрать проект
            </a>
          </div>
        </div>
      )}
    </>
  );
}
