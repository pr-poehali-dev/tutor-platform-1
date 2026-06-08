import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import InstallButton from "@/components/pwa/InstallButton";

const SITE_URL = "https://учисьпро.рф";
const APP_ICON = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/565c75c2-6b6a-4efd-99f6-86ab094c6cb4.jpg";

const BENEFITS = [
  { icon: "Zap", title: "Быстрее сайта", text: "Открывается мгновенно с иконки на экране — без браузера и адресной строки." },
  { icon: "WifiOff", title: "Работает офлайн", text: "Изученные материалы доступны даже без интернета — учись в дороге." },
  { icon: "Bell", title: "Напоминания", text: "Не пропустишь занятие и streak — приложение всегда под рукой." },
  { icon: "ShieldCheck", title: "Безопасно", text: "Никаких магазинов и .apk. Установка прямо с сайта в один тап." },
];

const PLATFORMS = [
  {
    os: "Android",
    icon: "Smartphone",
    color: "from-green-500 to-emerald-600",
    steps: [
      "Нажми «Установить приложение» выше",
      "Подтверди установку во всплывающем окне",
      "Иконка УЧИСЬПРО появится на рабочем столе",
    ],
  },
  {
    os: "iPhone / iPad",
    icon: "Apple",
    color: "from-slate-400 to-slate-600",
    steps: [
      "Открой сайт в Safari",
      "Нажми кнопку «Поделиться» внизу экрана",
      "Выбери «На экран «Домой»» → «Добавить»",
    ],
  },
  {
    os: "Компьютер",
    icon: "Monitor",
    color: "from-purple-500 to-blue-600",
    steps: [
      "Открой сайт в Chrome, Edge или Яндекс.Браузере",
      "Нажми значок установки в адресной строке (или меню ⋮)",
      "Приложение откроется в отдельном окне",
    ],
  },
];

export default function AppDownload() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title="Скачать приложение УЧИСЬПРО — ИИ-репетитор на телефон и компьютер"
        description="Установи приложение УЧИСЬПРО на iPhone, Android или компьютер в один тап. Работает офлайн, открывается с иконки, быстрее сайта. Без магазинов и .apk — прямо из браузера."
        canonical={`${SITE_URL}/app`}
        image={APP_ICON}
        keywords="скачать приложение учисьпро, приложение ии репетитор, установить на телефон, pwa, учисьпро на айфон, учисьпро на андроид"
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Приложение" }]} />

        {/* HERO */}
        <section className="text-center pt-8 pb-12">
          <div className="relative inline-block mb-6">
            <img
              src={APP_ICON}
              alt="Иконка приложения УЧИСЬПРО"
              className="w-28 h-28 rounded-[28px] shadow-2xl shadow-purple-500/30 border border-white/15"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-4 border-background">
              <Icon name="Check" size={16} className="text-white" />
            </div>
          </div>

          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            Приложение <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">УЧИСЬПРО</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto mb-8">
            Установи ИИ-репетитора на телефон или компьютер. Работает офлайн,
            открывается с иконки, быстрее сайта. Без магазинов — в один тап.
          </p>

          <InstallButton />

          <p className="text-white/40 text-xs mt-4">
            Бесплатно · Без рекламы · Занимает меньше 1 МБ
          </p>
        </section>

        {/* BENEFITS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-center">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                <Icon name={b.icon} size={20} className="text-cyan-300" />
              </div>
              <p className="font-bold text-sm mb-1">{b.title}</p>
              <p className="text-white/55 text-xs leading-relaxed">{b.text}</p>
            </div>
          ))}
        </section>

        {/* PLATFORM INSTRUCTIONS */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl text-center mb-8">
            Как установить на любое устройство
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PLATFORMS.map((p) => (
              <div key={p.os} className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
                  <Icon name={p.icon} size={24} className="text-white" fallback="Smartphone" />
                </div>
                <p className="font-bold text-lg mb-3">{p.os}</p>
                <ol className="space-y-2.5">
                  {p.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
                      <span className="w-5 h-5 rounded-md bg-purple-500/25 text-purple-200 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border border-white/10 rounded-3xl p-8 mb-10">
          <h2 className="font-montserrat font-black text-2xl mb-3">Готов учиться где угодно?</h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Установи приложение и занимайся с ИИ-репетитором в любое время — даже без интернета.
          </p>
          <InstallButton />
          <div className="mt-6">
            <Link to="/" className="text-cyan-300 hover:text-cyan-200 text-sm inline-flex items-center gap-1.5 transition-colors">
              <Icon name="ArrowLeft" size={14} /> Вернуться на главную
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}