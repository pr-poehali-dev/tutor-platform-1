import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

interface Goal {
  name: string;
  id: string;
  type: string;
  condition: string;
  value: number;
  category: string;
  description: string;
}

interface GoalsFile {
  version: string;
  counterId: number;
  goals: Goal[];
  instruction: string;
}

function copy(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => { /* noop */ });
  }
}

const CATEGORY_COLOR: Record<string, string> = {
  "Конверсия": "from-purple-500 to-pink-500",
  "Оплата": "from-emerald-500 to-teal-500",
  "Малыш": "from-rose-500 to-pink-500",
  "Регистрация": "from-cyan-500 to-blue-500",
  "Реклама": "from-amber-500 to-orange-500",
  "ИИ": "from-violet-500 to-fuchsia-500",
  "Обучение": "from-blue-500 to-indigo-500",
  "Навигация": "from-slate-500 to-slate-600",
  "Вовлечённость": "from-teal-500 to-cyan-500",
};

export default function MetrikaGoals() {
  const [data, setData] = useState<GoalsFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/metrika-goals.json")
      .then((r) => r.json())
      .then((j: GoalsFile) => setData(j))
      .catch(() => setData(null));
  }, []);

  const onCopy = (text: string, id: string) => {
    copy(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-white">
        <Icon name="Loader2" size={32} className="animate-spin text-purple-400" />
      </div>
    );
  }

  const grouped: Record<string, Goal[]> = {};
  data.goals.forEach((g) => {
    if (!grouped[g.category]) grouped[g.category] = [];
    grouped[g.category].push(g);
  });

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Цели Метрики — УЧИСЬПРО" description="Готовые цели для импорта в Яндекс.Метрику" noindex />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide">УЧИСЬПРО</span>
          </Link>
          <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">Админ · Цели Метрики</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 rounded-full px-4 py-1.5 mb-5">
          <Icon name="Target" size={14} className="text-amber-300" />
          <span className="text-sm text-amber-200 font-bold uppercase tracking-wider">Цели Яндекс.Метрики</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          {data.goals.length} готовых целей <span className="gradient-text-purple">для импорта</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mb-6">
          Счётчик <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-purple-200">{data.counterId}</span>. Скачай JSON или скопируй цели по одной — добавь в Метрику для оптимизации рекламы на конверсии.
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href="/metrika-goals.json"
            download="metrika-goals.json"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg"
          >
            <Icon name="Download" size={14} />
            Скачать metrika-goals.json
          </a>
          <a
            href={`https://metrika.yandex.ru/list?id=${data.counterId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors"
          >
            <Icon name="ExternalLink" size={14} />
            Открыть Метрику
          </a>
        </div>

        {/* Инструкция */}
        <div className="bg-cyan-500/8 border border-cyan-500/30 rounded-2xl p-5 mb-8">
          <p className="font-montserrat font-black text-white text-base mb-3 flex items-center gap-2">
            <Icon name="ListChecks" size={16} className="text-cyan-300" />
            Как добавить цели в Метрику
          </p>
          <ol className="space-y-2 text-white/75 text-sm">
            <li><b className="text-cyan-300">1.</b> Открой <a href={`https://metrika.yandex.ru/list?id=${data.counterId}`} target="_blank" rel="noreferrer" className="text-cyan-200 underline">кабинет Метрики</a> и найди счётчик {data.counterId}.</li>
            <li><b className="text-cyan-300">2.</b> Перейди в раздел «Настройка» → «Цели».</li>
            <li><b className="text-cyan-300">3.</b> Нажми «Добавить цель», выбери тип (JavaScript-событие или URL).</li>
            <li><b className="text-cyan-300">4.</b> Скопируй имя и условие из списка ниже (кнопка «Копировать ID»).</li>
            <li><b className="text-cyan-300">5.</b> Поставь ценность из колонки (это деньги, которые цель «приносит» — Метрика так оптимизирует ставки в Директе).</li>
            <li><b className="text-cyan-300">6.</b> В Директе при создании кампании выбери цель <b className="text-emerald-300">payment_success</b> как главную — Директ будет искать пользователей, похожих на тех, кто оплачивает.</li>
          </ol>
        </div>

        {/* Список целей по категориям */}
        {Object.entries(grouped).map(([category, goals]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${CATEGORY_COLOR[category] ?? "from-white/30 to-white/10"}`} />
              <h2 className="font-montserrat font-black text-white text-lg">{category}</h2>
              <span className="text-white/45 text-xs">· {goals.length}</span>
            </div>
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className="bg-card border border-white/10 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-montserrat font-black text-white text-sm">{g.name}</p>
                      <p className="text-white/55 text-xs mt-0.5">{g.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${g.value >= 200 ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : g.value >= 50 ? "bg-amber-500/20 text-amber-200 border border-amber-500/30" : "bg-white/8 text-white/65 border border-white/15"}`}>
                        ₽{g.value}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/45 font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                      {g.type}
                    </span>
                    <code className="text-purple-200 text-xs font-mono bg-background/60 border border-white/10 px-2.5 py-1 rounded-md flex-1 truncate">
                      {g.id}
                    </code>
                    <button
                      onClick={() => onCopy(g.id, g.id)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white/8 hover:bg-white/15 text-white/85 font-semibold transition-colors"
                    >
                      <Icon name={copiedId === g.id ? "Check" : "Copy"} size={11} />
                      {copiedId === g.id ? "Скопировано" : "ID"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-emerald-500/8 border border-emerald-500/30 rounded-2xl p-5 mt-10">
          <p className="font-montserrat font-black text-emerald-200 text-base mb-2 flex items-center gap-2">
            <Icon name="Lightbulb" size={16} />
            Главный совет
          </p>
          <p className="text-white/75 text-sm leading-relaxed">
            Цели начинают работать <b>сразу после создания</b>. Чтобы Директ научился искать платящих клиентов, нужно <b>минимум 10 конверсий в неделю</b> — потом стратегия «Целевая доля рекламных расходов» с целью <b className="text-emerald-300">payment_success</b> станет в разы точнее.
          </p>
        </div>
      </div>
    </div>
  );
}
