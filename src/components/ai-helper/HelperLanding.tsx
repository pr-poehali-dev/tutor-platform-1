import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { PlanLimits } from "./api";
import HelperChat from "./HelperChat";

interface Props {
  onStart: () => void;
  loading?: boolean;
  limits: Record<"free" | "pro", PlanLimits> | null;
  price: number;
}

const STEPS = [
  { icon: "LayoutTemplate", title: "Выберите шаблон", text: "Для клиентов, сотрудников, родителей или эксперта — роль и приветствие уже заполнены." },
  { icon: "BookOpen", title: "Вставьте свои знания", text: "Цены, услуги, регламенты, частые вопросы. Помощник отвечает только по ним и не выдумывает." },
  { icon: "Link", title: "Поделитесь ссылкой", text: "Отправьте клиентам, поставьте в профиль или кнопкой на сайт. Помощник работает 24/7." },
];

const CASES = [
  { icon: "Store", title: "Малый бизнес", text: "Отвечает на «сколько стоит» и «как записаться», пока вы работаете." },
  { icon: "Users", title: "Команда", text: "Новый сотрудник находит ответ в регламентах за секунды, а не через руководителя." },
  { icon: "School", title: "Школа и детский сад", text: "Расписание, питание, кружки и документы — родители получают ответ вечером и в выходные." },
  { icon: "GraduationCap", title: "Эксперт и репетитор", text: "Рассказывает о форматах и ценах, записывает на пробное занятие." },
];

/** Посадочная «Свой ИИ-помощник за вечер» для гостей. */
export default function HelperLanding({ onStart, loading, limits, price }: Props) {
  const free = limits?.free;
  const pro = limits?.pro;
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-6xl mx-auto px-4 pt-5">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Для взрослых", href: "/vzroslym" }, { label: "Свой ИИ-помощник" }]} />
      </div>
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-12 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-200 text-xs font-semibold mb-5">
          <Icon name="Sparkles" size={14} /> Без программирования · 10 минут
        </span>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
          Свой ИИ-помощник за вечер
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
          Отвечает вашим клиентам, сотрудникам или родителям по вашей базе знаний — круглосуточно, вежливо и без выдумок.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" onClick={onStart} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
            <Icon name="Sparkles" size={18} className="mr-2" /> Создать помощника бесплатно
          </Button>
          <a href="#how">
            <Button size="lg" variant="outline">Как это работает</Button>
          </a>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-4 pb-14">
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-200 flex items-center justify-center font-bold">{i + 1}</span>
                <Icon name={s.icon} size={20} className="text-violet-300" />
              </div>
              <p className="font-bold mb-1">{s.title}</p>
              <p className="text-white/60 text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-14">
        <h2 className="font-montserrat font-black text-2xl mb-2 text-center">Попробуйте прямо сейчас</h2>
        <p className="text-white/60 text-sm text-center mb-5">Это живой помощник, собранный в конструкторе. Спросите о ценах, тарифах или о том, чего нет в его базе.</p>
        <HelperChat slug="demo-uchispro" name="Ассистент УЧИСЬПРО" greeting="Здравствуйте! Я демо-помощник. Спросите, как создать своего ИИ-помощника, сколько это стоит и кому он подойдёт." color="#7c3aed" compact />
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-14">
        <h2 className="font-montserrat font-black text-2xl mb-5 text-center">Кому пригодится</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CASES.map((c) => (
            <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <Icon name={c.icon} size={22} className="text-cyan-300 mb-3" />
              <p className="font-bold mb-1">{c.title}</p>
              <p className="text-white/60 text-sm">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="font-montserrat font-black text-2xl mb-5 text-center">Тарифы</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-white/60 text-sm mb-1">Бесплатно</p>
            <p className="font-montserrat font-black text-3xl mb-4">0 ₽</p>
            <ul className="space-y-2 text-sm text-white/75">
              <Li>{free?.helpers ?? 1} помощник</Li>
              <Li>{(free?.answers_month ?? 100).toLocaleString("ru-RU")} ответов в месяц</Li>
              <Li>База знаний до {(free?.knowledge ?? 6000).toLocaleString("ru-RU")} символов</Li>
              <Li>Ссылка и кнопка для сайта</Li>
              <Li>Краткая статистика</Li>
            </ul>
          </div>
          <div className="rounded-2xl border border-violet-400/40 bg-violet-500/[0.08] p-6">
            <p className="text-violet-200 text-sm mb-1">PRO · 30 дней</p>
            <p className="font-montserrat font-black text-3xl mb-4">{price} ₽</p>
            <ul className="space-y-2 text-sm text-white/80">
              <Li>До {pro?.helpers ?? 5} помощников</Li>
              <Li>{(pro?.answers_month ?? 3000).toLocaleString("ru-RU")} ответов в месяц</Li>
              <Li>База знаний до {(pro?.knowledge ?? 40000).toLocaleString("ru-RU")} символов</Li>
              <Li>Полный отчёт: о чём спрашивают и на что помощник не нашёл ответа</Li>
              <Li>Последние диалоги с клиентами</Li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <Button size="lg" onClick={onStart} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
            Начать бесплатно
          </Button>
          <p className="text-white/45 text-xs mt-3">
            Помощник отвечает только по вашей базе знаний. <Link to="/legal/privacy" className="underline">Политика конфиденциальности</Link>
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Icon name="Check" size={16} className="text-emerald-300 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
