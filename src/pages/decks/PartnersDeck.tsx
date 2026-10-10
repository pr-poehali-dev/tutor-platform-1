import { DeckShell, Frame, H2, Point, Card, QA, Steps, Note, Cover, Final, Slide, NAVY, BLUE } from "@/components/deck/DeckKit";

const IMG = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/53a4790d-b699-4604-b7f0-a6021b63f0fc.jpg";

const SLIDES: Slide[] = [
  ({ print }) => (
    <Cover
      print={print}
      kicker="Партнёрская программа"
      title="Зарабатывайте на рекомендациях образования"
      lead="Делитесь ссылкой на УЧИСЬПРО и получайте до 20% с каждой оплаты приглашённых — плюс доход с трёх линий вашей структуры."
      img={IMG}
      imgAlt="Партнёр делится ссылкой со смартфона"
      badgeTitle="Ставки"
      badgeText="20% · 10% · 5% с реальных оплат"
      bottom={["учисьпро.рф/partner", "Вывод от 1 000 ₽"]}
    />
  ),

  ({ n }) => (
    <Frame n={n} section="Почему образование">
      <H2 sub="Образование — одна из немногих тем, где рекомендацию благодарят, а не воспринимают как рекламу.">Продукт, который легко рекомендовать</H2>
      <div className="grid grid-cols-2 gap-x-16 gap-y-14 mt-12">
        <Point icon="Users" title="Широкая аудитория" text="Малыши 1–6 лет, школьники 1–11 класса, выпускники и взрослые — у каждого найдётся курс." />
        <Point icon="Repeat" title="Регулярные оплаты" text="Подписки продлеваются — а значит, вознаграждение приходит не один раз." />
        <Point icon="Gift" title="Есть бесплатный вход" text="Пробные уроки и 3 бесплатных месяца для малышей — человеку легко начать." />
        <Point icon="Heart" title="Реальная польза" text="Вы помогаете семьям экономить на репетиторах и учиться системно." />
      </div>
    </Frame>
  ),

  ({ n }) => (
    <Frame n={n} section="Вознаграждение">
      <H2 sub="Начисляется только с реальных оплат курсов и подписок. За регистрацию без покупки выплат нет.">Три линии дохода</H2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          ["1-я линия", "20%", "с оплат тех, кого пригласили лично вы"],
          ["2-я линия", "10%", "с оплат клиентов ваших партнёров"],
          ["3-я линия", "5%", "с оплат клиентов следующего уровня"],
        ].map(([lvl, big, small], i) => (
          <div key={lvl} className="rounded-xl p-8 text-center border" style={i === 0 ? { background: NAVY, borderColor: NAVY } : { borderColor: "#e2e8f0" }}>
            <p className={`text-[15px] font-bold uppercase tracking-[0.18em] ${i === 0 ? "text-blue-300" : ""}`} style={i === 0 ? undefined : { color: BLUE }}>{lvl}</p>
            <p className={`font-montserrat font-black text-[76px] leading-none my-4 ${i === 0 ? "text-white" : ""}`} style={i === 0 ? undefined : { color: NAVY }}>{big}</p>
            <p className={`text-[17px] ${i === 0 ? "text-slate-200" : "text-slate-600"}`}>{small}</p>
          </div>
        ))}
      </div>
      <Note icon="Clock">Ссылка запоминает приглашённого на 90 дней — решение об оплате редко принимают в первый визит.</Note>
    </Frame>
  ),

  ({ n }) => (
    <Frame n={n} section="Расчёт">
      <H2 sub="Пример на годовой подписке для школьника — 9 990 ₽.">Сколько можно заработать</H2>
      <div className="rounded-xl overflow-hidden border border-slate-200 mb-6">
        <div className="grid grid-cols-4 text-[15px] font-bold uppercase tracking-wider text-white" style={{ background: NAVY }}>
          {["Линия", "Оплат за месяц", "Ставка", "Ваш доход"].map((h) => <div key={h} className="px-7 py-4">{h}</div>)}
        </div>
        {[
          ["1-я — лично вы", "10", "20%", "19 980 ₽"],
          ["2-я — ваши партнёры", "30", "10%", "29 970 ₽"],
          ["3-я — их партнёры", "60", "5%", "29 970 ₽"],
        ].map((r) => (
          <div key={r[0]} className="grid grid-cols-4 text-[19px] border-b border-slate-200">
            {r.map((c, k) => <div key={k} className={`px-7 py-4 ${k === 3 ? "font-bold" : "text-slate-600"}`} style={k === 3 ? { color: NAVY } : undefined}>{c}</div>)}
          </div>
        ))}
        <div className="grid grid-cols-4 text-[21px] bg-blue-50">
          <div className="px-7 py-4 font-bold col-span-3" style={{ color: NAVY }}>Итого за месяц</div>
          <div className="px-7 py-4 font-montserrat font-black" style={{ color: BLUE }}>79 920 ₽</div>
        </div>
      </div>
      <p className="text-[14px] text-slate-400">Расчёт иллюстративный и не является гарантией дохода. Фактическая сумма зависит от числа и стоимости оплат.</p>
    </Frame>
  ),

  ({ n }) => (
    <Frame n={n} section="Кому подходит">
      <H2>Кому подходит программа</H2>
      <div className="grid grid-cols-3 gap-6">
        <Card icon="Video" title="Блогеры" items={["Мамские и школьные блоги", "Каналы про ЕГЭ и учёбу", "Telegram, VK, YouTube"]} />
        <Card icon="GraduationCap" title="Педагоги" items={["Репетиторы и учителя", "Логопеды и воспитатели", "Методисты и кураторы"]} />
        <Card icon="Store" title="Бизнес" items={["Детские центры и кружки", "Магазины канцтоваров", "Сообщества родителей"]} />
      </div>
    </Frame>
  ),

  ({ n }) => (
    <Frame n={n} section="Старт">
      <H2 sub="Подключение бесплатное и занимает пару минут.">Как начать зарабатывать</H2>
      <Steps
        items={[
          ["Регистрация", "Войдите на сайт и откройте кабинет партнёра."],
          ["Активация", "Нажмите «Стать партнёром» — ссылка появится сразу."],
          ["Делитесь ссылкой", "Посты, сторис, чаты, личные рекомендации."],
          ["Выводите деньги", "От 1 000 ₽ на карту или по СБП."],
        ]}
      />
      <Note icon="LayoutDashboard">В кабинете видно всё: приглашённые по линиям, начисления по каждой оплате, баланс и история выплат.</Note>
    </Frame>
  ),

  ({ n }) => (
    <Frame n={n} section="Вопросы и ответы">
      <H2>Частые вопросы партнёров</H2>
      <QA
        items={[
          ["Нужно ли вкладывать деньги?", "Нет. Участие бесплатное, вознаграждение начисляется только с реальных оплат приглашённых."],
          ["Какой нужен статус?", "Для получения выплат — самозанятый или ИП. Оформляется онлайн за один день."],
          ["Как быстро приходят выплаты?", "Заявку на вывод от 1 000 ₽ обрабатываем, деньги поступают в течение 3 рабочих дней."],
          ["Это не финансовая пирамида?", "Нет. Доход — только с оплат реальных курсов и подписок. За приглашение без покупки ничего не начисляется."],
        ]}
      />
    </Frame>
  ),

  () => (
    <Final
      title="Получите свою ссылку за 2 минуты"
      steps={["Зарегистрируйтесь на учисьпро.рф", "Активируйте статус партнёра в кабинете", "Расскажите о платформе своей аудитории"]}
      cardTitle="Кабинет партнёра"
      cardUrl="учисьпро.рф/partner"
      cardNote={<><b style={{ color: NAVY }}>20% · 10% · 5%</b> с оплат трёх линий<br />Вывод от 1 000 ₽ на карту или СБП</>}
      thanks="Спасибо за внимание. Поможем подобрать формат продвижения под вашу аудиторию."
    />
  ),
];

export default function PartnersDeck() {
  return (
    <DeckShell
      slides={SLIDES}
      footer="учисьпро.рф · Партнёрская программа"
      seoTitle="Презентация партнёрской программы УЧИСЬПРО"
      seoDescription="Зарабатывайте на рекомендациях: 20% с оплат приглашённых, 10% и 5% со второй и третьей линии. Вывод от 1 000 ₽ на карту или по СБП."
      canonicalPath="/partner/presentation"
      crumbs={[{ label: "Главная", href: "/" }, { label: "Кабинет партнёра", href: "/partner" }, { label: "Презентация" }]}
    />
  );
}
