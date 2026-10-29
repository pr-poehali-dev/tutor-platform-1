import Icon from "@/components/ui/icon";
import { FeedArticle as FeedArticleType } from "@/components/feed/types";
import { trackGoal } from "@/components/analytics/YandexMetrika";

interface Props {
  article: FeedArticleType;
  isGrantAi: boolean;
  isGrantAiTeam: boolean;
  isGrantAiHiring: boolean;
}

/** Призывы сервиса grant-ai.ru: расчёт команды, найм и общий переход на сервис грантов. */
export default function FeedArticleGrantCtas({ article, isGrantAi, isGrantAiTeam, isGrantAiHiring }: Props) {
  return (
    <>
      {/* CTA grant-ai.ru для статей о расчёте команды */}
      {isGrantAiTeam && (
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-violet-700/35 via-fuchsia-600/20 to-cyan-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Рассчитайте команду за две минуты
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-5">
              Фонд оплаты труда по зарплатам вашего региона, со страховыми взносами, и гранты,
              которые помогут его покрыть. Без регистрации и бесплатно.
            </p>
            <a
              href="https://grant-ai.ru/team"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGoal("article_grant_ai_team_click", { slug: article.slug })}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-violet-500/25"
            >
              <Icon name="Calculator" size={18} />
              Рассчитать команду
            </a>
          </div>
        </div>
      )}

      {/* CTA grant-ai.ru для статей о найме: оценка компетенций и HR-помощник */}
      {isGrantAiHiring && (
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-violet-700/35 via-fuchsia-600/20 to-cyan-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Проверьте квалификацию за 15 минут
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-5">
              Независимая оценка для врачей, инженеров и сварщиков с сертификатом, который работодатель
              проверяет по коду. HR-помощник для специалистов и работодателей. Бесплатно.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://grant-ai.ru/skills"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGoal("article_grant_ai_skills_click", { slug: article.slug })}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-6 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-violet-500/25"
              >
                <Icon name="BadgeCheck" size={18} />
                Пройти оценку
              </a>
              <a
                href="https://grant-ai.ru/hr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGoal("article_grant_ai_hr_click", { slug: article.slug })}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-6 py-3.5 rounded-xl transition-colors"
              >
                <Icon name="Briefcase" size={18} />
                HR-помощник
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CTA grant-ai.ru — переход на отдельный сервис по грантам */}
      {isGrantAi && !isGrantAiHiring && !isGrantAiTeam && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-700/35 via-fuchsia-600/20 to-cyan-700/30 p-6 md:p-8 mb-8 text-center">
          <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
              Попробуйте новые возможности на grant-ai.ru
            </h3>
            <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-4">
              Сопровождение выполнения условий, помощь с отчётностью и библиотека идей с готовыми промптами для победы.
              Черновик заявки и оценка шансов — бесплатно.
            </p>
            <a
              href="https://grant-ai.ru"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGoal("article_grant_ai_cta_click", { slug: article.slug })}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-lg shadow-violet-500/25"
            >
              <Icon name="ExternalLink" size={18} />
              Перейти на grant-ai.ru
            </a>
          </div>
        </div>
      )}
    </>
  );
}
