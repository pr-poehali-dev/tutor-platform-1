import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

export function WritingTopBar() {
  return (
    <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-lg">
            ✍️
          </div>
          <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
        </Link>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Мастерская сочинений" }]} />
      </div>
    </div>
  );
}

export default function WritingHero() {
  return (
    <div className="bg-gradient-to-br from-amber-900/30 via-rose-900/20 to-purple-900/30 border border-amber-500/25 rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 rounded-full px-3 py-1 mb-4">
          <Icon name="Feather" size={12} className="text-amber-300" />
          <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">
            Авторский курс · 8 модулей · 64 урока
          </span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3 leading-tight">
          Мастерская <span className="gradient-text-purple">слова</span>:
          <br className="hidden md:block" /> сочинение, эссе, журналистика
        </h1>
        <p className="text-white/80 text-base md:text-lg mb-6 max-w-3xl">
          Пишем как в «Коммерсанте», «Новом мире» и «Медузе». От итогового сочинения и сочинения ЕГЭ
          на 25 баллов до репортажа, очерка и колонки. Готовим на журфак МГУ, ВШЭ, СПбГУ.
        </p>
        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="Sparkles" size={16} />
            Выбрать курс — первый урок бесплатно
          </Link>
          <a
            href="#program"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-bold text-sm px-5 py-3 rounded-xl"
          >
            <Icon name="ListChecks" size={16} />
            Программа курса
          </a>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Icon name="Trophy" size={16} className="text-amber-300" />
            <span className="text-white/85">
              <b>96+ баллов</b> ЕГЭ по русскому
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="GraduationCap" size={16} className="text-rose-300" />
            <span className="text-white/85">
              <b>Журфак МГУ, ВШЭ, СПбГУ</b>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="BookOpen" size={16} className="text-purple-300" />
            <span className="text-white/85">
              <b>12 опубликованных работ</b> в портфолио
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}