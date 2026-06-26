import { useState } from "react";
import Icon from "@/components/ui/icon";
import { checkHomework, getSessionId } from "./api";

interface Props {
  lessonKey: string;
  task: string;
  placeholder: string;
}

export default function HomeworkBox({ lessonKey, task, placeholder }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number | null; feedback: string; verdict: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (text.trim().length < 10 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await checkHomework(getSessionId(), lessonKey, text.trim());
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Ошибка");
      return;
    }
    setResult({ score: res.score ?? null, feedback: res.feedback || "", verdict: res.verdict || "" });
  };

  const scoreColor = (s: number | null) =>
    s === null ? "text-white/60" : s >= 70 ? "text-emerald-300" : s >= 40 ? "text-amber-300" : "text-rose-300";

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="PenLine" size={16} className="text-cyan-300" />
        <h4 className="font-montserrat font-bold text-white text-sm">Домашнее задание</h4>
      </div>
      <p className="text-white/65 text-sm mb-3">{task}</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-500/40 resize-y"
      />

      <button
        onClick={submit}
        disabled={loading || text.trim().length < 10}
        className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50 hover:scale-[1.02] transition-transform"
      >
        {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Sparkles" size={16} />}
        {loading ? "Куратор проверяет..." : "Проверить у ИИ-куратора"}
      </button>

      {error && <div className="mt-3 text-rose-300 text-xs">{error}</div>}

      {result && (
        <div className="mt-4 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-300 text-xs font-bold uppercase tracking-wide">Оценка куратора</span>
            {result.score !== null && (
              <span className={`font-montserrat font-black text-2xl ${scoreColor(result.score)}`}>
                {result.score}<span className="text-sm text-white/40">/100</span>
              </span>
            )}
          </div>
          {result.verdict && <p className="text-white font-semibold text-sm mb-2">{result.verdict}</p>}
          <p className="text-white/75 text-sm whitespace-pre-wrap leading-relaxed">{result.feedback}</p>
        </div>
      )}
    </div>
  );
}
