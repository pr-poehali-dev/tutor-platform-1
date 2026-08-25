import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Group {
  id: string;
  emoji: string;
  title: string;
  lead: string;
  points: string[];
  href: string;
  hrefLabel: string;
  accent: string;
}

/**
 * Блоки под конкретные аудитории. Формулировки взяты из реальных поисковых
 * запросов, по которым сайт уже показывается: «онлайн репетитор для школьников»,
 * «репетитор 11 класс онлайн», «подготовка к ЕГЭ», «репетитор 9 класс онлайн».
 */
const GROUPS: Group[] = [
  {
    id: "school",
    emoji: "🎒",
    title: "Онлайн-репетитор для школьников 1–9 классов",
    lead: "Когда нужно подтянуть предмет, разобрать непонятную тему или просто не отстать от класса.",
    points: [
      "Объясняем столько раз, сколько нужно — наставник не устаёт и не торопит",
      "Домашка по фото: сфотографировали задание — получили разбор ошибки",
      "Математика, физика, информатика, биология, химия — в одной подписке",
      "Занятие можно начать вечером, в выходной или на каникулах",
    ],
    href: "/courses",
    hrefLabel: "Посмотреть предметы",
    accent: "from-cyan-500/15 to-blue-500/[0.07] border-cyan-400/25",
  },
  {
    id: "grade9",
    emoji: "📘",
    title: "Репетитор 9 класс онлайн — подготовка к ОГЭ",
    lead: "Первый серьёзный экзамен. Важно закрыть пробелы и набить руку на типовых заданиях.",
    points: [
      "Разбор заданий ОГЭ по структуре экзамена, а не «вообще по предмету»",
      "Задачники с объяснением каждого шага решения",
      "Диагностика: находим темы, которые провалены, и добираем именно их",
      "Занимаемся хоть каждый день — количество уроков не ограничено",
    ],
    href: "/exam-bank",
    hrefLabel: "Задания ОГЭ",
    accent: "from-emerald-500/15 to-teal-500/[0.07] border-emerald-400/25",
  },
  {
    id: "grade11",
    emoji: "🎓",
    title: "Репетитор 11 класс онлайн — подготовка к ЕГЭ",
    lead: "Выпускной год, когда репетиторы по каждому предмету складываются в неподъёмную сумму.",
    points: [
      "Все предметы ЕГЭ входят в одну подписку — не нужно платить за каждый отдельно",
      "Разбор заданий по актуальной структуре экзамена",
      "Можно заниматься ночью перед пробником — наставник доступен круглосуточно",
      "Профориентация: поможем понять, куда поступать и зачем",
    ],
    href: "/exam-bank",
    hrefLabel: "Задания ЕГЭ",
    accent: "from-purple-500/15 to-fuchsia-500/[0.07] border-purple-400/25",
  },
  {
    id: "adult",
    emoji: "💼",
    title: "Взрослым — новая профессия и нейросети",
    lead: "Учиться никогда не поздно: осваиваем новое в своём темпе, без расписания и группы.",
    points: [
      "Курсы по нейросетям, запуску бизнеса и удалённым профессиям",
      "Занятия в любое время — после работы, в дороге, по выходным",
      "Индивидуальная программа, если готового курса под задачу нет",
      "Никаких групп и созвонов по расписанию",
    ],
    href: "/order",
    hrefLabel: "Собрать курс под себя",
    accent: "from-amber-500/15 to-orange-500/[0.07] border-amber-400/25",
  },
];

export default function PricingForWhom() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-14">
      <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
        Кому подходит подписка
      </h2>
      <p className="text-white/60 text-center max-w-2xl mx-auto mb-10">
        Одна подписка закрывает и школьные предметы, и подготовку к экзаменам, и обучение
        взрослых. Доплачивать за каждое направление не нужно.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        {GROUPS.map((g) => (
          <article
            key={g.id}
            className={`rounded-3xl border bg-gradient-to-br ${g.accent} p-6 flex flex-col card-hover`}
          >
            <div className="text-3xl mb-3">{g.emoji}</div>
            <h3 className="font-montserrat font-black text-lg md:text-xl text-white mb-2 leading-snug">
              {g.title}
            </h3>
            <p className="text-white/65 text-sm leading-relaxed mb-4">{g.lead}</p>

            <ul className="space-y-2.5 flex-1">
              {g.points.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-white/80">
                  <Icon name="Check" size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>

            <Link
              to={g.href}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 hover:text-white transition-colors"
            >
              {g.hrefLabel}
              <Icon name="ArrowRight" size={15} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
