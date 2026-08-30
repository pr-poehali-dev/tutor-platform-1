import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import { trackQuery } from "@/components/search/trackQuery";

const AI_URL = (func2url as Record<string, string>)["ai-chat"];

/**
 * ИИ-подборщик: человек спрашивает своими словами («что подойдёт ребёнку 5 лет»),
 * ИИ отвечает и показывает 2-4 подходящие карточки с сайта.
 *
 * Важно: ИИ выбирает ТОЛЬКО из переданного списка — он не может придумать
 * несуществующий курс. Если совпадений нет, честно скажет об этом.
 */

export interface PickerItem {
  id: string;
  title: string;
  meta: string;
  url: string;
  emoji: string;
}

interface Props {
  /** Из чего выбирать — реальные курсы или произведения с сайта. */
  items: PickerItem[];
  title: string;
  subtitle: string;
  placeholder: string;
  /** Готовые вопросы одним нажатием. */
  chips: string[];
  /** Как ИИ должен себя вести: «подбери курс» или «подбери сказку». */
  role: string;
  accent?: "purple" | "pink";
  /** Откуда пришёл вопрос — для статистики запросов. */
  source: "courses" | "library" | "home";
}

export default function AiPicker({
  items,
  title,
  subtitle,
  placeholder,
  chips,
  role,
  accent = "purple",
  source,
}: Props) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [picked, setPicked] = useState<PickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastAsked = useRef("");

  const ask = async (raw?: string) => {
    const question = (raw ?? q).trim();
    if (question.length < 3 || loading) return;
    if (question === lastAsked.current && answer) return;
    lastAsked.current = question;
    setLoading(true);
    setError("");
    setAnswer("");
    setPicked([]);

    // Отдаём ИИ короткий каталог: id + название + пометка.
    const catalog = items
      .slice(0, 120)
      .map((i) => `${i.id} | ${i.title} | ${i.meta}`)
      .join("\n");

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 28000);
    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          teacher_id: "alex",
          history: [],
          message:
            `${role}\n\nЗапрос человека: «${question}»\n\n` +
            `Доступно на сайте (формат «id | название | пометка»):\n${catalog}\n\n` +
            `Выбери 2-4 самых подходящих варианта СТРОГО из списка выше. ` +
            `Никогда не придумывай то, чего нет в списке. ` +
            `Если ничего не подходит — верни пустой массив ids и объясни это в ответе.\n\n` +
            `Верни строго JSON без markdown:\n` +
            `{"answer": "дружелюбное объяснение 2-3 предложения, почему именно это подойдёт", ` +
            `"ids": ["id1", "id2"]}`,
        }),
      });
      if (!res.ok) throw new Error("bad");
      const data = await res.json();
      let raw = String(data?.reply || "").trim();
      raw = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

      let parsed: { answer?: string; ids?: string[] } | null = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // ИИ иногда добавляет текст вокруг JSON — вытаскиваем объект
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            parsed = JSON.parse(m[0]);
          } catch {
            parsed = null;
          }
        }
      }

      if (!parsed) {
        setAnswer(raw.slice(0, 600));
      } else {
        setAnswer(String(parsed.answer || ""));
        const ids = Array.isArray(parsed.ids) ? parsed.ids.map(String) : [];
        const found = ids
          .map((id) => items.find((i) => i.id === id))
          .filter((x): x is PickerItem => Boolean(x));
        setPicked(found.slice(0, 4));
        // Ноль подобранного = человек хотел то, чего у нас нет
        trackQuery(question, source, found.length, found.map((f) => f.id));
      }
    } catch {
      setError("Не получилось подобрать — попробуйте ещё раз через минуту.");
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const ring = accent === "pink" ? "border-pink-400/30" : "border-purple-400/30";
  const glow =
    accent === "pink"
      ? "from-pink-500/12 via-fuchsia-500/8 to-purple-500/8"
      : "from-purple-500/12 via-fuchsia-500/8 to-cyan-500/8";
  const btn =
    accent === "pink"
      ? "from-pink-500 to-purple-500"
      : "from-purple-500 to-cyan-500";

  return (
    <div className={`rounded-3xl border ${ring} bg-gradient-to-br ${glow} p-5 md:p-6`}>
      <div className="flex items-center gap-2.5 mb-1">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${btn} flex items-center justify-center flex-shrink-0`}>
          <Icon name="Sparkles" size={17} className="text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="font-montserrat font-black text-white text-base leading-tight">{title}</h3>
          <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-white/[0.07] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/30"
        />
        <button
          onClick={() => ask()}
          disabled={loading || q.trim().length < 3}
          className={`bg-gradient-to-r ${btn} text-white font-bold px-4 rounded-xl disabled:opacity-50 inline-flex items-center gap-2 flex-shrink-0`}
        >
          {loading ? (
            <Icon name="Loader2" size={16} className="animate-spin" />
          ) : (
            <Icon name="Send" size={16} />
          )}
          <span className="hidden sm:inline">Подобрать</span>
        </button>
      </div>

      {!answer && !loading && (
        <div className="flex flex-wrap gap-2 mt-3">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => {
                setQ(c);
                ask(c);
              }}
              className="bg-white/8 hover:bg-white/16 text-white/80 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-4 space-y-2">
          <div className="h-3 rounded-full bg-white/10 animate-pulse w-full" />
          <div className="h-3 rounded-full bg-white/10 animate-pulse w-4/5" />
        </div>
      )}

      {error && <p className="text-rose-300 text-xs mt-3">{error}</p>}

      {answer && !loading && (
        <p className="text-white/85 text-sm leading-relaxed mt-4">{answer}</p>
      )}

      {picked.length > 0 && (
        <div className="grid gap-2 mt-4">
          {picked.map((p) => (
            <Link
              key={p.id}
              to={p.url}
              className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-xl px-4 py-3 transition-colors group"
            >
              <span className="text-2xl flex-shrink-0">{p.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-white font-bold text-sm truncate">{p.title}</span>
                <span className="block text-white/45 text-xs truncate">{p.meta}</span>
              </span>
              <Icon
                name="ArrowRight"
                size={16}
                className="text-white/30 group-hover:text-white/70 flex-shrink-0"
              />
            </Link>
          ))}
        </div>
      )}

      {answer && !loading && (
        <p className="text-white/35 text-[11px] mt-3">
          Подобрано нейросетью из того, что реально есть на сайте
        </p>
      )}
    </div>
  );
}