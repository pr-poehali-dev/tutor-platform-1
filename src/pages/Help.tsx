import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

interface FaqItem {
  q: string;
  a: string;
  cat: string;
}

const FAQ: FaqItem[] = [
  // Подписка
  { cat: "Подписка", q: "Сколько стоит подписка?",
    a: "Тарифы и текущие цены — на странице /pricing. Можно оформить помесячно или сразу на год со скидкой. Есть бесплатный пробный период — попробуй платформу без оплаты." },
  { cat: "Подписка", q: "Как оплатить?",
    a: "Оплата проходит через ЮKassa: банковская карта (Мир, Visa, Mastercard), СБП, ЮMoney. Чек сразу приходит на email. Подписка активируется в течение минуты." },
  { cat: "Подписка", q: "Можно ли вернуть деньги?",
    a: "Да. В течение 14 дней с момента оплаты можно вернуть полную стоимость, если не нравится. Напиши в обратную связь — /contacts." },
  { cat: "Подписка", q: "Как отменить подписку?",
    a: "В личном кабинете /cabinet — раздел «Подписка» → «Отменить». Доступ сохранится до конца оплаченного периода." },

  // Учёба
  { cat: "Учёба", q: "Как заниматься с ИИ-репетитором?",
    a: "Открой курс, выбери тему, нажми «Начать урок». ИИ объяснит материал, ответит на вопросы голосом или текстом, проверит задания. Заниматься можно 24/7 — не нужно записываться заранее." },
  { cat: "Учёба", q: "Как готовиться к ЕГЭ или ОГЭ?",
    a: "Зайди в /exam-bank — там разобранные задания по всем предметам. Также есть чек-лист «До ЕГЭ» (/exam-checklist) с пошаговым планом подготовки и обратным отсчётом." },
  { cat: "Учёба", q: "Что такое «Познай себя»?",
    a: "Это профориентационный тест. После 30 минут вопросов ИИ даст 3-5 подходящих профессий, ссылки на вузы и план развития. Бесплатно для всех — /know-yourself." },
  { cat: "Учёба", q: "Подходит ли платформа для маленьких детей?",
    a: "Да, есть модуль «Малыш 1+» с развивающими занятиями для дошкольников. Безопасный контент, родительский контроль времени." },

  // Лента и публикации
  { cat: "Лента", q: "Можно ли публиковать свои статьи?",
    a: "Да! Зарегистрируйся, открой /feed/submit, напиши статью о науке, культуре, ИИ или конкурсах. После модерации (обычно 24 часа) она появится в общей ленте." },
  { cat: "Лента", q: "Откуда новости в ленте?",
    a: "ИИ-куратор собирает материалы из 45+ источников по всему миру (приоритет — Россия и Китай), переводит на русский и адаптирует для школьников в стиле «Хочу всё знать». Обновление раз в 6 часов." },

  // Безопасность
  { cat: "Безопасность", q: "Как защищены мои данные?",
    a: "Все данные шифруются. Платежи проходят через сертифицированную ЮKassa — мы не храним номера карт. Подробнее — в /privacy." },
  { cat: "Безопасность", q: "Есть ли родительский контроль?",
    a: "Да, в /parent можно привязать ребёнка, видеть его активность, время за экраном и прогресс. Для дошкольников — лимит экранного времени." },

  // Технические
  { cat: "Технические", q: "Можно ли установить как приложение?",
    a: "Да, УЧИСЬПРО — это PWA: открой сайт в Chrome/Safari, в меню браузера нажми «Установить приложение» или «Добавить на главный экран». Будет работать как обычное приложение." },
  { cat: "Технические", q: "Поддерживается ли голосовой ввод?",
    a: "Да, ИИ-репетитор понимает голосовые сообщения и отвечает голосом (Yandex SpeechKit). Удобно для младших классов и тренировки английского." },
  { cat: "Технические", q: "Что делать, если что-то не работает?",
    a: "Сначала обнови страницу (Ctrl+F5). Если не помогло — напиши в /contacts с описанием проблемы. Отвечаем в течение 24 часов." },
];

const CATEGORIES = Array.from(new Set(FAQ.map((f) => f.cat)));

export default function Help() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [activeCat, setActiveCat] = useState<string | "all">("all");

  const filtered = activeCat === "all" ? FAQ : FAQ.filter((f) => f.cat === activeCat);

  const jsonLd = [{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Центр помощи и FAQ · УЧИСЬПРО"
        description="Ответы на частые вопросы: подписка, оплата, ИИ-репетитор, подготовка к ЕГЭ, безопасность, родительский контроль."
        canonical={`${SITE_URL}/help`}
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-lg">💡</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Помощь" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <section className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 rounded-full px-4 py-1.5 mb-3">
            <Icon name="HelpCircle" size={12} className="text-emerald-300" />
            <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Центр помощи</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3">
            Чем тебе <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">помочь?</span>
          </h1>
          <p className="text-white/70 text-base">Частые вопросы. Если не нашёл ответ — напиши в обратную связь.</p>
        </section>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setActiveCat("all")}
            className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
              activeCat === "all" ? "bg-white text-background" : "bg-white/8 text-white/70 hover:bg-white/15"
            }`}
          >Все · {FAQ.length}</button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                activeCat === c ? "bg-white text-background" : "bg-white/8 text-white/70 hover:bg-white/15"
              }`}
            >{c} · {FAQ.filter((f) => f.cat === c).length}</button>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-2 mb-8">
          {filtered.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={`${item.cat}-${idx}`} className="bg-card/60 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span className="font-bold text-white text-sm md:text-base">{item.q}</span>
                  <Icon name="ChevronDown" size={16} className={`text-white/55 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-white/75 text-sm leading-relaxed">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Не нашёл ответ */}
        <section className="bg-gradient-to-br from-purple-500/15 to-cyan-500/15 border border-purple-500/30 rounded-3xl p-6 text-center">
          <div className="text-4xl mb-2">💬</div>
          <h2 className="font-montserrat font-black text-white text-xl mb-2">Не нашёл ответ?</h2>
          <p className="text-white/65 text-sm mb-4">Напиши нам — ответим в течение 24 часов.</p>
          <Link
            to="/contacts"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="Mail" size={14} />
            Написать в поддержку
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
