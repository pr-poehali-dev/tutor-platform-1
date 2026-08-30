import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const AI_URL = (func2url as Record<string, string>)["ai-chat"];

/**
 * Нейро-ответ в поиске — как у Алисы в Яндексе.
 *
 * Зачем: раньше по запросу вроде «Муха-Цокотуха» или «как научить ребёнка
 * читать» человек видел пустую выдачу и уходил. Теперь ИИ отвечает на вопрос
 * своими словами прямо в результатах, а под ответом — ссылки на разделы сайта.
 */

interface Props {
  query: string;
  /** Есть ли обычные результаты — от этого зависит подача блока. */
  hasResults: boolean;
}

/** Куда вести после ответа — подбираем по смыслу запроса. */
function suggestLinks(q: string): { label: string; to: string; emoji: string }[] {
  const s = q.toLowerCase();
  const links: { label: string; to: string; emoji: string }[] = [];

  // Названия сказок люди пишут без слова «сказка» — ловим по героям
  const TALE = /сказк|стих|рассказ|басн|читать детям|на ночь|малыш|дошкол|колобок|репк|теремок|курочк|ряба|медвед|козлят|поросён|поросен|шапочк|золушк|муха|цокотух|мойдодыр|айболит|барма|федорин|тараканищ|гуси|лебеди|морозк|щучь|буратино|незнайк|чебурашк|винни|карлсон|маугли|русалочк|дюймовочк|снегурочк|емел|иван|царевн|баба яга|кощей|жар-птиц|лиса|волк|заяц|пушкин|толст|крылов|чуковск|михалков|маршак|барто|носов|бианки|пришвин|ушинск|перро|андерсен|гримм/;
  if (TALE.test(s)) {
    links.push({ label: "Библиотека сказок", to: "/kids/library", emoji: "📖" });
    links.push({ label: "Раздел «Малыш»", to: "/kids", emoji: "🧸" });
  }
  if (/чита|букв|азбук|алфавит|слог/.test(s)) {
    links.push({ label: "Курс «Учусь читать»", to: "/kids/reading", emoji: "🔤" });
  }
  if (/егэ|огэ|экзамен|поступ|вуз|11 класс|9 класс/.test(s)) {
    links.push({ label: "Подготовка к ЕГЭ и ОГЭ", to: "/exam-bank", emoji: "🎓" });
  }
  if (/матем|физик|хими|биолог|информатик|англ|русск|истори/.test(s)) {
    links.push({ label: "Каталог курсов", to: "/courses", emoji: "📚" });
  }
  if (/нейросет|искусственн|ии |chatgpt|професси|работа|карьер/.test(s)) {
    links.push({ label: "Курсы для взрослых", to: "/courses", emoji: "💼" });
  }

  if (links.length === 0) {
    links.push({ label: "Каталог курсов", to: "/courses", emoji: "📚" });
    links.push({ label: "Лента статей", to: "/feed", emoji: "📡" });
  }
  return links.slice(0, 3);
}

export default function AiAnswer({ query, hasResults }: Props) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  // Ответ дорогой: просим его один раз на запрос, а не на каждый ререндер.
  const askedFor = useRef<string>("");

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || askedFor.current === q) return;
    askedFor.current = q;
    setAnswer("");
    setFailed(false);
    setLoading(true);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);

    fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        teacher_id: "alex",
        history: [],
        message:
          `Пользователь ищет на образовательном сайте УЧИСЬПРО: «${q}».\n\n` +
          `Ответь на его запрос по существу: коротко, дружелюбно, 2-4 предложения. ` +
          `Если это детская сказка — перескажи сюжет в двух предложениях. ` +
          `Если вопрос про учёбу или воспитание — дай конкретный совет. ` +
          `Не выдумывай факты и не обещай того, чего нет на сайте. ` +
          `Без приветствий, без markdown, без списков — только связный текст.`,
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        const text = String(d?.reply || "").trim();
        if (text) setAnswer(text);
        else setFailed(true);
      })
      .catch(() => setFailed(true))
      .finally(() => {
        clearTimeout(timer);
        setLoading(false);
      });

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  if (failed && !answer) return null;

  const links = suggestLinks(query);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-purple-400/25 bg-gradient-to-br from-purple-500/12 via-fuchsia-500/8 to-cyan-500/8 p-5 md:p-6 ${
        hasResults ? "mb-5" : "mb-5"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Icon name="Sparkles" size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-montserrat font-black text-white text-sm leading-none">
            Ответ ИИ-помощника
          </p>
          <p className="text-white/45 text-[11px] mt-1">
            Сгенерировано нейросетью — проверяйте важные факты
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-2 py-1">
          <div className="h-3 rounded-full bg-white/10 animate-pulse w-full" />
          <div className="h-3 rounded-full bg-white/10 animate-pulse w-11/12" />
          <div className="h-3 rounded-full bg-white/10 animate-pulse w-2/3" />
          <p className="text-white/40 text-xs pt-1.5 flex items-center gap-1.5">
            <Icon name="Loader2" size={12} className="animate-spin" />
            Думаю над ответом…
          </p>
        </div>
      )}

      {!loading && answer && (
        <p className="text-white/85 text-[15px] leading-relaxed whitespace-pre-line">
          {answer}
        </p>
      )}

      {!loading && answer && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          {links.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
            >
              <span>{l.emoji}</span>
              {l.label}
            </Link>
          ))}
          <Link
            to="/ai-assistant"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="MessageCircle" size={12} />
            Спросить подробнее
          </Link>
        </div>
      )}
    </div>
  );
}