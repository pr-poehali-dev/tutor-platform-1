import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { COURSES } from "@/components/courses/coursesData";
import { TOCHKA_PARTNER_URL } from "@/components/partners/tochkaLinks";

const FACTS = [
  { value: `${COURSES.length}`, unit: "курсов", label: "школьная программа, ОГЭ, ЕГЭ и обучение взрослых", color: "from-purple-500 to-pink-500" },
  { value: "1–11", unit: "класс", label: "ИИ-репетитор по всем школьным предметам", color: "from-emerald-500 to-teal-500" },
  { value: "24/7", unit: "", label: "объясняет голосом и текстом, без записи", color: "from-cyan-500 to-blue-500" },
  { value: "0 ₽", unit: "первый урок", label: "по каждому предмету — без карты", color: "from-amber-500 to-orange-500" },
];

const PROMISES = [
  {
    icon: "CircleHelp",
    title: "Объясняет, пока не станет понятно",
    text: "Ребёнок спрашивает своими словами — ИИ разбирает тему по шагам, с примерами. Переспросить можно сколько угодно раз, без стеснения.",
    accent: "from-pink-500 to-purple-500",
  },
  {
    icon: "Camera",
    title: "Проверяет домашку по фото",
    text: "Сфотографировал решение — получил разбор ошибок и подсказку, где искать правильный ход. Готовый ответ не подсовывает.",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    icon: "ChartLine",
    title: "Родитель видит прогресс",
    text: "В кабинете видно, какие темы пройдены, где пробелы и сколько ребёнок занимался — без звонков и отчётов.",
    accent: "from-emerald-500 to-teal-500",
  },
];

/** Честные факты о платформе и что получает семья — без выдуманных цифр и отзывов. */
export default function StudentResults() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16" aria-labelledby="student-results-title">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3.5 py-1 mb-3">
          <Icon name="BadgeCheck" size={13} className="text-emerald-300" />
          <span className="text-[11px] text-emerald-200 font-bold uppercase tracking-wider">Честно о платформе</span>
        </div>
        <h2 id="student-results-title" className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight">
          Что вы получаете <span className="gradient-text-purple">с первого дня</span>
        </h2>
        <p className="text-white/60 text-sm md:text-base mt-3 max-w-2xl mx-auto">
          Мы молодая платформа и не рисуем цифры. Вот что уже работает — проверьте сами, первый урок бесплатный.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {FACTS.map((r) => (
          <div key={r.label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <p className={`font-montserrat font-black text-3xl md:text-4xl bg-gradient-to-br ${r.color} bg-clip-text text-transparent leading-none`}>
              {r.value}
            </p>
            {r.unit && <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-wide">{r.unit}</p>}
            <p className="text-white/55 text-xs mt-2 leading-snug">{r.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROMISES.map((p) => (
          <div key={p.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-3`}>
              <Icon name={p.icon} size={20} className="text-white" />
            </div>
            <p className="text-white font-bold leading-snug mb-2">{p.title}</p>
            <p className="text-white/70 text-sm leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
          <Icon name="Landmark" size={22} className="text-purple-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold">ООО «МАТ-ЛАБС» · партнёр Точка Банка</p>
          <p className="text-white/55 text-sm mt-0.5">
            ИНН 6312223437 · ОГРН 1266300004288 · Самара · <a href="tel:+79277486868" className="text-white/80 hover:text-white whitespace-nowrap">+7 927 748-68-68</a> (пн–пт, 8:00–17:00 мск). Оплата через ЮKassa, чек на почту, возврат по оферте.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/contacts#rekvizity" className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/12 rounded-xl px-4 py-2.5">
            <Icon name="FileText" size={15} /> Реквизиты
          </Link>
          <a href={TOCHKA_PARTNER_URL} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/12 rounded-xl px-4 py-2.5">
            <Icon name="Handshake" size={15} /> Точка Банк
          </a>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Link to="/reviews" className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <Icon name="MessageSquareHeart" size={16} className="text-purple-300" />
          Уже занимаетесь? Оставьте честный отзыв
          <Icon name="ChevronRight" size={16} className="text-white/40 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
