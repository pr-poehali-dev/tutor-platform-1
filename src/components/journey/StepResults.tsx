import Icon from "@/components/ui/icon";
import { AnalysisResult, SubjectChoice } from "./journeyData";

interface Props {
  analysis: AnalysisResult;
  subject: SubjectChoice;
  onNext: () => void;
  isLoading: boolean;
}

export default function StepResults({ analysis, subject, onNext, isLoading }: Props) {
  const scoreColor = analysis.score_percent >= 75 ? "#06d6a0" : analysis.score_percent >= 50 ? "#ffd60a" : "#f72585";

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Score */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/25 rounded-full px-4 py-1.5 mb-4">
          <Icon name="ChartBar" size={14} className="text-cyan-300" />
          <span className="text-sm text-cyan-300 font-medium">Шаг 2 из 4 · Анализ результатов</span>
        </div>
        <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-6">
          Твой результат
        </h2>

        {/* Circular score */}
        <div className="relative w-44 h-44 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(analysis.score_percent / 100) * 264} 264`}
              style={{ transition: "stroke-dasharray 1.5s ease-out", filter: `drop-shadow(0 0 8px ${scoreColor}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-montserrat font-black text-4xl" style={{ color: scoreColor }}>
              {analysis.score_percent}%
            </span>
            <span className="text-white/50 text-xs mt-1 uppercase tracking-widest">{analysis.level_assessment}</span>
          </div>
        </div>

        <div className="bg-card/60 border border-white/10 rounded-2xl p-5 max-w-xl mx-auto">
          <p className="text-white/85 text-sm leading-relaxed italic">
            «{analysis.personalized_message}»
          </p>
          <p className="text-white/30 text-xs mt-2">— ИИ-методист</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Weak topics */}
        <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
              🎯
            </div>
            <h3 className="font-montserrat font-black text-base text-white">Над чем поработать</h3>
          </div>
          <div className="flex flex-col gap-2">
            {analysis.weak_topics.length === 0 ? (
              <p className="text-white/40 text-sm py-3 text-center">Пробелов нет — ты молодец!</p>
            ) : (
              analysis.weak_topics.map(t => (
                <div key={t.topic} className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-semibold">{t.topic}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      t.severity === "критично" ? "bg-red-500/20 text-red-300" :
                      t.severity === "умеренно" ? "bg-orange-500/20 text-orange-300" :
                      "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {t.severity}
                    </span>
                  </div>
                  <p className="text-white/45 text-xs">{t.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Strong topics + follow-up */}
        <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
              💪
            </div>
            <h3 className="font-montserrat font-black text-base text-white">Сильные стороны</h3>
          </div>
          {analysis.strong_topics.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-5">
              {analysis.strong_topics.map(t => (
                <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-500/15 text-green-300 border border-green-500/25">
                  ✓ {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm mb-5">Начнём с нуля — у тебя всё впереди</p>
          )}

          <div className="border-t border-white/8 pt-4">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
              💭 Уточняющие вопросы
            </p>
            <div className="flex flex-col gap-1.5">
              {analysis.follow_up_questions.slice(0, 3).map((q, i) => (
                <p key={i} className="text-white/60 text-xs">• {q}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-all disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${subject.accent}, ${subject.accent}cc)`, boxShadow: `0 4px 24px ${subject.accent}40` }}
      >
        {isLoading ? (
          <>
            <Icon name="Loader2" size={16} className="animate-spin" />
            ИИ формирует программу...
          </>
        ) : (
          <>
            <Icon name="Sparkles" size={16} />
            Построить мою программу
          </>
        )}
      </button>
    </div>
  );
}
