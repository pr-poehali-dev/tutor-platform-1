import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import DirLayout from "@/components/schools/DirLayout";
import { SITE_URL } from "@/components/schools/api";

const STEPS = [
  { icon: "Search", title: "Найдите свою школу", text: "В справочнике уже есть страницы 12 000 школ по данным реестра Рособрнадзора." },
  { icon: "PenLine", title: "Заполните анкету — 5 минут", text: "Достижения, методики, профильные классы. По ссылке из нашего письма — без регистрации." },
  { icon: "ShieldCheck", title: "Мы проверим", text: "Сверим сведения с сайтом школы и опубликуем в течение 2 рабочих дней." },
  { icon: "TrendingUp", title: "Школа поднимется", text: "Отметка «Сведения подтверждены школой» и более высокое место в справочнике города." },
];

const BENEFITS = [
  { icon: "Users", title: "Родители увидят сильные стороны", text: "При выборе школы родители ищут не адрес, а то, чем школа сильна. Страница с достижениями отвечает на этот вопрос." },
  { icon: "Lightbulb", title: "Коллеги узнают о ваших методиках", text: "Лучшие практики мы расскажем в нашей ленте для учителей и руководителей — с указанием школы и авторов." },
  { icon: "Globe", title: "Видимость в поиске", text: "Страницы справочника открыты для Яндекса и Google: по запросам «лучшие школы города» и названию школы." },
  { icon: "BadgeCheck", title: "Бесплатно и без обязательств", text: "Публикуем только то, что прислала школа, и только с её согласия. Страницу можно скрыть по запросу." },
];

export default function SchoolsForSchools() {
  return (
    <DirLayout crumbs={[{ label: "Главная", href: "/" }, { label: "Справочник школ", href: "/shkoly" }, { label: "Школам" }]}>
      <Seo
        title="Школам: расскажите о достижениях в справочнике УЧИСЬПРО"
        description="Бесплатная страница школы в справочнике УЧИСЬПРО: достижения, методики, профильные классы. Отметка «Сведения подтверждены школой» и место в рейтинге города."
        canonical={`${SITE_URL}/shkoly/dlya-shkol`}
      />

      <section className="mb-10 mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
          Расскажите <span className="gradient-text-purple">о своей школе</span>
        </h1>
        <p className="mt-4 text-base text-white/70 sm:text-lg">
          В справочнике УЧИСЬПРО уже есть страница вашей школы — с адресом и контактами из официального реестра. Добавьте то, что отличает
          вас от других: достижения учеников и авторские методики учителей.
        </p>
      </section>

      <section className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-sm font-bold text-primary">{i + 1}</span>
              <Icon name={s.icon} size={18} className="text-white/60" />
            </div>
            <p className="mt-3 font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-white/60">{s.text}</p>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold">Что это даёт школе</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <Icon name={b.icon} size={22} className="mt-0.5 shrink-0 text-emerald-300" />
              <div>
                <p className="font-semibold">{b.title}</p>
                <p className="mt-1 text-sm text-white/65">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold">С чего начать</h2>
        <p className="mt-2 max-w-2xl text-white/70">
          Найдите школу в справочнике и нажмите «Я представляю эту школу». Если вы получили наше письмо — заполните анкету по ссылке из него: так
          проверка пройдёт быстрее.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/shkoly" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90">
            Найти свою школу
          </Link>
          <Link to="/for-schools" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10">
            УЧИСЬПРО для учеников школы
          </Link>
        </div>
      </section>
    </DirLayout>
  );
}
