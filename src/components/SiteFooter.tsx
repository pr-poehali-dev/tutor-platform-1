import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useDirection } from "@/hooks/useDirection";
import { DIRECTIONS, LEARNER_ORDER, LearnerDirection } from "@/lib/directions";

interface FooterLink {
  to: string;
  label: string;
}

/**
 * Ссылки подвала по направлениям. Раньше в подвале было ~30 ссылок
 * на всё сразу: родитель малыша видел «НЛП-практик», а школьник —
 * «Корпоративное обучение». Теперь колонка показывает своё направление.
 * Набор ссылок покрывает ключевые страницы, чтобы не терять перелинковку.
 */
const FOOTER_LINKS: Record<LearnerDirection, FooterLink[]> = {
  kids: [
    { to: "/kids", label: "Занятия по возрасту" },
    { to: "/kids/test", label: "Диагностика развития" },
    { to: "/kids/songs", label: "Развивающие песни" },
    { to: "/kids/library", label: "Сказки и книжки" },
    { to: "/kids/reading", label: "Подготовка к школе" },
    { to: "/kids/games", label: "Развивающие игры" },
    { to: "/kids/my-russia", label: "Моя Россия" },
    { to: "/draw", label: "Рисовашка" },
    { to: "/kids/about", label: "О программе" },
  ],
  school: [
    { to: "/tutor", label: "Онлайн-репетитор 24/7" },
    { to: "/pricing", label: "Подписка — 1 490 ₽/мес" },
    { to: "/homework", label: "Домашка по фото" },
    { to: "/exam-bank", label: "Сборник заданий ОГЭ и ЕГЭ" },
    { to: "/score-calculator", label: "Калькулятор баллов ЕГЭ" },
    { to: "/exam-checklist", label: "Чек-лист выпускника" },
    { to: "/know-yourself", label: "Профориентация «Познай себя»" },
    { to: "/graduate", label: "Подбор вуза" },
    { to: "/mgu-track", label: "МГУ-трек" },
    { to: "/writing-craft", label: "Мастерская сочинений" },
    { to: "/olympiad", label: "Олимпиада" },
    { to: "/silent", label: "Курс для глухих детей" },
    { to: "/feed?d=school", label: "Лента «Хочу всё знать»" },
  ],
  adult: [
    { to: "/kursy-dlya-vzroslyh", label: "Все 35 программ" },
    { to: "/ai-assistant", label: "Нейросети для работы" },
    { to: "/zarabotok-na-neirosetyah", label: "Заработок на нейросетях" },
    { to: "/remote-professions", label: "Удалённые профессии" },
    { to: "/career-pro", label: "Профориентация PRO" },
    { to: "/for-managers", label: "Руководителю" },
    { to: "/instrumenty-rukovoditelya", label: "Инструменты руководителя" },
    { to: "/business-2026", label: "Бизнес 2026: где открываться" },
    { to: "/bizlab", label: "Проверка бизнес-идеи" },
    { to: "/klinicheskiy-psiholog", label: "Профессия психолога" },
    { to: "/nlp-master", label: "Курс НЛП-практик" },
    { to: "/psychology", label: "Психологическая поддержка" },
    { to: "/feed?d=adult", label: "Статьи о бизнесе и карьере" },
  ],
};

const BUSINESS: FooterLink[] = [
  { to: "/for-business", label: "Своя онлайн-школа" },
  { to: "/corporate", label: "Корпоративное обучение" },
  { to: "/repetitoram", label: "Репетиторам" },
  { to: "/school-builder", label: "ИИ-конструктор курса" },
  { to: "/for-schools", label: "Школам и центрам" },
  { to: "/partners", label: "Партнёрская программа" },
  { to: "/grants", label: "Гранты" },
];

const SUPPORT: FooterLink[] = [
  { to: "/mini-course", label: "Бесплатные мини-курсы" },
  { to: "/help", label: "Центр помощи" },
  { to: "/contacts", label: "Написать нам" },
  { to: "/reviews", label: "Отзывы" },
  { to: "/referral", label: "Приведи друга" },
  { to: "/app", label: "Приложение" },
];

