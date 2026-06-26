import { useState } from "react";
import Icon from "@/components/ui/icon";
import { runAudit, AuditResult } from "./api";

export default function AuditBox() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (text.trim().length < 10 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await runAudit(text.trim());
    setLoading(false);
    if (!res.ok) return setError(res.error || "Ошибка");
    setResult(res.result || null);
  };

  return (
    <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-6 md:p-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 mb-3">
        <Icon name="Wand2" size={14} className="text-purple-300" />
        <span className="text-purple-300 text-xs font-bold uppercase tracking-wide">ИИ-аудит за 30 секунд</span>
      </div>
      <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
        Опиши свой бизнес — получи план автоматизации
      </h2>
      <p className="text-white/60 mb-5 max-w-2xl">
        Напиши 1-3 предложения о своём деле. ИИ найдёт, где теряются заявки, и предложит первую связку.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Например: делаю кухни на заказ, заявки идут из Instagram и с сайта, обрабатываю сам в переписке, часто забываю перезвонить..."
        rows={3}
        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40 resize-y"
      />
      <button
        onClick={submit}
        disabled={loading || text.trim().length < 10}
        className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 hover:scale-[1.02] transition-transform"
      >
        {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Sparkles" size={18} />}
        {loading ? "ИИ анализирует..." : "Получить план автоматизации"}
      </button>

      {error && <div className="mt-3 text-rose-300 text-xs">{error}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Inbox" size={15} className="text-cyan-300" />
                <h4 className="font-montserrat font-bold text-white text-sm">Источники лидов</h4>
              </div>
              <ul className="space-y-1.5">
                {result.sources.map((s, i) => (
                  <li key={i} className="text-white/75 text-sm flex items-start gap-2">
                    <Icon name="Dot" size={16} className="text-cyan-300 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="AlertTriangle" size={15} className="text-rose-300" />
                <h4 className="font-montserrat font-bold text-white text-sm">Где теряются деньги</h4>
              </div>
              <ul className="space-y-1.5">
                {result.leaks.map((s, i) => (
                  <li key={i} className="text-white/75 text-sm flex items-start gap-2">
                    <Icon name="Dot" size={16} className="text-rose-300 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/25 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Workflow" size={15} className="text-emerald-300" />
              <h4 className="font-montserrat font-bold text-white text-sm">Первая связка для внедрения</h4>
            </div>
            <p className="text-white/85 text-sm">{result.connection}</p>
          </div>

          {result.lead_fields.length > 0 && (
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Tags" size={15} className="text-amber-300" />
                <h4 className="font-montserrat font-bold text-white text-sm">Поля карточки лида</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.lead_fields.map((f, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-200 border border-amber-500/25">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.email.body && (
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Mail" size={15} className="text-purple-300" />
                <h4 className="font-montserrat font-bold text-white text-sm">Готовое письмо-напоминание</h4>
              </div>
              {result.email.subject && (
                <p className="text-white/60 text-xs mb-1"><b className="text-white/80">Тема:</b> {result.email.subject}</p>
              )}
              <p className="text-white/75 text-sm whitespace-pre-wrap leading-relaxed">{result.email.body}</p>
            </div>
          )}

          <p className="text-white/45 text-xs text-center">
            Это демо-аудит. На интенсиве куратор адаптирует связки под твой реальный проект.
          </p>
        </div>
      )}
    </div>
  );
}
