import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { fetchSuggest, SearchItem } from "./api";

interface Props {
  /** Стиль: hero — большой блок на главной, navbar — компактный. */
  variant?: "hero" | "navbar";
  placeholder?: string;
  autoFocus?: boolean;
}

const RECENT_KEY = "uchispro_search_recent_v1";
const POPULAR_QUERIES = [
  "ЕГЭ математика",
  "Физика 9 класс",
  "Курсы химии",
  "Чек-лист до ЕГЭ",
  "Профориентация",
  "Новости ИИ",
];

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw).slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  try {
    const list = loadRecent().filter((x) => x !== q);
    list.unshift(q);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
  } catch { /* noop */ }
}

export default function SearchBar({
  variant = "hero",
  placeholder = "Найди курс, тему, статью…",
  autoFocus = false,
}: Props) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Загружаем недавние при монтировании
  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  // Debounced suggest
  useEffect(() => {
    if (q.trim().length < 2) {
      setItems([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetchSuggest(q, 7);
      setItems(res);
      setActiveIdx(-1);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  // Клик вне — закрыть
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Hotkey: Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const goToResults = (query: string) => {
    const v = query.trim();
    if (v.length < 2) return;
    saveRecent(v);
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(v)}`);
  };

  const goToItem = (it: SearchItem) => {
    saveRecent(q);
    setOpen(false);
    navigate(it.url);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        goToItem(items[activeIdx]);
      } else {
        goToResults(q);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(-1, i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showRecentBlock = open && q.trim().length < 2;
  const showSuggestions = open && items.length > 0 && q.trim().length >= 2;
  const showEmpty = open && q.trim().length >= 2 && items.length === 0 && !loading;

  // ─── СТИЛИ ───
  const inputStyle = variant === "hero"
    ? "h-14 md:h-16 text-base md:text-lg pl-14 pr-28 rounded-2xl bg-white/[0.06] border-2 border-white/15 focus:border-cyan-400/60 placeholder-white/40 font-medium"
    : "h-10 text-sm pl-10 pr-16 rounded-xl bg-white/[0.05] border border-white/12 focus:border-cyan-400/60 placeholder-white/40";

  const iconSize = variant === "hero" ? 22 : 16;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Icon
          name="Search"
          size={iconSize}
          className={`absolute top-1/2 -translate-y-1/2 text-white/50 pointer-events-none ${
            variant === "hero" ? "left-5" : "left-3"
          }`}
        />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Поиск по сайту"
          className={`w-full text-white focus:outline-none transition-colors ${inputStyle}`}
        />
        {/* Hotkey hint / loader */}
        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${
          variant === "hero" ? "right-3" : "right-2"
        }`}>
          {loading ? (
            <Icon name="Loader2" size={variant === "hero" ? 18 : 14} className="text-white/40 animate-spin" />
          ) : (
            <kbd className={`hidden sm:inline-flex items-center gap-0.5 bg-white/8 border border-white/15 text-white/55 font-bold rounded ${
              variant === "hero" ? "text-[11px] px-1.5 py-0.5" : "text-[10px] px-1 py-0.5"
            }`}>
              <Icon name="Command" size={10} />
              K
            </kbd>
          )}
          {q && (
            <button
              onClick={() => goToResults(q)}
              className={`ml-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold rounded-lg hover:scale-[1.03] transition-transform ${
                variant === "hero" ? "px-3 py-2 text-sm" : "px-2.5 py-1 text-xs"
              }`}
            >
              Найти
            </button>
          )}
        </div>
      </div>

      {/* ─── Выпадашка ─── */}
      {(showRecentBlock || showSuggestions || showEmpty) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {showRecentBlock && (
            <div className="p-3">
              {recent.length > 0 && (
                <>
                  <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-2 px-2 flex items-center gap-1">
                    <Icon name="History" size={10} /> Недавние запросы
                  </p>
                  <div className="space-y-0.5 mb-3">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => { setQ(r); goToResults(r); }}
                        className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.06] text-white/85 text-sm transition-colors"
                      >
                        <Icon name="History" size={12} className="text-white/35" />
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-2 px-2 flex items-center gap-1">
                <Icon name="TrendingUp" size={10} /> Популярные запросы
              </p>
              <div className="flex flex-wrap gap-1.5 px-2">
                {POPULAR_QUERIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setQ(p); goToResults(p); }}
                    className="inline-flex items-center gap-1 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/85 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="max-h-[60vh] overflow-y-auto">
              <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold px-3 pt-3 pb-1 flex items-center gap-1">
                <Icon name="Sparkles" size={10} /> Результаты
              </p>
              <div className="space-y-0.5 p-2">
                {items.map((it, idx) => (
                  <button
                    key={`${it.kind}-${it.url}-${idx}`}
                    onClick={() => goToItem(it)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full text-left flex items-start gap-3 px-2.5 py-2 rounded-xl transition-colors ${
                      activeIdx === idx ? "bg-white/[0.1]" : "hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="text-xl flex-shrink-0 mt-0.5">{it.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-sm leading-tight truncate">{it.title}</p>
                      {it.subtitle && (
                        <p className="text-white/55 text-xs leading-snug truncate">{it.subtitle}</p>
                      )}
                      <p className="text-white/35 text-[10px] mt-0.5 truncate">{it.category}</p>
                    </div>
                    <Icon name="ArrowUpRight" size={12} className="text-white/35 flex-shrink-0 mt-1" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToResults(q)}
                className="w-full flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-cyan-200 text-xs font-bold py-2.5 border-t border-white/10 transition-colors"
              >
                Все результаты по «{q}»
                <Icon name="ArrowRight" size={11} />
              </button>
            </div>
          )}

          {showEmpty && (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2 opacity-50">🔎</div>
              <p className="text-white/65 text-sm mb-2">Ничего не найдено по «{q}»</p>
              <p className="text-white/40 text-xs">Попробуй другие слова или открой все результаты</p>
              <button
                onClick={() => goToResults(q)}
                className="mt-3 inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Перейти к поиску
                <Icon name="ArrowRight" size={11} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
