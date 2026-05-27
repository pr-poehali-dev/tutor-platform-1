import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { UNIVERSITIES, University } from "./graduateData";

interface Props {
  /** Выбор вуза из выдачи — сразу прыгаем на шаг "Факультет". */
  onPick: (university: University) => void;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е").replace(/[.,«»"'()-]/g, "").trim();
}

/**
 * Быстрый поиск по 100 вузам.
 * Ищем по сокращению, полному названию и городу.
 */
export default function UniversitySearch({ onPick }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q || q.length < 2) return [] as University[];
    return UNIVERSITIES.filter((u) => {
      const hay = normalize(`${u.shortName} ${u.fullName} ${u.city}`);
      return hay.includes(q);
    }).slice(0, 8);
  }, [query]);

  return (
    <div className="bg-card border border-white/10 rounded-3xl p-4 md:p-5 mb-8">
      <label className="flex items-center gap-2 mb-2">
        <Icon name="Search" size={14} className="text-purple-300" />
        <span className="text-purple-300 text-[11px] uppercase tracking-wider font-bold">Быстрый поиск</span>
      </label>
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Например: МГУ, ВШЭ, Бауман, медицинский, Казань…"
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-white placeholder-white/35 text-sm md:text-base focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Очистить"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            <Icon name="X" size={14} />
          </button>
        )}
      </div>

      {query.length >= 2 && (
        <div className="mt-3">
          {results.length === 0 ? (
            <p className="text-white/55 text-xs px-2 py-3">
              Ничего не нашли. Попробуй сокращение (МГУ, ВШЭ) или город.
            </p>
          ) : (
            <div className="space-y-1.5">
              {results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setQuery("");
                    onPick(u);
                  }}
                  className="w-full flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/8 hover:border-purple-500/30 rounded-xl px-3 py-2.5 text-left transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${u.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {u.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-montserrat font-bold text-white text-sm leading-tight">{u.shortName}</p>
                      {u.isMilitary && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/35 text-emerald-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                          <Icon name="Shield" size={8} />
                          Военный
                        </span>
                      )}
                    </div>
                    <p className="text-white/45 text-[11px] flex items-center gap-1 mt-0.5">
                      <Icon name="MapPin" size={9} />
                      {u.city} · {u.faculties.length} направлений
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-white/35 flex-shrink-0" />
                </button>
              ))}
              <p className="text-white/35 text-[10px] text-center pt-1">
                {results.length === 8 ? "Показаны первые 8 — уточни запрос для других" : `Найдено: ${results.length}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
