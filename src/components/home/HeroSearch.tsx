import SearchBar from "@/components/search/SearchBar";
import Icon from "@/components/ui/icon";

/** Большая поисковая строка под главным hero. */
export default function HeroSearch() {
  return (
    <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 -mt-2 mb-8 md:mb-12">
      <div className="bg-gradient-to-br from-fuchsia-500/[0.08] via-purple-500/[0.05] to-cyan-500/[0.08] border border-white/10 rounded-3xl p-4 md:p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-fuchsia-500/15 border border-fuchsia-500/35 text-fuchsia-200 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
            <Icon name="Search" size={10} />
            Поиск по сайту
          </span>
          <span className="text-white/55 text-xs">Курсы, темы, статьи, новости — всё в одном месте</span>
        </div>
        <SearchBar variant="hero" placeholder="Например: ЕГЭ математика, профориентация, новости ИИ…" />
      </div>
    </section>
  );
}
