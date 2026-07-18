import { useState } from "react";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const GRANT_AI_URL = "https://grant-ai.ru";

/**
 * Плавный переход на отдельный сервис grant-ai.ru.
 * При клике показываем короткую заставку и мягко уводим пользователя на новый сайт,
 * чтобы переход не был резким.
 */
export default function GrantAiBanner() {
  const [leaving, setLeaving] = useState(false);

  const goToGrantAi = () => {
    if (leaving) return;
    setLeaving(true);
    trackGoal("grant_ai_redirect");
    // Небольшая пауза для плавной анимации перед переходом
    window.setTimeout(() => {
      window.location.href = GRANT_AI_URL;
    }, 900);
  };

  return (
    <>
      <section className="mb-8 animate-fade-in">
        <button
          onClick={goToGrantAi}
          className="group w-full text-left relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/12 via-background to-cyan-500/10 p-5 md:p-6 transition-all duration-300 hover:border-violet-400/60 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:scale-[1.005]"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-violet-500/20 blur-3xl transition-opacity duration-300 group-hover:opacity-80 opacity-40" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-2xl shadow-lg">
              🚀
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-0.5 mb-1.5">
                <Icon name="Sparkles" size={11} className="text-cyan-300" />
                <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider">Новый проект</span>
              </div>
              <h3 className="font-montserrat font-black text-lg md:text-xl leading-tight">
                Больше возможностей на{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">grant-ai.ru</span>
              </h3>
              <p className="text-white/60 text-sm mt-1">
                Мы запустили отдельный сервис для работы с грантами — с расширенными инструментами и базой конкурсов.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0 text-violet-200 font-bold text-sm">
              Перейти
              <Icon
                name="ArrowRight"
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </div>
          </div>
        </button>
      </section>

      {/* Плавная заставка перехода */}
      {leaving && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl mb-5 animate-pulse">
            🚀
          </div>
          <p className="font-montserrat font-black text-xl mb-1">Переходим на grant-ai.ru</p>
          <p className="text-white/55 text-sm">Секундочку, открываем новый сервис…</p>
        </div>
      )}
    </>
  );
}
