import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { fetchLatestFromCloud, CloudResult } from "@/components/knowYourself/scoring";
import { RIASEC_LABELS, RiasecCode } from "@/components/knowYourself/types";

/**
 * Виджет «Моя профориентация» — показывает в ЛК последний результат теста
 * «Познай себя» (если пользователь его проходил) или приглашение пройти.
 */
export default function KnowYourselfWidget() {
  const [data, setData] = useState<CloudResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestFromCloud()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/8 to-blue-500/5 p-5 md:p-6 mb-6 flex items-center gap-3">
        <Icon name="Loader2" size={20} className="animate-spin text-cyan-300" />
        <p className="text-white/55 text-sm">Загружаю твой профориентационный профиль...</p>
      </div>
    );
  }

  // Пользователь ещё не проходил тест
  if (!data) {
    return (
      <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/12 to-blue-500/8 p-5 md:p-7 mb-6">
        <div className="flex items-start gap-4 mb-4 flex-wrap">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
            🪞
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-montserrat font-black text-white text-lg md:text-xl mb-1">Познай себя</h3>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed">
              Пройди подробный тест на 61 вопрос и узнай, какие профессии и вузы тебе подходят.
              Результат сохранится здесь.
            </p>
          </div>
        </div>
        <Link
          to="/know-yourself"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-cyan-500/25"
        >
          <Icon name="Sparkles" size={14} />
          Начать тест
          <Icon name="ArrowRight" size={14} />
        </Link>
      </div>
    );
  }

  // Есть сохранённый результат
  const result = data.result;
  const topRiasec = (result?.topRiasec || []) as RiasecCode[];
  const topRiasecLabels = topRiasec.map((c) => RIASEC_LABELS[c]).filter(Boolean);
  const topProfs = (result?.professions || []).slice(0, 3);

  const created = data.created_at ? new Date(data.created_at) : null;
  const createdStr = created
    ? created.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-indigo-900/25 p-5 md:p-6 mb-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl md:text-3xl">
            🪞
          </div>
          <div>
            <p className="text-cyan-300 text-[10px] uppercase tracking-wider font-bold">Моя профориентация</p>
            <h3 className="font-montserrat font-black text-white text-lg md:text-xl leading-tight">
              {topRiasecLabels[0]?.label}
              {topRiasecLabels[1] && <> + <span className="text-cyan-200">{topRiasecLabels[1].label}</span></>}
            </h3>
            {createdStr && <p className="text-white/45 text-[10px] mt-0.5">Пройдено {createdStr}</p>}
          </div>
        </div>
        <Link
          to="/know-yourself/result"
          className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
        >
          Подробнее
          <Icon name="ArrowRight" size={12} />
        </Link>
      </div>

      {/* Топ-3 профессии */}
      {topProfs.length > 0 && (
        <div className="space-y-1.5 mb-4">
          <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1">Топ профессий для тебя</p>
          {topProfs.map((p, i: number) => {
            const prof = p?.profession;
            if (!prof) return null;
            return (
              <div key={prof.id} className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-lg">{prof.emoji}</span>
                <span className="text-white text-sm font-bold flex-1 truncate">{prof.title}</span>
                <span className="text-cyan-300 text-xs font-black tabular-nums flex-shrink-0">{p.score}%</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          to="/graduate"
          className="inline-flex items-center gap-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-100 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
        >
          <Icon name="GraduationCap" size={12} />
          Подобрать вуз
        </Link>
        <Link
          to="/know-yourself"
          className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/65 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
        >
          <Icon name="RefreshCw" size={12} />
          Пройти заново
        </Link>
      </div>
    </div>
  );
}
