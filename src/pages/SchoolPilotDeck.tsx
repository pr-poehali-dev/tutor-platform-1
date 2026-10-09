import { useCallback, useEffect, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

const HERO_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/2ef9e081-945a-452c-9400-bf3c03b0eb2b.jpg";

interface Slide {
  id: string;
  render: () => ReactNode;
}

function Card({ icon, title, text, tone = "violet" }: { icon: string; title: string; text: string; tone?: "violet" | "cyan" | "amber" | "emerald" }) {
  const tones = {
    violet: "from-violet-500/25 to-violet-500/5 text-violet-200",
    cyan: "from-cyan-500/25 to-cyan-500/5 text-cyan-200",
    amber: "from-amber-500/25 to-amber-500/5 text-amber-200",
    emerald: "from-emerald-500/25 to-emerald-500/5 text-emerald-200",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tones[tone]} flex items-center justify-center mb-3`}>
        <Icon name={icon} size={21} />
      </div>
      <h3 className="font-montserrat font-bold text-base md:text-lg text-white mb-1.5">{title}</h3>
      <p className="text-white/65 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Title({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div className="mb-6 md:mb-8">
      <p className="text-cyan-300 text-xs md:text-sm font-bold uppercase tracking-[0.18em] mb-2">{kicker}</p>
      <h2 className="font-montserrat font-black text-2xl md:text-4xl leading-tight text-white">{children}</h2>
    </div>
  );
}

const SLIDES: Slide[] = [
  {
    id: "cover",
    render: () => (
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 items-center h-full">
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
            <Icon name="Handshake" size={14} className="text-violet-300" />
            <span className="text-xs text-violet-100 font-bold uppercase tracking-wider">Для директоров и учителей</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.08] text-white mb-4">
            УЧИСЬПРО — помощник школы,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">а не конкурент</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg mb-6">
            Цифровая платформа, которая продолжает работу учителя дома: объясняет, тренирует и проверяет — по школьной программе.
          </p>
          <p className="text-white/50 text-sm">учисьпро.рф · пилотный проект для школ Самары · 2026/27 учебный год</p>
        </div>
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-900/40">
          <img src={HERO_IMG} alt="Учитель помогает ученикам за ноутбуком" className="w-full h-full object-cover aspect-[4/3]" />
        </div>
      </div>
    ),
  },
  {
    id: "pain",
    render: () => (
      <>
        <Title kicker="С чем сталкивается школа">Знакомая картина</Title>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card icon="Clock" tone="amber" title="45 минут на 25–30 учеников" text="Учитель физически не успевает разобрать тему с каждым, кто не понял." />
          <Card icon="House" tone="amber" title="Дома ученик остаётся один" text="Не понял задачу вечером — домашка не сделана или списана из интернета." />
          <Card icon="UserX" tone="amber" title="Пропуски и болезни" text="После недели дома ребёнку трудно догнать класс без дополнительной помощи." />
          <Card icon="Wallet" tone="amber" title="Репетитор доступен не всем" text="Платные занятия — серьёзная нагрузка на семейный бюджет." />
        </div>
      </>
    ),
  },
  {
    id: "friend",
    render: () => (
      <>
        <Title kicker="Главное">Почему мы друг, а не конкурент</Title>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] p-5 md:p-6">
            <p className="font-montserrat font-black text-rose-200 mb-4 flex items-center gap-2"><Icon name="X" size={18} /> УЧИСЬПРО не делает</p>
            <ul className="space-y-3 text-white/75 text-sm md:text-base">
              <li>• Не заменяет уроки и учителя</li>
              <li>• Не ставит оценки и не ведёт журнал</li>
              <li>• Не забирает учеников из школы</li>
              <li>• Не меняет программу и не спорит с учителем</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-5 md:p-6">
            <p className="font-montserrat font-black text-emerald-200 mb-4 flex items-center gap-2"><Icon name="Check" size={18} /> УЧИСЬПРО делает</p>
            <ul className="space-y-3 text-white/75 text-sm md:text-base">
              <li>• Повторно объясняет тему урока — столько раз, сколько нужно</li>
              <li>• Помогает с домашним заданием, не выдавая готовый ответ</li>
              <li>• Даёт тренировку по ОГЭ и ЕГЭ в спокойном темпе</li>
              <li>• Помогает догнать класс после пропусков</li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-center text-white/80 text-base md:text-lg font-semibold">
          Учитель задаёт направление — платформа помогает ученику пройти путь дома.
        </p>
      </>
    ),
  },
  {
    id: "students",
    render: () => (
      <>
        <Title kicker="Для учеников">Что получает ученик</Title>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card icon="Bot" title="ИИ-наставник 24/7" text="Объясняет простыми словами, отвечает на вопросы в любое время — и вечером, и в выходные." />
          <Card icon="Camera" tone="cyan" title="Домашка по фото" text="Сфотографировал задачу — получил разбор по шагам. Цель — понять решение, а не списать." />
          <Card icon="BookOpen" title="Курсы 1–11 класса" text="Математика, физика, русский язык, химия, биология, информатика, история и другие предметы." />
          <Card icon="Target" tone="cyan" title="Подготовка к ОГЭ и ЕГЭ" text="Сборник заданий с разбором, задания в формате экзамена и чек-лист выпускника." />
          <Card icon="PenLine" title="Мастерская сочинений" text="Итоговое сочинение и сочинение ЕГЭ: структура, аргументы, разбор ошибок." />
          <Card icon="Trophy" tone="cyan" title="Мотивация" text="Прогресс, бонусы за занятия и рейтинг — ученик возвращается сам, без напоминаний." />
        </div>
      </>
    ),
  },
  {
    id: "teachers",
    render: () => (
      <>
        <Title kicker="Для учителей">Чем платформа помогает учителю</Title>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card icon="Repeat" tone="emerald" title="Меньше повторов одного и того же" text="Ученик, который не понял, может разобрать тему дома — на уроке остаётся время на новое." />
          <Card icon="Users" tone="emerald" title="Поддержка слабых и сильных" text="Отстающим — объяснение заново, сильным — задачи повышенной сложности и олимпиадный уровень." />
          <Card icon="Wand2" tone="emerald" title="Материалы к уроку за минуты" text="ИИ-конструктор помогает собрать программу, задания и тесты по теме — учитель редактирует под себя." />
          <Card icon="FileText" tone="emerald" title="Готовые разборы и статьи" text="Методички по сочинениям, задачам на проценты, физике и английскому — можно рекомендовать классу." />
        </div>
      </>
    ),
  },
  {
    id: "safety",
    render: () => (
      <>
        <Title kicker="Безопасность и честность">Что важно знать администрации</Title>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card icon="ShieldCheck" title="Персональные данные — по 152-ФЗ" text="Политика конфиденциальности опубликована на сайте, данные учеников используются только для обучения." />
          <Card icon="Lightbulb" tone="cyan" title="Объясняет, а не решает за ученика" text="ИИ-наставник ведёт к ответу вопросами и подсказками — цель в понимании, а не в готовом решении." />
          <Card icon="Baby" title="Возрастная маркировка" text="У каждого курса указан возрастной рейтинг, контент соответствует возрасту ученика." />
          <Card icon="BadgeCheck" tone="cyan" title="Без обязательств для школы" text="Пилот бесплатен для учеников и школы. Никаких договоров, закупок и абонентской платы." />
        </div>
      </>
    ),
  },
  {
    id: "pilot",
    render: () => (
      <>
        <Title kicker="Пилотный проект">Условия для школ Самары</Title>
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-6 items-stretch">
          <div className="rounded-3xl border border-amber-400/35 bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-violet-600/20 p-6 md:p-8 flex flex-col justify-center text-center">
            <p className="text-white/70 text-sm mb-2">Промокод для учеников</p>
            <p className="font-mono font-black text-4xl md:text-5xl tracking-[0.15em] text-amber-200 mb-3">САМАРА</p>
            <p className="text-white/85 font-semibold">Бесплатный доступ к курсам раздела «Школьникам»</p>
            <p className="text-white/60 text-sm mt-2">действует до 31.05.2027</p>
          </div>
          <div className="space-y-3">
            {[
              ["CalendarCheck", "Весь учебный год", "Доступ открыт с момента активации и до 31 мая 2027 года."],
              ["BookOpen", "Все школьные курсы", "1–11 класс, ОГЭ, ЕГЭ и предметы с ИИ-преподавателем."],
              ["Info", "Только раздел «Школьникам»", "Курсы для взрослых и раздел «Малыш» в пилот не входят."],
              ["CreditCard", "Без карты и оплаты", "Ученику нужен только аккаунт на сайте."],
            ].map(([icon, title, text]) => (
              <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Icon name={icon} size={20} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{title}</p>
                  <p className="text-white/60 text-sm">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    ),
  },
  {
    id: "steps",
    render: () => (
      <>
        <Title kicker="Как подключиться">Три шага для ученика</Title>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            ["1", "Открыть страницу пилота", "учисьпро.рф/samara — с телефона или компьютера."],
            ["2", "Войти или зарегистрироваться", "По почте или через Яндекс ID — около минуты."],
            ["3", "Нажать «Активировать»", "Промокод САМАРА уже подставлен — курсы открываются сразу."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-montserrat font-black text-white mb-3">{n}</div>
              <p className="font-montserrat font-bold text-white mb-1">{t}</p>
              <p className="text-white/60 text-sm">{d}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/[0.06] p-5">
          <p className="font-bold text-cyan-100 mb-2 flex items-center gap-2"><Icon name="Megaphone" size={18} /> Что может сделать школа</p>
          <ul className="text-white/75 text-sm md:text-base space-y-1.5">
            <li>• Рассказать о пилоте на классных часах и родительских собраниях</li>
            <li>• Разместить ссылку и промокод в школьном чате или на сайте школы</li>
            <li>• Рекомендовать платформу ученикам, которые пропустили тему или готовятся к экзаменам</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "results",
    render: () => (
      <>
        <Title kicker="Итоги пилота">Что мы предлагаем оценить вместе</Title>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Card icon="Users" title="Вовлечённость" text="Сколько учеников активировали доступ и занимаются регулярно." />
          <Card icon="TrendingUp" tone="cyan" title="Отзывы учителей" text="Стало ли проще с домашними заданиями и повторением тем." />
          <Card icon="MessageCircle" tone="emerald" title="Мнение учеников и родителей" text="Что полезно, чего не хватает, что улучшить." />
        </div>
        <p className="text-white/70 text-center text-base md:text-lg">
          По итогам пилота подготовим для каждой школы короткий отчёт и вместе решим, как развивать сотрудничество дальше.
        </p>
      </>
    ),
  },
  {
    id: "contacts",
    render: () => (
      <div className="flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl mb-5">🎓</div>
        <h2 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4">Учимся вместе со школой</h2>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mb-8">
          Спасибо за внимание! Будем рады ответить на вопросы и показать платформу на живом примере — для учителей и родителей.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/samara" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black py-3.5 px-7 rounded-xl hover:scale-[1.02] transition-transform">
            <Icon name="Ticket" size={18} /> учисьпро.рф/samara
          </Link>
          <Link to="/shkola" className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-7 rounded-xl transition-colors">
            <Icon name="School" size={18} /> Раздел «Школьникам»
          </Link>
        </div>
      </div>
    ),
  },
];

/**
 * Презентация для директоров и учителей школ-участниц пилота.
 * Листается стрелками, свайпом и кнопками; «Скачать PDF» печатает все слайды
 * по одному на страницу — удобно отправить директору файлом.
 */
export default function SchoolPilotDeck() {
  const [i, setI] = useState(0);
  const total = SLIDES.length;
  const go = useCallback((d: number) => setI((v) => Math.min(total - 1, Math.max(0, v + d))), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const [touchX, setTouchX] = useState<number | null>(null);

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <div className="min-h-screen bg-mesh text-white font-golos">
      <Seo
        title="Презентация УЧИСЬПРО для школ: помощник, а не конкурент"
        description="Как платформа УЧИСЬПРО помогает школе, учителям и ученикам. Условия пилотного проекта для школ Самары и промокод САМАРА."
        canonical="https://учисьпро.рф/for-schools/presentation"
        noindex
      />
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          .deck-screen { display: none !important; }
          .deck-print { display: block !important; }
          .deck-print section { page-break-after: always; break-after: page; height: 100vh; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="deck-screen flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/5">
          <Link to="/for-schools" className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <Icon name="ArrowLeft" size={16} /> Для школ
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs md:text-sm font-semibold">
              <Icon name="Download" size={15} /> Скачать PDF
            </button>
            <button onClick={fullscreen} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs md:text-sm font-semibold" aria-label="На весь экран">
              <Icon name="Maximize" size={15} />
            </button>
          </div>
        </header>

        <main
          className="flex-1 flex items-center px-4 md:px-10 py-6"
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <div key={SLIDES[i].id} className="w-full max-w-6xl mx-auto animate-fade-in">
            {SLIDES[i].render()}
          </div>
        </main>

        <footer className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 border-t border-white/5">
          <button onClick={() => go(-1)} disabled={i === 0} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-bold disabled:opacity-30">
            <Icon name="ChevronLeft" size={18} /> Назад
          </button>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((s, n) => (
              <button
                key={s.id}
                onClick={() => setI(n)}
                aria-label={`Слайд ${n + 1}`}
                className={`h-2 rounded-full transition-all ${n === i ? "w-7 bg-gradient-to-r from-violet-400 to-cyan-400" : "w-2 bg-white/25 hover:bg-white/45"}`}
              />
            ))}
            <span className="ml-3 text-white/50 text-xs tabular-nums">{i + 1} / {total}</span>
          </div>
          <button onClick={() => go(1)} disabled={i === total - 1} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-sm font-black disabled:opacity-30">
            Далее <Icon name="ChevronRight" size={18} />
          </button>
        </footer>
      </div>

      <div className="deck-print hidden bg-[#120d1f]">
        {SLIDES.map((s) => (
          <section key={s.id} className="flex items-center px-12 py-10">
            <div className="w-full">{s.render()}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
