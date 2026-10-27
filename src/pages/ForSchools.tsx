import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const SITE_URL = "https://учисьпро.рф";

const CAPABILITIES = [
  { icon: "Bot", title: "ИИ-преподаватель 24/7", text: "Отвечает ученикам в тексте и голосом круглосуточно, проверяет домашние задания и помогает разбирать сложные темы." },
  { icon: "Wand2", title: "Курсы за час, без программиста", text: "Вводите тему — ИИ собирает программу, уроки, задания и тесты. Всё редактируется через удобный интерфейс." },
  { icon: "Palette", title: "Ваш бренд и домен", text: "White-label: логотип, цвета и адрес — ваши. Ученики видят только ваш бренд, нас в кадре нет." },
  { icon: "Wallet", title: "Финансы из коробки", text: "Приём оплат, рассрочка, промокоды, чеки по 54-ФЗ и выплаты на счёт заведения. Работаем по договору." },
  { icon: "BarChart3", title: "Аналитика и рост", text: "Дашборды: воронка, доходимость, NPS, выручка. ИИ подсказывает, что улучшить в курсах." },
  { icon: "Target", title: "Помощь с грантами", text: "ИИ готовит заявки на гранты и конкурсы: актуальность, цели, смета и календарный план." },
];

const AUDIENCE = [
  { icon: "School", title: "Онлайн-школы", text: "Усильте курсы ИИ-преподавателем и соберите всё на одной платформе." },
  { icon: "GraduationCap", title: "Колледжи и техникумы", text: "Допобразование, подготовка к ОГЭ/ЕГЭ и профкурсы с прогрессом и сертификатами." },
  { icon: "Users", title: "Учебные центры", text: "Запуск и монетизация онлайн-направлений без своей IT-команды." },
];

export default function ForSchools() {
  return (
    <div className="min-h-screen bg-mesh text-white font-golos">
      <Seo
        title="Для школ: бесплатный пилот УЧИСЬПРО на 2026/27 учебный год"
        description="Бесплатный доступ к ИИ-наставнику и курсам 1–11 класса для всех учеников школы до 31 мая 2027 года. Подключение за 1 минуту, без договоров. Для колледжей — обучение под своим брендом."
        keywords="платформа для школ, обучение для школ, цифровая школа, лицензия для образовательных организаций"
        canonical={`${SITE_URL}/for-schools`}
      />

      {/* Шапка */}
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎓</div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link to="/podklyuchit-shkolu?src=for_schools" className="text-sm font-bold text-emerald-200 hover:text-white transition-colors">Подключить школу</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-12">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: "Главная", href: "/" }, { label: "Для школ" }]}
        />
        {/* Пилот — главное предложение для школ */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 rounded-full px-4 py-1.5 mb-5">
            <Icon name="School" size={13} className="text-emerald-300" />
            <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Пилотный проект · 2026/27 учебный год</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            ИИ-наставник для каждого ученика —{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">бесплатно для школы</span>
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto mb-6">
            Все ученики школы получают доступ к ИИ-наставнику по предметам, разбору домашки по фото и курсам 1–11 класса до 31 мая 2027 года.
            Без договоров, закупок и нагрузки на учителей.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/podklyuchit-shkolu?src=for_schools"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black py-3.5 px-7 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <Icon name="Rocket" size={18} /> Подключить школу — 1 минута
            </Link>
            <Link
              to="/for-schools/presentation"
              className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-7 rounded-xl transition-colors"
            >
              <Icon name="Presentation" size={18} /> Презентация для директора
            </Link>
          </div>
        </section>

        <section className="mb-14 grid sm:grid-cols-3 gap-4">
          {[
            ["1", "Подключаете школу", "Форма из 4 полей. Сразу получаете свою ссылку, QR-код и тексты для чатов."],
            ["2", "Классные руководители пересылают", "Готовые тексты для чатов учеников и родителей, памятка для печати."],
            ["3", "Видите результат", "Сколько учеников подключилось — по классам и по дням. Итоговый отчёт — в июне 2027."],
          ].map(([n, title, text]) => (
            <div key={n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-200 font-bold flex items-center justify-center mb-3">{n}</span>
              <h3 className="font-bold mb-1">{title}</h3>
              <p className="text-white/60 text-sm">{text}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-4">
            <Icon name="Handshake" size={13} className="text-violet-300" />
            <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">Колледжам, учебным центрам и онлайн-школам</span>
          </div>
          <h2 className="font-montserrat font-black text-2xl md:text-4xl mb-3 leading-tight">
            Онлайн-обучение под вашим брендом{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">с ИИ-преподавателем</span>
          </h2>
          <p className="text-white/65 max-w-2xl mx-auto">
            Если вы хотите запускать свои платные курсы — дадим платформу без абонплаты: вы платите только процент с реальных продаж.
          </p>
        </section>

        {/* Возможности */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-xl md:text-2xl text-center mb-6">Что входит в платформу</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 flex items-center justify-center flex-shrink-0">
                  <Icon name={c.icon} size={20} className="text-violet-200" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{c.title}</h3>
                  <p className="text-white/60 text-sm">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Условия */}
        <section className="mb-14">
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-background to-cyan-500/10 p-6 md:p-8">
            <h2 className="font-montserrat font-black text-2xl mb-5 text-center">Честная модель партнёрства</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-montserrat font-black text-3xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">0 ₽</p>
                <p className="text-white/65 text-sm mt-1">Абонплата — платите только процент с продаж</p>
              </div>
              <div>
                <p className="font-montserrat font-black text-3xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">1 вечер</p>
                <p className="text-white/65 text-sm mt-1">Запуск школы с сопровождением команды</p>
              </div>
              <div>
                <p className="font-montserrat font-black text-3xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">54-ФЗ</p>
                <p className="text-white/65 text-sm mt-1">Чеки, отчёты и выплаты — по закону</p>
              </div>
            </div>
          </div>
        </section>

        {/* Кому подходит */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Кому подходит</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {AUDIENCE.map((a) => (
              <div key={a.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 flex items-center justify-center mx-auto mb-3">
                  <Icon name={a.icon} size={22} className="text-cyan-200" />
                </div>
                <h3 className="font-bold mb-1">{a.title}</h3>
                <p className="text-white/60 text-sm">{a.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Контакт / CTA */}
        <section id="contact" className="text-center">
          <div className="rounded-2xl border border-white/10 bg-card/60 p-6 md:p-10">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">С чего начать?</h2>
            <p className="text-white/65 max-w-xl mx-auto mb-6">
              Школам — бесплатный пилот, подключение за минуту. Колледжам и учебным центрам, которым нужны свои платные курсы, — заявка на сотрудничество.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/podklyuchit-shkolu?src=for_schools_bottom"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black py-3.5 px-7 rounded-xl hover:scale-[1.02] transition-transform"
              >
                <Icon name="Rocket" size={18} /> Подключить школу бесплатно
              </Link>
              <Link
                to="/for-business"
                className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-7 rounded-xl transition-colors"
              >
                <Icon name="Send" size={18} /> Заявка на сотрудничество
              </Link>
            </div>
            <p className="text-white/40 text-sm mt-5">
              Или напишите нам — сайт <span className="text-white/70">учисьпро.рф</span>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-white/40 text-sm">
        УЧИСЬПРО · Образовательная платформа с ИИ · учисьпро.рф
      </footer>
    </div>
  );
}
