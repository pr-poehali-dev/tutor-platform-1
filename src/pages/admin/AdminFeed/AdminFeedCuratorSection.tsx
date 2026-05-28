import Icon from "@/components/ui/icon";
import { SourceInfo } from "@/components/feed/api";
import { CATEGORY_META } from "@/components/feed/types";
import { dt } from "./dt";

interface AdminFeedCuratorSectionProps {
  sources: SourceInfo[];
  loadingSources: boolean;
  running: string | null;
  log: string[];
  handleFetchAll: () => Promise<void>;
  handleAutoModerate: () => Promise<void>;
  handleFetchOne: (code: string) => Promise<void>;
}

export default function AdminFeedCuratorSection({
  sources, loadingSources, running, log,
  handleFetchAll, handleAutoModerate, handleFetchOne,
}: AdminFeedCuratorSectionProps) {
  return (
    <section className="bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 rounded-3xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Bot" size={16} className="text-cyan-300" />
            <span className="text-cyan-300 text-[11px] uppercase tracking-wider font-bold">ИИ-куратор</span>
          </div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-2xl">Менеджер модуля «Лента»</h2>
          <p className="text-white/65 text-sm mt-1 max-w-2xl">
            Парсит RSS-ленты выбранных источников, рерайтит тексты через ИИ под формат «Хочу всё знать» и публикует в общую ленту.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleFetchAll}
            disabled={!!running}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {running ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Sparkles" size={14} />}
            Обход источников
          </button>
          <button
            onClick={handleAutoModerate}
            disabled={!!running}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-black text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {running ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="ShieldCheck" size={14} />}
            Автомодерация pending
          </button>
        </div>
      </div>

      {/* Информация об автозапуске */}
      <div className="bg-black/20 border border-white/10 rounded-xl p-3 mb-3 flex items-start gap-2 flex-wrap">
        <Icon name="Clock" size={14} className="text-cyan-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 text-xs">
          <p className="text-white font-bold mb-0.5">Автоматический запуск раз в 6 часов</p>
          <p className="text-white/55">
            Cron (по расписанию <code className="text-cyan-300">0 */6 * * *</code>) запускает обход источников + автомодерацию ожидающих статей пользователей. Ничего нажимать не нужно.
          </p>
        </div>
      </div>

      {running && (
        <div className="bg-white/[0.05] border border-white/10 rounded-xl p-3 mb-3 text-cyan-200 text-xs flex items-center gap-2">
          <Icon name="Loader2" size={14} className="animate-spin" />
          {running}
        </div>
      )}

      {/* Сводка по странам */}
      {!loadingSources && sources.length > 0 && (() => {
        const byCountry: Record<string, { count: number; flag: string; priority: number }> = {};
        for (const s of sources) {
          const c = s.country || "Прочее";
          if (!byCountry[c]) {
            byCountry[c] = { count: 0, flag: s.country_flag || "🌐", priority: s.priority || 0 };
          }
          byCountry[c].count++;
        }
        const ordered = Object.entries(byCountry)
          .sort((a, b) => b[1].priority - a[1].priority);
        return (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ordered.map(([country, info]) => (
              <span
                key={country}
                className="inline-flex items-center gap-1 bg-white/[0.05] border border-white/10 text-white/85 text-[11px] font-bold px-2 py-1 rounded-lg"
                title={`Приоритет обхода: ${info.priority}`}
              >
                <span>{info.flag}</span>
                {country}
                <span className="text-white/45">· {info.count}</span>
              </span>
            ))}
          </div>
        );
      })()}

      {/* Источники */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {loadingSources ? (
          <p className="text-white/45 text-sm col-span-full text-center py-4">Загружаю источники...</p>
        ) : sources.length === 0 ? (
          <p className="text-white/45 text-sm col-span-full text-center py-4">Нет настроенных источников. Проверь админский ключ.</p>
        ) : sources.map((s) => {
          const meta = CATEGORY_META[s.category];
          const isPriority = (s.priority || 0) >= 250; // Китай и РФ
          return (
            <div
              key={s.code}
              className={`border rounded-2xl p-3 ${
                isPriority
                  ? "bg-gradient-to-br from-amber-500/[0.08] to-rose-500/[0.05] border-amber-500/30"
                  : "bg-white/[0.04] border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-base" title={s.country || ""}>{s.country_flag || "🌐"}</span>
                    <span className="text-sm">{meta?.emoji}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${meta?.tone.split(" ")[0] || "text-white"}`}>{meta?.label}</span>
                    {s.language && s.language !== "ru" && (
                      <span className="inline-flex items-center gap-0.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                        <Icon name="Languages" size={9} />
                        перевод
                      </span>
                    )}
                    {isPriority && (
                      <span className="inline-flex items-center gap-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                        <Icon name="Crown" size={9} />
                        приоритет
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-white text-sm leading-tight truncate">{s.name}</p>
                  <p className="text-white/45 text-[10px] truncate">{s.code}</p>
                </div>
                <button
                  onClick={() => handleFetchOne(s.code)}
                  disabled={!!running}
                  className="bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-100 text-xs font-bold px-2.5 py-1 rounded-lg disabled:opacity-50 flex-shrink-0"
                >
                  <Icon name="Play" size={11} />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/45">
                <span>Обновлено: {dt(s.last_fetched_at)}</span>
                {s.last_fetch_count !== null && (
                  <span className="text-emerald-300 font-bold">+{s.last_fetch_count}</span>
                )}
              </div>
              {s.last_error && (
                <p className="text-rose-300 text-[10px] mt-1 truncate" title={s.last_error}>
                  ⚠ {s.last_error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Лог */}
      {log.length > 0 && (
        <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto">
          <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1">Лог операций</p>
          <div className="space-y-0.5 font-mono text-[11px]">
            {log.map((line, i) => (
              <div key={i} className={
                line.startsWith("✓") ? "text-emerald-300" :
                line.startsWith("✗") ? "text-rose-300" :
                line.startsWith("⏳") ? "text-cyan-300" :
                "text-white/65"
              }>{line}</div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
