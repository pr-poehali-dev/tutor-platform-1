import Icon from "@/components/ui/icon";
import { Answer, Question } from "./types";

interface Props {
  question: Question;
  selected?: Answer;
  onSelect: (a: Answer) => void;
  index: number;
  total: number;
}

const SCALE: { value: Answer; label: string; emoji: string; tone: string }[] = [
  { value: 1, label: "Совсем не я", emoji: "😐", tone: "rose" },
  { value: 2, label: "Скорее нет",   emoji: "🤔", tone: "amber" },
  { value: 3, label: "Не уверен(а)", emoji: "😶", tone: "stone" },
  { value: 4, label: "Скорее да",    emoji: "🙂", tone: "cyan" },
  { value: 5, label: "Это прям я!",  emoji: "🤩", tone: "emerald" },
];

const TONE_CLASSES: Record<string, { active: string; idle: string }> = {
  rose:    { active: "bg-rose-500/35 border-rose-400 text-white shadow-lg shadow-rose-500/30",       idle: "bg-rose-500/8 border-rose-500/30 text-rose-200 hover:bg-rose-500/15" },
  amber:   { active: "bg-amber-500/35 border-amber-400 text-white shadow-lg shadow-amber-500/30",    idle: "bg-amber-500/8 border-amber-500/30 text-amber-200 hover:bg-amber-500/15" },
  stone:   { active: "bg-stone-500/35 border-stone-300 text-white shadow-lg shadow-stone-500/30",    idle: "bg-white/5 border-white/15 text-white/65 hover:bg-white/10" },
  cyan:    { active: "bg-cyan-500/35 border-cyan-400 text-white shadow-lg shadow-cyan-500/30",       idle: "bg-cyan-500/8 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/15" },
  emerald: { active: "bg-emerald-500/35 border-emerald-400 text-white shadow-lg shadow-emerald-500/30", idle: "bg-emerald-500/8 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/15" },
};

export default function QuestionCard({ question, selected, onSelect, index, total }: Props) {
  return (
    <div className="bg-card border border-white/10 rounded-3xl p-5 md:p-7">
      <div className="flex items-center justify-between mb-4 text-[11px] uppercase tracking-wider font-bold">
        <span className="text-purple-300">Вопрос {index + 1} из {total}</span>
        <span className="text-white/35">{question.block}</span>
      </div>

      <p className="font-montserrat font-black text-white text-lg md:text-2xl leading-snug mb-6">
        {question.text}
      </p>

      <div className="grid grid-cols-5 gap-2">
        {SCALE.map((s) => {
          const isActive = selected === s.value;
          const cls = TONE_CLASSES[s.tone];
          return (
            <button
              key={s.value}
              onClick={() => onSelect(s.value)}
              className={`flex flex-col items-center gap-1.5 border-2 rounded-2xl p-3 transition-all ${isActive ? cls.active + " scale-[1.04]" : cls.idle}`}
              aria-pressed={isActive}
            >
              <span className="text-2xl md:text-3xl">{s.emoji}</span>
              <span className="text-[10px] md:text-xs font-bold leading-tight text-center">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-white/35 text-[10px]">
        <Icon name="Lightbulb" size={11} />
        <span>Отвечай быстро и честно — первая мысль обычно самая точная.</span>
      </div>
    </div>
  );
}
