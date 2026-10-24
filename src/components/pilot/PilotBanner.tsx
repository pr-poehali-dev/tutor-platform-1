import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const MAX_BOT_PILOT = "https://max.ru/id631205241205_bot?start=pilot_site";

/**
 * Переход на пилот для школ: учителю и директору — подключить школу,
 * ученику — найти ссылку своей школы или промокод города.
 * place — где стоит баннер (для меток в Метрике и в заявках).
 */
export default function PilotBanner({ place, compact = false }: { place: string; compact?: boolean }) {
  const join = `/podklyuchit-shkolu?src=banner_${place}`;
  const goal = (target: string) => () => trackGoal("pilot_banner_click", { place, target });

  if (compact) {
    return (
      <Link
        to={join}
        onClick={goal("join")}
        className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 transition-colors hover:bg-emerald-500/15"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
          <Icon name="School" size={20} className="text-emerald-300" />
        </span>
        <span className="flex-1 text-sm text-white/85">
          <b className="text-white">Учитель или директор?</b> Подключите школу к бесплатному пилоту — ИИ-наставник для всех учеников до 31.05.2027.
        </span>
        <Icon name="ArrowRight" size={18} className="shrink-0 text-emerald-300" />
      </Link>
    );
  }

  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-violet-500/10 p-6 md:p-8">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100">
              <Icon name="School" size={13} /> Пилотный проект для школ · 2026/27
            </span>
            <h2 className="mb-2 font-montserrat text-2xl font-black leading-tight md:text-3xl">
              ИИ-наставник для всех учеников школы — <span className="text-emerald-300">бесплатно</span>
            </h2>
            <p className="max-w-2xl text-white/70">
              До 31 мая 2027 года: ИИ-наставник по предметам, разбор домашки по фото, курсы 1–11 класса и подготовка к ОГЭ и ЕГЭ. Без договоров и
              нагрузки на учителей — школа подключается за 1 минуту.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:min-w-[250px]">
            <Link
              to={join}
              onClick={goal("join")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3.5 font-black text-white transition-transform hover:scale-[1.02]"
            >
              <Icon name="Rocket" size={18} /> Подключить школу
            </Link>
            <a
              href={MAX_BOT_PILOT}
              target="_blank"
              rel="noopener noreferrer"
              onClick={goal("max")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              <Icon name="MessageCircle" size={16} /> Узнать подробнее в MAX
            </a>
            <Link to="/pilot" onClick={goal("student")} className="text-center text-xs text-white/55 hover:text-white">
              Я ученик — найти промокод своего города
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
