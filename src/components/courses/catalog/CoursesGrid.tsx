import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import CourseCardCompact from "@/components/courses/CourseCardCompact";
import { COURSES, Course } from "@/components/courses/coursesData";
import { SUBJECTS_SEO } from "@/components/courses/subjectsSeo";

interface CoursesGridProps {
  readyLoaded: boolean;
  readyIds: Set<number>;
  filtered: Course[];
  resetAll: () => void;
}

export default function CoursesGrid({ readyLoaded, readyIds, filtered, resetAll }: CoursesGridProps) {
  return (
    <>
      {/* Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16" aria-label="Результаты поиска курсов">
        {!readyLoaded ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center" role="status">
            <Icon name="Loader2" size={28} className="animate-spin text-purple-300 mx-auto mb-3" />
            <p className="text-white/55 text-sm">Загружаем актуальный каталог...</p>
          </div>
        ) : readyIds.size === 0 ? (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/[0.05] p-12 text-center" role="status">
            <div className="text-6xl mb-4" aria-hidden="true">🚀</div>
            <h3 className="font-montserrat font-black text-xl text-white mb-2">Курсы готовятся к запуску</h3>
            <p className="text-white/65 text-sm mb-5 max-w-md mx-auto">
              Сейчас наши методисты собирают финальные программы. Подпишись на уведомления — пришлём, как только первые курсы выйдут.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center" role="status">
            <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
            <h3 className="font-montserrat font-black text-xl text-white mb-2">Ничего не нашлось</h3>
            <p className="text-white/55 text-sm mb-5 max-w-md mx-auto">
              Попробуй другой поисковый запрос или сбрось фильтры.
            </p>
            <button
              onClick={resetAll}
              aria-label="Сбросить все фильтры"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              <Icon name="RefreshCw" size={14} aria-hidden="true" />
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 list-none p-0 m-0">
            {filtered.map((c) => (
              <li key={c.id}>
                <CourseCardCompact course={c} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* SEO-перелинковка: предметные лендинги */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16" aria-labelledby="subjects-heading">
        <article className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Предметные подборки</p>
          <h2 id="subjects-heading" className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-2">
            Курсы по предметам
          </h2>
          <p className="text-white/55 text-sm md:text-base text-center max-w-2xl mx-auto mb-8">
            Подробные страницы по каждому предмету: программа, темы, FAQ, подготовка к ЕГЭ и ОГЭ.
          </p>
          <nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" aria-label="Каталог предметов">
            {SUBJECTS_SEO.map((s) => (
              <Link
                key={s.slug}
                to={`/courses/${s.slug}`}
                aria-label={`Открыть страницу предмета: ${s.name}`}
                className="group relative bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:translate-y-[-2px] transition-all"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={s.ogImage}
                    alt={`${s.name} — курсы УЧИСЬПРО`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden="true" />
                  <div className={`absolute top-2 right-2 w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg shadow-lg`} aria-hidden="true">
                    {s.emoji}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-montserrat font-black text-white text-sm leading-tight mb-0.5 drop-shadow-lg">{s.name}</p>
                    <p className="text-white/70 text-[10px] font-medium">
                      {COURSES.filter((c) => c.subject === s.subjectId).length} курсов
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </nav>
        </article>
      </section>
    </>
  );
}
