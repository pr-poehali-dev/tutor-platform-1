import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

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
        title="Сотрудничество для школ, колледжей и техникумов — УЧИСЬПРО"
        description="Запустите онлайн-обучение под своим брендом с ИИ-преподавателем 24/7. Без абонплаты — только процент с продаж. Приём оплат, аналитика и помощь с грантами включены."
        canonical={`${SITE_URL}/for-schools`}
      />

      {/* Шапка */}
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎓</div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <a href="#contact" className="text-sm font-bold text-violet-200 hover:text-white transition-colors">Связаться</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-12">
        {/* Hero */}
        <section className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
            <Icon name="Handshake" size={13} className="text-violet-300" />
            <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">Партнёрам</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            Онлайн-обучение под вашим брендом{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">с ИИ-преподавателем</span>
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto mb-6">
            Помогаем онлайн-школам, колледжам и техникумам запускать курсы и зарабатывать на них.
            Без абонплаты — вы платите только процент с реальных продаж.
          </p>
          <a href="#contact">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 px-7 rounded-xl hover:scale-[1.02] transition-transform">
              <Icon name="Sparkles" size={18} /> Обсудить сотрудничество
            </span>
          </a>
        </section>

        {/* Возможности */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Что получает ваше заведение</h2>
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
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Покажем платформу за 15 минут</h2>
            <p className="text-white/65 max-w-xl mx-auto mb-6">
              Проведём короткую бесплатную презентацию и предложим условия под ваши задачи. Оставьте заявку — мы свяжемся.
            </p>
            <Link to="/for-business">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 px-7 rounded-xl hover:scale-[1.02] transition-transform">
                <Icon name="Send" size={18} /> Оставить заявку
              </span>
            </Link>
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
