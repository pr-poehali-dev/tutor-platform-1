import { ReactNode } from "react";
import Icon from "@/components/ui/icon";
import {
  CARE_PATH,
  CARE_PROMO,
  KIDS_FACTS,
  KIDS_PILOT_PATH,
  KIDS_PROMO,
  KIDS_PROMO_UNTIL,
} from "@/data/kidsPilot";

export const W = 1280;
export const H = 720;
export type DeckMode = "kindergarten" | "care";

const PLUM = "#3b1f4a";
const PINK = "#db2777";
const SITE = "учисьпро.рф";

const HERO_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/9006ea80-3bf8-4b06-8e9a-4e9ae32bfcf9.jpg";

function Frame({ n, total, section, mode, children }: { n: number; total: number; section: string; mode: DeckMode; children: ReactNode }) {
  return (
    <div className="relative bg-white text-slate-800 font-golos overflow-hidden" style={{ width: W, height: H }}>
      <div className="absolute left-0 top-0 h-full w-[10px]" style={{ background: PINK }} />
      <div className="absolute top-0 left-[10px] right-0 flex items-center justify-between px-16 pt-9">
        <span className="text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: PINK }}>{section}</span>
        <span className="font-montserrat font-black text-[15px] tracking-wide" style={{ color: PLUM }}>УЧИСЬПРО · Малыш</span>
      </div>
      <div className="absolute inset-0 left-[10px] px-16 pt-[88px] pb-[64px]">{children}</div>
      <div className="absolute bottom-0 left-[10px] right-0 flex items-center justify-between px-16 pb-7 text-[12px] text-slate-400">
        <span>{SITE} · {mode === "care" ? "Программа «Каждый ребёнок» для детских домов и интернатов" : "Пилотный проект «Малыш» для детских садов · 2026/27"}</span>
        <span className="tabular-nums">{String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

function H2({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-montserrat font-extrabold text-[40px] leading-[1.12]" style={{ color: PLUM }}>{children}</h2>
      {sub && <p className="mt-3 text-[19px] text-slate-500 max-w-[950px]">{sub}</p>}
    </div>
  );
}

function Point({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-pink-50" style={{ color: PINK }}>
        <Icon name={icon} size={27} />
      </div>
      <div>
        <p className="font-bold text-[22px] leading-snug" style={{ color: PLUM }}>{title}</p>
        <p className="text-[18px] text-slate-500 leading-relaxed mt-1.5">{text}</p>
      </div>
    </div>
  );
}

type Slide = (n: number, total: number, print?: boolean) => ReactNode;

export function buildSlides(mode: DeckMode): Slide[] {
  const care = mode === "care";
  const promo = care ? CARE_PROMO : KIDS_PROMO;
  const path = care ? CARE_PATH : KIDS_PILOT_PATH;
  const until = care ? "без ограничения срока" : `до ${KIDS_PROMO_UNTIL}`;

  const cover: Slide = (_n, _t, print) => {
    const title = care
      ? "Каждый ребёнок достоин хорошего образования"
      : "Развивающие занятия для ваших воспитанников — дома, вместе с родителями";
    return (
      <div className="relative bg-white font-golos overflow-hidden flex" style={{ width: W, height: H }}>
        <div className="w-[62%] h-full flex flex-col justify-between px-16 py-14 text-white" style={{ background: PLUM }}>
          <span className="font-montserrat font-black text-[20px] tracking-wide">УЧИСЬПРО · Малыш</span>
          <div>
            <p className="text-[14px] font-bold uppercase tracking-[0.22em] text-pink-300 mb-5">
              {care ? "Для руководителей детских домов, интернатов и центров семейного устройства" : "Предложение для заведующих и воспитателей"}
            </p>
            {print ? (
              <p className="font-montserrat font-extrabold text-[46px] leading-[1.1] mb-6">{title}</p>
            ) : (
              <h1 className="font-montserrat font-extrabold text-[46px] leading-[1.1] mb-6">{title}</h1>
            )}
            <p className="text-[20px] text-pink-100/80 leading-relaxed max-w-[640px]">
              {care
                ? "Бесплатный и бессрочный доступ ко всем занятиям «Малыша» и курсам для школьников — для каждого воспитанника."
                : "Сказки, игры, обучение чтению и занятия на речь и логику. Бесплатно для семей вашего детского сада весь учебный год."}
            </p>
          </div>
          <div className="flex items-center gap-8 text-[14px] text-pink-200/70">
            <span>{care ? "Программа «Каждый ребёнок»" : "Пилотный проект детских садов"}</span>
            <span>{care ? "Бессрочно" : "2026/27 учебный год"}</span>
          </div>
        </div>
        <div className="w-[38%] h-full relative">
          <img src={HERO_IMG} alt="Воспитатель занимается с детьми" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-10 left-0 right-10 bg-white px-7 py-5 shadow-xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em]" style={{ color: PINK }}>Наша позиция</p>
            <p className="font-montserrat font-extrabold text-[22px] leading-tight mt-1" style={{ color: PLUM }}>
              {care ? "Без разницы между детьми" : "Помощник воспитателя, а не замена"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const task: Slide = (n, t) => (
    <Frame n={n} total={t} section="Задача" mode={mode}>
      {care ? (
        <>
          <H2 sub="То, о чём говорят педагоги и воспитатели учреждений для детей-сирот.">Почему детям нужна дополнительная поддержка</H2>
          <div className="grid grid-cols-2 gap-x-16 gap-y-12 mt-10">
            <Point icon="Users" title="Мало индивидуального внимания" text="На одного воспитателя много детей — позаниматься с каждым отдельно получается редко." />
            <Point icon="TrendingDown" title="Пробелы в базовых навыках" text="Многие дети приходят с отставанием в речи, чтении и счёте, которое трудно догнать." />
            <Point icon="Wallet" title="Платные курсы недоступны" text="Репетиторы и онлайн-школы стоят денег, которых у учреждения на это нет." />
            <Point icon="Compass" title="Будущее начинается с учёбы" text="Хорошие знания — главный шанс выпускника на профессию и самостоятельную жизнь." />
          </div>
        </>
      ) : (
        <>
          <H2 sub="Эти вопросы мы чаще всего слышим от заведующих и воспитателей.">С чем сегодня сталкивается детский сад</H2>
          <div className="grid grid-cols-2 gap-x-16 gap-y-12 mt-10">
            <Point icon="MessageCircleQuestion" title="«Чем заняться с ребёнком дома?»" text="Родители спрашивают, а готового ответа с материалами у воспитателя часто нет." />
            <Point icon="Smartphone" title="Экран вместо развития" text="Дома ребёнок смотрит случайные ролики, а не развивающий контент, подходящий по возрасту." />
            <Point icon="MessageSquareText" title="Речь и подготовка к школе" text="Растёт число детей, которым нужна помощь с речью, вниманием и первыми шагами в чтении." />
            <Point icon="Clock" title="У воспитателя нет лишнего часа" text="Готовить индивидуальные задания на дом для каждой семьи физически невозможно." />
          </div>
        </>
      )}
    </Frame>
  );

  const what: Slide = (n, t) => (
    <Frame n={n} total={t} section="Что внутри" mode={mode}>
      <H2 sub={`Всё по возрастам ${KIDS_FACTS.ages}. Каждое занятие объясняет родителю, что оно развивает и как играть.`}>Раздел «Малыш» в цифрах</H2>
      <div className="grid grid-cols-3 gap-6 mt-4">
        {[
          [String(KIDS_FACTS.lessons), "развивающих занятий", "речь, логика и счёт, моторика, окружающий мир, творчество, эмоции"],
          [String(KIDS_FACTS.tales), "сказки и стихи", "с тёплой озвучкой — Пушкин, Толстой, русские народные"],
          [String(KIDS_FACTS.readingSteps), "ступенек чтения", "от звуков до предложений — учим звуки, как советуют логопеды"],
          [String(KIDS_FACTS.games), "игр", "на память, внимание и логику: шашки, мемори, повторяшка"],
          [String(KIDS_FACTS.songs), "песенок и потешек", "пальчиковые игры, колыбельные, народный фольклор"],
          ["1", "проводник", "Лиса Ксюша объясняет, подсказывает и хвалит голосом"],
        ].map(([num, label, desc]) => (
          <div key={label} className="rounded-xl border border-slate-200 p-6">
            <p className="font-montserrat font-black text-[48px] leading-none" style={{ color: PINK }}>{num}</p>
            <p className="font-bold text-[20px] mt-2" style={{ color: PLUM }}>{label}</p>
            <p className="text-[16px] text-slate-500 mt-1.5 leading-snug">{desc}</p>
          </div>
        ))}
      </div>
    </Frame>
  );

  const safety: Slide = (n, t) => (
    <Frame n={n} total={t} section="Безопасность" mode={mode}>
      <H2 sub="Мы понимаем ответственность за детей дошкольного возраста.">Безопасно и по нормам</H2>
      <div className="grid grid-cols-2 gap-x-16 gap-y-12 mt-10">
        <Point icon="Timer" title="Экранное время по СанПиН" text="Взрослый задаёт лимит в день — по нормам для возраста. Время вышло — экран блокируется." />
        <Point icon="ShieldCheck" title="Без рекламы и случайных ссылок" text="Ни баннеров, ни роликов «по рекомендации» — только проверенный детский контент." />
        <Point icon="Lock" title="Родительский контроль по 436-ФЗ" text="Настройки защищены от ребёнка, есть режим «перед сном»." />
        <Point icon="FileCheck" title="Персональные данные по 152-ФЗ" text="Ребёнку не нужен свой аккаунт. Регистрируется только взрослый." />
      </div>
    </Frame>
  );

  const role: Slide = (n, t) => (
    <Frame n={n} total={t} section={care ? "Как это работает" : "Роль детского сада"} mode={mode}>
      <H2>{care ? "Как подключить учреждение" : "Воспитатель ведёт — «Малыш» продолжает дома"}</H2>
      <div className="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-8 py-5 font-bold text-[16px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
          {care ? "Что делает учреждение" : "Остаётся за детским садом"}
        </div>
        <div className="px-8 py-5 font-bold text-[16px] uppercase tracking-wider text-white border-b border-slate-200" style={{ background: PINK }}>
          {care ? "Что делаем мы" : "Берёт на себя платформа"}
        </div>
        {(care
          ? [
              ["Назначает ответственного педагога", "Открываем доступ без оплаты и без срока"],
              ["Регистрирует аккаунт воспитателя или группы", "Подбираем занятия по возрасту каждого ребёнка"],
              ["Вводит промокод — 1 минута", "Отвечаем на вопросы и помогаем с запуском"],
              ["Занимается с детьми в удобное время", "Добавляем новые занятия и курсы"],
            ]
          : [
              ["Режим, программа и методика", "Занятия для дома — на каждый день, по возрасту"],
              ["Живое общение и воспитание", "Сказки и песенки с озвучкой вместо случайных роликов"],
              ["Наблюдение за развитием ребёнка", "Бесплатный тест развития с рекомендациями родителю"],
              ["Решения о том, чему учить", "Подготовка к чтению и школе в игровой форме"],
            ]
        ).map(([a, b], idx) => (
          <div key={a} className="contents">
            <div className={`px-8 py-[18px] text-[18px] text-slate-700 flex items-center gap-3 ${idx < 3 ? "border-b border-slate-200" : ""}`}>
              <Icon name={care ? "Building2" : "School"} size={20} className="text-slate-400 flex-shrink-0" />{a}
            </div>
            <div className={`px-8 py-[18px] text-[18px] flex items-center gap-3 bg-pink-50/60 ${idx < 3 ? "border-b border-slate-200" : ""}`} style={{ color: PLUM }}>
              <Icon name="Check" size={20} className="flex-shrink-0" style={{ color: PINK }} />{b}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-7 text-[18px] text-slate-600">
        {care
          ? "Один аккаунт можно использовать для занятий с группой детей на общем планшете или компьютере."
          : "Мы не заменяем занятия в группе — мы помогаем родителям продолжить их дома с пользой."}
      </p>
    </Frame>
  );

  const conditions: Slide = (n, t) => (
    <Frame n={n} total={t} section="Условия" mode={mode}>
      <H2 sub={care ? "Мы не берём денег с учреждений для детей-сирот — ни сейчас, ни потом." : "Пилот бесплатный и ни к чему не обязывает."}>
        {care ? "Бесплатно. Навсегда." : "Условия пилотного проекта"}
      </H2>
      <div className="grid grid-cols-3 gap-6 mt-6">
        {(care
          ? [
              ["Infinity", "Без срока", "Доступ не закончится и не станет платным"],
              ["Layers", "Всё обучение", "«Малыш» и все курсы для 1–11 класса, ОГЭ и ЕГЭ"],
              ["FileX", "Без договоров", "Ни закупок, ни платежей, ни отчётности для учреждения"],
            ]
          : [
              ["CalendarCheck", `До ${KIDS_PROMO_UNTIL}`, "Весь учебный год бесплатно для каждой семьи"],
              ["FileX", "Без договоров", "Ни закупок, ни платежей, ни абонентской платы для сада"],
              ["CreditCard", "Без карты", "Родителю не нужно привязывать карту — ничего не спишется"],
            ]
        ).map(([icon, title, text]) => (
          <div key={title} className="rounded-xl border border-slate-200 p-7">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-pink-50 mb-5" style={{ color: PINK }}>
              <Icon name={icon} size={28} />
            </div>
            <p className="font-montserrat font-extrabold text-[26px]" style={{ color: PLUM }}>{title}</p>
            <p className="text-[18px] text-slate-500 mt-2 leading-snug">{text}</p>
          </div>
        ))}
      </div>
    </Frame>
  );

  const steps: Slide = (n, t) => (
    <Frame n={n} total={t} section="Подключение" mode={mode}>
      <H2 sub="Около двух минут — с телефона или компьютера.">{care ? "Как открыть доступ" : "Как родителю получить доступ"}</H2>
      <div className="grid grid-cols-3 gap-6 mt-6">
        {[
          ["1", "Открыть страницу", `${SITE}${path}`],
          ["2", "Зарегистрироваться", "по email или через Яндекс ID"],
          ["3", "Ввести промокод", `${promo} — доступ откроется сразу`],
        ].map(([num, title, text]) => (
          <div key={num} className="rounded-xl border border-slate-200 p-7">
            <p className="font-montserrat font-black text-[56px] leading-none" style={{ color: PINK }}>{num}</p>
            <p className="font-bold text-[22px] mt-4" style={{ color: PLUM }}>{title}</p>
            <p className="text-[18px] text-slate-500 mt-1.5 leading-snug break-words">{text}</p>
          </div>
        ))}
      </div>
      {!care && (
        <div className="mt-8 rounded-xl px-7 py-5 text-[17px] text-slate-700 bg-pink-50 border border-pink-100 leading-relaxed">
          <b style={{ color: PLUM }}>Текст для родительского чата:</b> Наш детский сад участвует в пилотном проекте УЧИСЬПРО. До 31 мая 2027 года бесплатно доступен раздел «Малыш»: развивающие занятия, сказки с озвучкой, игры и обучение чтению. Откройте {SITE}{path} и введите промокод {promo}.
        </div>
      )}
    </Frame>
  );

  const final: Slide = () => (
    <div className="relative font-golos overflow-hidden text-white px-16 py-14 flex flex-col justify-between" style={{ width: W, height: H, background: PLUM }}>
      <span className="font-montserrat font-black text-[20px] tracking-wide">УЧИСЬПРО · Малыш</span>
      <div className="grid grid-cols-[1fr_440px] gap-14 items-center">
        <div>
          <p className="text-[14px] font-bold uppercase tracking-[0.22em] text-pink-300 mb-5">Следующий шаг</p>
          <h2 className="font-montserrat font-extrabold text-[46px] leading-[1.1] mb-8">
            {care ? "Подключим ваших воспитанников уже сегодня" : "Начнём пилот на этой неделе"}
          </h2>
          <ol className="space-y-4">
            {(care
              ? ["Назначить ответственного педагога", "Зарегистрировать аккаунт и ввести промокод", "Написать нам — поможем подобрать занятия"]
              : ["Отправить родителям текст с промокодом", "Рассказать о проекте на родительском собрании", "Через месяц — короткая встреча по итогам"]
            ).map((s, i) => (
              <li key={s} className="flex items-center gap-4 text-[20px] text-pink-50">
                <span className="w-9 h-9 rounded-full bg-white/10 border border-white/25 flex items-center justify-center font-bold text-[16px] flex-shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-white rounded-xl p-9 text-center" style={{ color: PLUM }}>
          <p className="text-[14px] font-bold uppercase tracking-[0.18em]" style={{ color: PINK }}>Страница активации</p>
          <p className="font-montserrat font-extrabold text-[28px] mt-3 mb-5 break-words">{SITE}{path}</p>
          <div className="h-px bg-slate-200 mb-5" />
          <p className="text-[15px] text-slate-500">Промокод</p>
          <p className="font-montserrat font-black tracking-[0.06em]" style={{ fontSize: promo.length > 8 ? 30 : 44 }}>{promo}</p>
          <p className="text-[15px] text-slate-500 mt-1">{until}</p>
        </div>
      </div>
      <p className="text-[15px] text-pink-200/70">Спасибо за внимание. Ответим на вопросы и покажем платформу на живом примере.</p>
    </div>
  );

  return [cover, task, what, safety, role, conditions, steps, final];
}
