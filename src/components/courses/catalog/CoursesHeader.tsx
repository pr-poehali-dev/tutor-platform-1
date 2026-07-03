import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { COURSES } from "@/components/courses/coursesData";

export default function CoursesHeader() {
  return (
    <>
      {/* Header bar */}
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" aria-label="Шапка сайта">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="На главную УЧИСЬПРО">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог курсов" }]} />
          </div>
          <Link
            to="/super-courses"
            aria-label="Супер-курсы"
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="Sparkles" size={14} aria-hidden="true" />
            Супер-курсы
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-4" aria-labelledby="courses-hero-title">
        <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-5 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          На главную
        </Link>

        <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-3.5 py-1 mb-4">
          <Icon name="Library" size={13} className="text-purple-300" />
          <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Каталог · {COURSES.length} курсов</span>
        </div>
        <h1 id="courses-hero-title" className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Все курсы <span className="gradient-text-purple">УЧИСЬПРО</span>
        </h1>
        <p className="text-white/55 text-base md:text-lg max-w-2xl">
          Школьная программа 1–11 классов и подготовка к ОГЭ/ЕГЭ. Найди свой курс — поиском, по предмету или классу.
        </p>
      </section>

      {/* Супер-курсы — флагманские программы с наставником и голосом */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 mt-2 mb-2">
        <Link
          to="/super-courses"
          className="group block rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/12 via-purple-500/10 to-transparent p-5 md:p-6 hover:border-cyan-400/50 transition-all"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="Sparkles" size={24} className="text-cyan-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/25 text-cyan-200 uppercase tracking-wider">Новинка</span>
                <span className="text-white/40 text-xs">⚡ Физика · 📐 Математика · 💻 Информатика</span>
              </div>
              <h2 className="font-montserrat font-black text-lg md:text-xl text-white">
                Супер-курсы уровня репетитора — с наставником и голосом
              </h2>
              <p className="text-white/55 text-sm mt-0.5">
                Полная школьная программа + профильный ЕГЭ и ДВИ. Первый урок бесплатно.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl flex-shrink-0 group-hover:opacity-90 transition-opacity">
              Открыть
              <Icon name="ArrowRight" size={15} />
            </span>
          </div>
        </Link>
      </section>
    </>
  );
}