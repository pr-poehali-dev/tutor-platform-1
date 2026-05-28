import Icon from "@/components/ui/icon";
import { FeedArticle, CATEGORY_META } from "@/components/feed/types";
import { dt } from "./dt";

interface AdminFeedModerationSectionProps {
  pending: FeedArticle[];
  loadingPending: boolean;
  handleModerate: (id: number, decision: "approve" | "reject") => Promise<void>;
}

export default function AdminFeedModerationSection({
  pending, loadingPending, handleModerate,
}: AdminFeedModerationSectionProps) {
  return (
    <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="ShieldCheck" size={16} className="text-amber-300" />
          <span className="text-amber-300 text-[11px] uppercase tracking-wider font-bold">Ручная модерация</span>
        </div>
        <span className="text-white/55 text-xs">На рассмотрении: <span className="text-white font-bold">{pending.length}</span></span>
      </div>
      <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-1">Статьи пользователей</h2>
      <p className="text-white/55 text-xs mb-4">
        ИИ-модератор уже отметил каждую статью оценкой 0-100. Можешь утвердить вердикт ИИ или принять собственное решение.
      </p>

      {loadingPending ? (
        <p className="text-white/45 text-sm text-center py-8">Загружаю...</p>
      ) : pending.length === 0 ? (
        <div className="text-center py-10 bg-white/[0.03] rounded-2xl">
          <div className="text-4xl mb-2 opacity-50">📭</div>
          <p className="text-white/55 text-sm">Сейчас всё проверено — новых статей на модерации нет.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((a) => {
            const meta = CATEGORY_META[a.category];
            return (
              <div key={a.id} className={`border rounded-2xl p-4 ${
                a.auto_moderation_verdict === "flag" ? "bg-amber-500/[0.06] border-amber-500/35" :
                a.auto_moderation_verdict === "reject" ? "bg-rose-500/[0.05] border-rose-500/30" :
                "bg-white/[0.04] border-white/10"
              }`}>
                <div className="flex items-start gap-3 mb-3 flex-wrap">
                  <div className="text-3xl">{meta.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.tone}`}>
                        {meta.label}
                      </span>
                      <span className="text-white/45 text-[11px]">#{a.id} · {dt(a.created_at)}</span>
                      {a.auto_moderation_verdict && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          a.auto_moderation_verdict === "approve" ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/35" :
                          a.auto_moderation_verdict === "reject" ? "bg-rose-500/15 text-rose-200 border-rose-500/35" :
                          "bg-amber-500/15 text-amber-200 border-amber-500/35"
                        }`} title={a.auto_moderation_reasoning || ""}>
                          <Icon name="Bot" size={10} />
                          ИИ: {a.auto_moderation_verdict === "approve" ? "Одобрить" : a.auto_moderation_verdict === "reject" ? "Отклонить" : "Сомневается"}
                          {typeof a.auto_moderation_score === "number" && (
                            <span className="opacity-65">· {a.auto_moderation_score}/100</span>
                          )}
                        </span>
                      )}
                    </div>
                    <h3 className="font-montserrat font-black text-white text-base md:text-lg leading-tight mb-1">{a.title}</h3>
                    {a.author_display_name && (
                      <p className="text-white/45 text-xs flex items-center gap-1">
                        <Icon name="User" size={11} />
                        Автор: {a.author_display_name}
                      </p>
                    )}
                    {a.auto_moderation_reasoning && (
                      <p className="text-white/55 text-[11px] mt-1.5 italic flex items-start gap-1">
                        <Icon name="Bot" size={10} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                        <span>Объяснение ИИ: {a.auto_moderation_reasoning}</span>
                      </p>
                    )}
                  </div>
                </div>

                {a.summary && (
                  <p className="text-white/75 text-sm mb-2 italic border-l-2 border-cyan-500/40 pl-3">{a.summary}</p>
                )}
                <div className="bg-black/20 border border-white/8 rounded-xl p-3 mb-3 max-h-48 overflow-y-auto">
                  <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{a.content}</p>
                </div>

                {a.source_url && (
                  <p className="text-white/45 text-xs mb-3 truncate">
                    Источник: <a href={a.source_url} target="_blank" rel="nofollow noopener noreferrer" className="text-cyan-300 hover:text-cyan-200">{a.source_url}</a>
                  </p>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleModerate(a.id, "approve")}
                    className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-100 text-xs font-bold px-3 py-2 rounded-lg"
                  >
                    <Icon name="Check" size={12} />
                    Одобрить и опубликовать
                  </button>
                  <button
                    onClick={() => handleModerate(a.id, "reject")}
                    className="inline-flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-100 text-xs font-bold px-3 py-2 rounded-lg"
                  >
                    <Icon name="X" size={12} />
                    Отклонить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