function LinkList({ links, accent }: { links: FooterLink[]; accent?: string }) {
  return (
    <ul className="space-y-2 text-sm">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className={`${accent || "text-white/65"} hover:text-white transition-colors`}>
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function SiteFooter() {
  const { active } = useDirection();
  const meta = active ? DIRECTIONS[active] : null;

  return (
    <footer className="relative z-10 mt-20 border-t border-white/8 bg-card/30 backdrop-blur-sm" aria-label="Подвал сайта">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <section className="lg:col-span-2" aria-label="О проекте УЧИСЬПРО">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">
                🚀
              </div>
              <span className="font-montserrat font-black text-white text-lg">УЧИСЬПРО</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              Одна платформа для всей семьи: малышам — развитие, школьникам — ИИ-репетитор и подготовка к экзаменам,
              взрослым — новые профессии и нейросети.
            </p>

            {/* Направления — переход в любое из них */}
            <div className="mt-4 flex flex-wrap gap-2">
              {LEARNER_ORDER.map((id) => {
                const d = DIRECTIONS[id];
                return (
                  <Link
                    key={id}
                    to={d.home}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      active === id
                        ? `bg-gradient-to-r ${d.gradient} text-white border-transparent`
                        : "border-white/12 text-white/70 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <span aria-hidden="true">{d.emoji}</span>
                    {d.label} · {d.age}
                  </Link>
                );
              })}
            </div>

            <a
              href="https://max.ru/id631205241205_biz"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:from-sky-400 hover:to-blue-500 transition-colors"
            >
              <Icon name="Send" size={16} aria-hidden="true" />
              Канал в MAX
            </a>
          </section>

          <nav aria-label={meta ? `Разделы: ${meta.label}` : "Популярное"}>
            <h4 className="font-montserrat font-bold text-white text-sm mb-3">
              {meta ? `${meta.emoji} ${meta.label}` : "🎒 Популярное"}
            </h4>
            <LinkList links={active ? FOOTER_LINKS[active] : FOOTER_LINKS.school.slice(0, 6)} accent={meta?.text} />
          </nav>

          <nav aria-label="Поддержка">
            <h4 className="font-montserrat font-bold text-white text-sm mb-3">Поддержка</h4>
            <LinkList links={SUPPORT} />
            <h4 className="font-montserrat font-bold text-white text-sm mt-6 mb-3">Документы</h4>
            <LinkList
              links={[
                { to: "/legal/offer", label: "Публичная оферта" },
                { to: "/legal/privacy", label: "Конфиденциальность" },
                { to: "/legal/terms", label: "Пользовательское соглашение" },
              ]}
            />
          </nav>

          <nav aria-label="Партнёрам и бизнесу">
            <h4 className="font-montserrat font-bold text-white/80 text-sm mb-3">Партнёрам и бизнесу</h4>
            <LinkList links={BUSINESS} accent="text-white/50" />
            <div className="mt-5 pt-3 border-t border-white/8 space-y-1.5 text-xs">
              <p className="text-white/60 flex items-center gap-1.5">
                <Icon name="ShieldCheck" size={12} className="text-green-400" aria-hidden="true" /> Серверы в РФ
              </p>
              <p className="text-white/60 flex items-center gap-1.5">
                <Icon name="Lock" size={12} className="text-cyan-400" aria-hidden="true" /> Шифрование HTTPS
              </p>
            </div>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="text-white/40 text-xs leading-relaxed">
            <p className="font-bold text-white/70 mb-1">© {new Date().getFullYear()} ООО «МАТ-ЛАБС»</p>
            <p>Сервис «УЧИСЬПРО» (учисьпро.рф) — продукт ООО «МАТ-ЛАБС». Все права защищены.</p>
            <p className="mt-1 max-w-xl">
              Программы, методики, тексты уроков и материалы курсов являются объектами авторского права (ст. 1225–1302 ГК РФ).
              Исключительные права принадлежат ООО «МАТ-ЛАБС». Копирование, распространение и перепродажа без письменного согласия правообладателя запрещены.
            </p>
            <p className="mt-1 max-w-xl">
              Сервис не выдаёт документов государственного образца. Услуги носят информационно-консультационный характер.
              Не подлежит лицензированию в соответствии со ст. 91 273-ФЗ.
            </p>
          </div>
          <div className="text-white/30 text-xs">Обработка данных: 152-ФЗ · Реклама: 38-ФЗ · ЗоЗПП</div>
        </div>
      </div>
    </footer>
  );
}
