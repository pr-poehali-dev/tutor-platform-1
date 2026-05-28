import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TACTIC_CATEGORIES, Tactic, TacticCategory } from "./tacticsData";
import { EFFORT_LABEL } from "./types";

interface Props {
  onSendTask: (title: string, description: string, priority: string) => void;
}

const COLOR_BORDER: Record<string, string> = {
  emerald: "border-emerald-400/30 bg-emerald-500/[0.05]",
  purple:  "border-purple-400/30 bg-purple-500/[0.05]",
  amber:   "border-amber-400/30 bg-amber-500/[0.05]",
  cyan:    "border-cyan-400/30 bg-cyan-500/[0.05]",
  rose:    "border-rose-400/30 bg-rose-500/[0.05]",
  fuchsia: "border-fuchsia-400/30 bg-fuchsia-500/[0.05]",
  indigo:  "border-indigo-400/30 bg-indigo-500/[0.05]",
};

const COLOR_ICON: Record<string, string> = {
  emerald: "text-emerald-300",
  purple:  "text-purple-300",
  amber:   "text-amber-300",
  cyan:    "text-cyan-300",
  rose:    "text-rose-300",
  fuchsia: "text-fuchsia-300",
  indigo:  "text-indigo-300",
};

export default function TacticsLibrary({ onSendTask }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(TACTIC_CATEGORIES[0].code);
  const [expandedTactic, setExpandedTactic] = useState<string | null>(null);

  const current = TACTIC_CATEGORIES.find((c) => c.code === activeCategory) || TACTIC_CATEGORIES[0];

  const totalTactics = TACTIC_CATEGORIES.reduce((s, c) => s + c.tactics.length, 0);

  const toTask = (cat: TacticCategory, t: Tactic) => {
    const desc = `${t.description}\n\nШаги:\n${t.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nОжидаемый эффект: ${t.impact}`;
    onSendTask(`[${cat.title}] ${t.title}`, desc, t.effort === "high" ? "medium" : "high");
  };

  return (
    <div className="mb-8">
      <h2 className="font-montserrat text-lg font-bold text-white/85 mb-1 flex items-center gap-2">
        <Icon name="Library" size={18} className="text-amber-300" />
        Библиотека бесплатных тактик
        <span className="text-white/40 text-sm font-normal ml-2">{totalTactics} способов привести клиентов без рекламы</span>
      </h2>
      <p className="text-white/45 text-xs mb-4">
        Бюджет 0 ₽. Все методы — проверенные. Жми «В работу» — задача уйдёт отделу продаж.
      </p>

      {/* Категории — табы */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {TACTIC_CATEGORIES.map((cat) => (
          <button
            key={cat.code}
            onClick={() => { setActiveCategory(cat.code); setExpandedTactic(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              activeCategory === cat.code
                ? `${COLOR_BORDER[cat.color]} text-white`
                : "border-white/10 bg-white/[0.02] text-white/55 hover:text-white"
            }`}
          >
            <Icon name={cat.icon} size={12} className={activeCategory === cat.code ? COLOR_ICON[cat.color] : ""} />
            {cat.title}
            <span className="text-white/40 ml-0.5">({cat.tactics.length})</span>
          </button>
        ))}
      </div>

      {/* Описание категории */}
      <Card className={`border p-4 mb-3 ${COLOR_BORDER[current.color]}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0`}>
            <Icon name={current.icon} size={18} className={COLOR_ICON[current.color]} />
          </div>
          <div>
            <h3 className="font-montserrat font-bold text-white text-base">{current.title}</h3>
            <p className="text-white/65 text-sm mt-0.5">{current.description}</p>
          </div>
        </div>
      </Card>

      {/* Тактики */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {current.tactics.map((t) => {
          const isExpanded = expandedTactic === t.id;
          return (
            <Card key={t.id} className="border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-all flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-white text-sm flex-1">{t.title}</h4>
                <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${
                  t.effort === "low" ? "border-emerald-400/30 text-emerald-200 bg-emerald-500/10" :
                  t.effort === "medium" ? "border-amber-400/30 text-amber-200 bg-amber-500/10" :
                  "border-rose-400/30 text-rose-200 bg-rose-500/10"
                }`}>
                  {EFFORT_LABEL[t.effort]}
                </Badge>
              </div>
              <p className="text-white/65 text-xs mb-2 leading-relaxed">{t.description}</p>
              <div className="text-emerald-300 text-xs font-bold mb-2 flex items-center gap-1">
                <Icon name="TrendingUp" size={12} /> {t.impact}
              </div>

              {/* Шаги (раскрытие) */}
              {isExpanded && (
                <div className="rounded-lg bg-white/[0.025] border border-white/10 p-3 mb-2">
                  <div className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-1.5">План действий</div>
                  <ol className="space-y-1.5 text-xs text-white/85">
                    {t.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-fuchsia-300 font-bold flex-shrink-0">{i + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex gap-1.5 mt-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/55 hover:text-white text-xs flex-1"
                  onClick={() => setExpandedTactic(isExpanded ? null : t.id)}
                >
                  <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={12} className="mr-1" />
                  {isExpanded ? "Свернуть" : "Шаги"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-400/30 text-purple-200 hover:bg-purple-500/10 text-xs flex-1"
                  onClick={() => toTask(current, t)}
                >
                  <Icon name="Send" size={12} className="mr-1" /> В работу
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
