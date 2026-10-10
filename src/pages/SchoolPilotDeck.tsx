import { useCallback, useEffect, useLayoutEffect, useRef, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

const HERO_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/2ef9e081-945a-452c-9400-bf3c03b0eb2b.jpg";

/** Слайд рисуется на фиксированном холсте 16:9 и масштабируется под экран целиком —
 *  пропорции и вёрстка одинаковы на проекторе, ноутбуке, телефоне и в PDF. */
const W = 1280;
const H = 720;
const TOTAL = 10;

const NAVY = "#0f1f3d";
const BLUE = "#1d4ed8";

function Frame({ n, section, children }: { n: number; section: string; children: ReactNode }) {
  return (
    <div className="relative bg-white text-slate-800 font-golos overflow-hidden" style={{ width: W, height: H }}>
      <div className="absolute left-0 top-0 h-full w-[10px]" style={{ background: BLUE }} />
      <div className="absolute top-0 left-[10px] right-0 flex items-center justify-between px-16 pt-9">
        <span className="text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>{section}</span>
        <span className="font-montserrat font-black text-[15px] tracking-wide" style={{ color: NAVY }}>УЧИСЬПРО</span>
      </div>
      <div className="absolute inset-0 left-[10px] px-16 pt-[88px] pb-[64px]">{children}</div>
      <div className="absolute bottom-0 left-[10px] right-0 flex items-center justify-between px-16 pb-7 text-[12px] text-slate-400">
        <span>учисьпро.рф · Пилотный проект для школ Самары · 2026/27</span>
        <span className="tabular-nums">{String(n).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

function H2({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-montserrat font-extrabold text-[40px] leading-[1.12]" style={{ color: NAVY }}>{children}</h2>
      {sub && <p className="mt-3 text-[19px] text-slate-500 max-w-[900px]">{sub}</p>}
    </div>
  );
}

function Point({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50" style={{ color: BLUE }}>
        <Icon name={icon} size={27} />
      </div>
      <div>
        <p className="font-bold text-[22px] leading-snug" style={{ color: NAVY }}>{title}</p>
        <p className="text-[18px] text-slate-500 leading-relaxed mt-1.5">{text}</p>
      </div>
    </div>
  );
}

const SLIDES: ((n: number, print?: boolean) => ReactNode)[] = [
  // 1. Обложка — сразу выгода для школы
  (_n, print) => (
    <div className="relative bg-white font-golos overflow-hidden flex" style={{ width: W, height: H }}>
      <div className="w-[58%] h-full flex flex-col justify-between px-16 py-14 text-white" style={{ background: NAVY }}>
        <span className="font-montserrat font-black text-[20px] tracking-wide">УЧИСЬПРО</span>
        <div>
          <p className="text-[14px] font-bold uppercase tracking-[0.22em] text-blue-300 mb-5">Предложение для директоров и педагогов</p>
          {print ? (
            <p className="font-montserrat font-extrabold text-[50px] leading-[1.08] mb-6">
              Цифровой помощник для ваших учеников — без затрат для школы
            </p>
          ) : (
            <h1 className="font-montserrat font-extrabold text-[50px] leading-[1.08] mb-6">
              Цифровой помощник для ваших учеников — без затрат для школы
            </h1>
          )}
          <p className="text-[20px] text-slate-300 leading-relaxed max-w-[600px]">
            Платформа продолжает работу учителя дома: объясняет тему заново, помогает с домашним заданием и готовит к ОГЭ и ЕГЭ.
          </p>
        </div>
        <div className="flex items-center gap-8 text-[14px] text-slate-400">
          <span>Пилотный проект · школы Самары</span>
          <span>2026/27 учебный год</span>
        </div>
      </div>
      <div className="w-[42%] h-full relative">
        <img src={HERO_IMG} alt="Учитель помогает ученикам" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute bottom-10 left-0 right-10 bg-white px-7 py-5 shadow-xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em]" style={{ color: BLUE }}>Наша позиция</p>
          <p className="font-montserrat font-extrabold text-[22px] leading-tight mt-1" style={{ color: NAVY }}>Партнёр школы, а не конкурент</p>
        </div>
      </div>
    </div>
  ),

  // 2. Задача — говорим языком директора
  (n) => (
    <Frame n={n} section="Задача">
      <H2 sub="Эти вопросы мы слышим от директоров и учителей чаще всего.">С чем сегодня сталкивается школа</H2>
      <div className="grid grid-cols-2 gap-x-16 gap-y-14 mt-12">
        <Point icon="Clock" title="Урок не растягивается" text="45 минут на 25–30 учеников: разобрать тему с каждым, кто не понял, невозможно физически." />
        <Point icon="House" title="Дома ученик остаётся один" text="Не разобрался вечером — домашнее задание не сделано или списано из интернета." />
        <Point icon="UserX" title="Пропуски выбивают из программы" text="После болезни ребёнку трудно догнать класс, а у учителя нет времени на отдельные занятия." />
        <Point icon="Target" title="Высокие ожидания по ОГЭ и ЕГЭ" text="Результаты экзаменов — показатель школы, а репетитор по карману не каждой семье." />
      </div>
    </Frame>
  ),

  // 3. Позиционирование — снимаем страх конкуренции
  (n) => (
    <Frame n={n} section="Позиционирование">
      <H2>Учитель ведёт — УЧИСЬПРО поддерживает</H2>
      <div className="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-8 py-5 font-bold text-[16px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">Остаётся за школой и учителем</div>
        <div className="px-8 py-5 font-bold text-[16px] uppercase tracking-wider text-white border-b border-slate-200" style={{ background: BLUE }}>Берёт на себя платформа</div>
        {[
          ["Уроки, программа и методика", "Повторное объяснение темы — столько раз, сколько нужно"],
          ["Оценки, журнал и контроль", "Помощь с домашним заданием без готовых ответов"],
          ["Воспитание и живое общение", "Тренировка в формате ОГЭ и ЕГЭ в своём темпе"],
          ["Решения о том, чему и как учить", "Поддержка после пропусков — вечером и в выходные"],
        ].map(([a, b], idx) => (
          <div key={a} className="contents">
            <div className={`px-8 py-[18px] text-[18px] text-slate-700 flex items-center gap-3 ${idx < 3 ? "border-b border-slate-200" : ""}`}>
              <Icon name="School" size={20} className="text-slate-400 flex-shrink-0" />{a}
            </div>
            <div className={`px-8 py-[18px] text-[18px] flex items-center gap-3 bg-blue-50/60 ${idx < 3 ? "border-b border-slate-200" : ""}`} style={{ color: NAVY }}>
              <Icon name="Check" size={20} className="flex-shrink-0" style={{ color: BLUE }} />{b}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-7 text-[18px] text-slate-600">Мы не заменяем уроки и не забираем учеников — мы закрываем время между уроками, когда ученику не к кому обратиться.</p>
    </Frame>
  ),

  // 4. Ценность для каждой стороны
  (n) => (
    <Frame n={n} section="Ценность">
      <H2>Выгоду получает каждый участник</H2>
      <div className="grid grid-cols-3 gap-6">
        {[
          { icon: "Backpack", who: "Ученик", items: ["Понимает тему, а не списывает", "Помощь 24/7, в том числе в выходные", "Спокойная подготовка к экзаменам"] },
          { icon: "Presentation", who: "Учитель", items: ["Меньше повторов одной темы на уроке", "Отстающие подтягиваются дома", "Материалы и тесты к уроку за минуты"] },
          { icon: "Building2", who: "Администрация", items: ["Инструмент поддержки успеваемости", "Аргумент для родителей: школа даёт больше", "Ноль бюджета, закупок и договоров"] },
        ].map((c) => (
          <div key={c.who} className="rounded-xl border border-slate-200 p-7 flex flex-col">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-5" style={{ background: BLUE }}>
              <Icon name={c.icon} fallback="Users" size={24} />
            </div>
            <p className="font-montserrat font-extrabold text-[24px] mb-4" style={{ color: NAVY }}>{c.who}</p>
            <ul className="space-y-3">
              {c.items.map((it) => (
                <li key={it} className="flex gap-2.5 text-[16.5px] text-slate-600 leading-snug">
                  <Icon name="Check" size={18} className="flex-shrink-0 mt-0.5" style={{ color: BLUE }} />{it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Frame>
  ),

  // 5. Продукт
  (n) => (
    <Frame n={n} section="Продукт">
      <H2 sub="Всё работает в браузере на телефоне и компьютере — ничего устанавливать не нужно.">Что получает ученик на платформе</H2>
      <div className="grid grid-cols-3 gap-x-12 gap-y-14 mt-10">
        <Point icon="Bot" title="ИИ-наставник 24/7" text="Объясняет простыми словами и ведёт к ответу подсказками." />
        <Point icon="Camera" title="Домашнее задание по фото" text="Разбор задачи по шагам — чтобы понять решение." />
        <Point icon="BookOpen" title="60 курсов и предметов" text="1–11 класс: математика, физика, русский, химия, биология и другие." />
        <Point icon="ClipboardCheck" title="ОГЭ и ЕГЭ" text="Задания в формате экзамена с разбором и чек-лист выпускника." />
        <Point icon="PenLine" title="Мастерская сочинений" text="Итоговое сочинение и ЕГЭ: структура, аргументы, ошибки." />
        <Point icon="TrendingUp" title="Прогресс и мотивация" text="Видимые результаты и бонусы — ученик возвращается сам." />
      </div>
    </Frame>
  ),

  // 6. Возражения
  (n) => (
    <Frame n={n} section="Вопросы и ответы">
      <H2>Отвечаем на главные вопросы заранее</H2>
      <div className="grid grid-cols-2 gap-x-14 gap-y-12 mt-10">
        {[
          ["Не станут ли ученики списывать?", "Нет. Наставник не выдаёт готовый ответ — он задаёт наводящие вопросы и объясняет ход решения."],
          ["Безопасны ли данные детей?", "Данные обрабатываются по 152-ФЗ и используются только для обучения. Политика опубликована на сайте."],
          ["Добавится ли работа учителям?", "Нет. Достаточно один раз рассказать классу о пилоте — дальше ученики занимаются самостоятельно."],
          ["Сколько это стоит школе?", "Ничего. Пилот бесплатен для школы и учеников: без договоров, закупок и абонентской платы."],
        ].map(([q, a]) => (
          <div key={q} className="border-l-4 pl-6 py-1" style={{ borderColor: BLUE }}>
            <p className="font-bold text-[23px] mb-3" style={{ color: NAVY }}>{q}</p>
            <p className="text-[19px] text-slate-600 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </Frame>
  ),

  // 7. Оффер
  (n) => (
    <Frame n={n} section="Предложение">
      <H2>Условия пилотного проекта</H2>
      <div className="grid grid-cols-[1fr_1.15fr] gap-10 items-stretch">
        <div className="rounded-xl px-10 py-9 text-white flex flex-col justify-center" style={{ background: NAVY }}>
          <p className="text-[15px] uppercase tracking-[0.2em] text-blue-300 font-bold mb-3">Промокод для учеников</p>
          <p className="font-montserrat font-black text-[64px] tracking-[0.08em] leading-none mb-5">САМАРА</p>
          <p className="text-[20px] leading-snug text-slate-200">Бесплатный доступ ко всем курсам раздела «Школьникам»</p>
          <div className="mt-6 pt-5 border-t border-white/15 flex items-baseline gap-3">
            <span className="text-[15px] text-slate-400">Действует до</span>
            <span className="font-bold text-[24px]">31.05.2027</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            ["Wallet", "0 ₽", "для школы и для семей"],
            ["CalendarCheck", "Весь год", "с момента активации до конца мая"],
            ["BookOpen", "60", "курсов и предметов 1–11 класса"],
            ["CreditCard", "Без карты", "нужен только аккаунт ученика"],
          ].map(([icon, big, small]) => (
            <div key={big} className="rounded-xl border border-slate-200 p-6 flex flex-col justify-center">
              <Icon name={icon} size={24} style={{ color: BLUE }} />
              <p className="font-montserrat font-extrabold text-[32px] mt-3 leading-none" style={{ color: NAVY }}>{big}</p>
              <p className="text-[15px] text-slate-500 mt-2">{small}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-5 text-[14px] text-slate-400">Промокод не распространяется на курсы для взрослых и раздел «Малыш».</p>
    </Frame>
  ),

  // 8. Запуск
  (n) => (
    <Frame n={n} section="Запуск">
      <H2 sub="От школы — только рассказать ученикам. Всё остальное делаем мы.">Запуск за одну неделю</H2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          ["1", "Школа", "Назначает ответственного и публикует ссылку и промокод в школьных чатах и на сайте."],
          ["2", "Классные руководители", "Рассказывают о пилоте на классном часе и родительском собрании — 5 минут."],
          ["3", "Ученик", "Открывает учисьпро.рф/samara, входит и нажимает «Активировать» — меньше 2 минут."],
        ].map(([num, who, what]) => (
          <div key={num} className="relative rounded-xl border border-slate-200 p-7 pt-9">
            <span className="absolute -top-5 left-7 w-10 h-10 rounded-full flex items-center justify-center font-montserrat font-black text-white text-[18px]" style={{ background: BLUE }}>{num}</span>
            <p className="font-bold text-[20px] mb-2" style={{ color: NAVY }}>{who}</p>
            <p className="text-[16px] text-slate-600 leading-relaxed">{what}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-slate-50 px-8 py-5 flex items-center gap-4">
        <Icon name="Headphones" size={26} style={{ color: BLUE }} />
        <p className="text-[17px] text-slate-700">С нашей стороны: готовые тексты для чатов и родительских собраний, ответы на вопросы и помощь ученикам на всём протяжении пилота.</p>
      </div>
    </Frame>
  ),

  // 9. Измеримость
  (n) => (
    <Frame n={n} section="Результат">
      <H2 sub="Решение о продолжении сотрудничества школа принимает на основе цифр, а не обещаний.">Как оценим результат вместе</H2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          ["Users", "Охват", "Сколько учеников активировали доступ — по каждой школе."],
          ["Activity", "Регулярность", "Как часто занимаются и какие предметы выбирают."],
          ["MessageSquare", "Обратная связь", "Короткий опрос учителей, учеников и родителей."],
        ].map(([icon, t, d]) => (
          <div key={t} className="rounded-xl border border-slate-200 p-7">
            <Icon name={icon} size={28} style={{ color: BLUE }} />
            <p className="font-montserrat font-extrabold text-[22px] mt-4 mb-2" style={{ color: NAVY }}>{t}</p>
            <p className="text-[16px] text-slate-600 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center gap-4 rounded-xl bg-blue-50 px-7 py-5">
          <Icon name="CalendarClock" size={26} style={{ color: BLUE }} />
          <p className="text-[17px]" style={{ color: NAVY }}><b>Промежуточный отчёт</b> — по итогам первой четверти</p>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-blue-50 px-7 py-5">
          <Icon name="FileBarChart" fallback="FileText" size={26} style={{ color: BLUE }} />
          <p className="text-[17px]" style={{ color: NAVY }}><b>Итоговый отчёт</b> для каждой школы — в июне 2027</p>
        </div>
      </div>
    </Frame>
  ),

  // 10. Призыв к действию
  () => (
    <div className="relative font-golos overflow-hidden text-white flex flex-col justify-between px-16 py-14" style={{ width: W, height: H, background: NAVY }}>
      <span className="font-montserrat font-black text-[20px] tracking-wide">УЧИСЬПРО</span>
      <div className="grid grid-cols-[1.25fr_1fr] gap-14 items-center">
        <div>
          <p className="text-[14px] font-bold uppercase tracking-[0.22em] text-blue-300 mb-5">Следующий шаг</p>
          <h2 className="font-montserrat font-extrabold text-[48px] leading-[1.1] mb-8">Начнём пилот на этой неделе</h2>
          <ol className="space-y-4">
            {[
              "Назначить ответственного за пилот в школе",
              "Получить от нас готовые тексты для чатов и собраний",
              "Согласовать дату промежуточной встречи",
            ].map((s, i) => (
              <li key={s} className="flex items-center gap-4 text-[20px] text-slate-200">
                <span className="w-9 h-9 rounded-full bg-white/10 border border-white/25 flex items-center justify-center font-bold text-[16px] flex-shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-white rounded-xl p-9 text-center" style={{ color: NAVY }}>
          <p className="text-[14px] font-bold uppercase tracking-[0.18em]" style={{ color: BLUE }}>Страница для учеников</p>
          <p className="font-montserrat font-extrabold text-[34px] mt-3 mb-5">учисьпро.рф/samara</p>
          <div className="h-px bg-slate-200 mb-5" />
          <p className="text-[15px] text-slate-500">Промокод</p>
          <p className="font-montserrat font-black text-[40px] tracking-[0.08em]">САМАРА</p>
          <p className="text-[15px] text-slate-500 mt-1">до 31.05.2027</p>
        </div>
      </div>
      <p className="text-[15px] text-slate-400">Спасибо за внимание. Готовы показать платформу учителям и родителям на живом примере.</p>
    </div>
  ),
];

/**
 * Презентация для директоров и учителей школ-участниц пилота.
 * Холст 1280×720 масштабируется под окно; «Скачать PDF» печатает слайды
 * по одному на страницу 16:9 без обрезки.
 */
export default function SchoolPilotDeck() {
  const [i, setI] = useState(0);
  const go = useCallback((d: number) => setI((v) => Math.min(TOTAL - 1, Math.max(0, v + d))), []);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [touchX, setTouchX] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min((r.width - 32) / W, (r.height - 32) / H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-200 text-slate-800 font-golos">
      <Seo
        title="Презентация УЧИСЬПРО для школ: помощник, а не конкурент"
        description="Как платформа УЧИСЬПРО помогает школе, учителям и ученикам. Условия пилотного проекта для школ Самары и промокод САМАРА."
        canonical="https://учисьпро.рф/for-schools/presentation"
        noindex
      />
      <style>{`
        @media print {
          @page { size: ${W}px ${H}px; margin: 0; }
          html, body { background: #fff !important; }
          .deck-screen { display: none !important; }
          .deck-print { display: block !important; }
          .deck-print > div { break-after: page; page-break-after: always; }
          .deck-print > div:last-child { break-after: auto; page-break-after: auto; }
          .fixed { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="deck-screen flex flex-col h-full">
        <header className="flex items-center justify-between px-4 md:px-6 h-14 bg-white border-b border-slate-300 flex-shrink-0">
          <nav aria-label="Хлебные крошки" className="text-sm min-w-0">
            <ol className="flex items-center gap-1.5 text-slate-500 truncate">
              <li><Link to="/" className="hover:text-slate-900">Главная</Link></li>
              <li aria-hidden><Icon name="ChevronRight" size={13} className="text-slate-300" /></li>
              <li><Link to="/for-schools" className="hover:text-slate-900">Для школ</Link></li>
              <li aria-hidden className="hidden md:block"><Icon name="ChevronRight" size={13} className="text-slate-300" /></li>
              <li className="hidden md:block text-slate-800 font-medium">Презентация</li>
            </ol>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/samara/leaflet" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
              <Icon name="QrCode" size={15} /> <span className="hidden sm:inline">Листовка</span>
            </Link>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
              <Icon name="Download" size={15} /> PDF
            </button>
            <button onClick={fullscreen} className="inline-flex items-center rounded-md border border-slate-300 bg-white hover:bg-slate-50 p-2 text-slate-700" aria-label="На весь экран">
              <Icon name="Maximize" size={15} />
            </button>
          </div>
        </header>

        <main
          ref={stageRef}
          className="flex-1 min-h-0 flex items-center justify-center overflow-hidden"
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <div key={i} style={{ width: W * scale, height: H * scale }} className="animate-fade-in shadow-2xl shadow-slate-500/30 overflow-hidden">
            <div className="origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
              {SLIDES[i](i + 1)}
            </div>
          </div>
        </main>

        <footer className="flex items-center justify-between gap-3 px-4 md:px-6 h-16 bg-white border-t border-slate-300 flex-shrink-0">
          <button onClick={() => go(-1)} disabled={i === 0} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 md:px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30">
            <Icon name="ChevronLeft" size={18} /> <span className="hidden sm:inline">Назад</span>
          </button>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, n) => (
              <button
                key={n}
                onClick={() => setI(n)}
                aria-label={`Слайд ${n + 1}`}
                className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-blue-700" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
            <span className="ml-3 text-slate-500 text-xs tabular-nums">{i + 1} / {TOTAL}</span>
          </div>
          <button onClick={() => go(1)} disabled={i === TOTAL - 1} className="inline-flex items-center gap-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white px-3 md:px-4 py-2 text-sm font-semibold disabled:opacity-30">
            <span className="hidden sm:inline">Далее</span> <Icon name="ChevronRight" size={18} />
          </button>
        </footer>
      </div>

      <div className="deck-print hidden">
        {SLIDES.map((render, n) => (
          <div key={n} style={{ width: W, height: H }}>{render(n + 1, true)}</div>
        ))}
      </div>
    </div>
  );
}