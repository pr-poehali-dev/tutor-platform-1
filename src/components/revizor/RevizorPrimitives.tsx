import { useState } from "react";
import Icon from "@/components/ui/icon";
import { QUIZ } from "./revizorData";

export function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-rose-500/20 border border-amber-400/30 flex items-center justify-center">
          <Icon name={icon} size={18} className="text-amber-300" />
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-white/75 text-[16px] md:text-[17px] leading-[1.75] mb-4 ${className}`}>{children}</p>;
}

export function Callout({
  icon,
  tone,
  title,
  children,
}: {
  icon: string;
  tone: "amber" | "rose";
  title: string;
  children: React.ReactNode;
}) {
  const tones = {
    amber: "border-amber-400/25 bg-amber-400/[0.06] text-amber-200",
    rose: "border-rose-400/25 bg-rose-400/[0.06] text-rose-200",
  };
  return (
    <div className={`rounded-2xl border p-5 my-5 ${tones[tone]}`}>
      <div className="flex items-center gap-2 font-montserrat font-bold mb-2">
        <Icon name={icon} size={17} />
        {title}
      </div>
      <p className="text-white/75 text-[15px] leading-relaxed">{children}</p>
    </div>
  );
}

export function Quiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  return (
    <div className="space-y-4">
      {QUIZ.map((item, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="font-montserrat font-bold text-white mb-3">
              {qi + 1}. {item.q}
            </p>
            <div className="grid gap-2">
              {item.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === item.correct;
                const show = chosen !== undefined;
                let cls = "border-white/10 bg-white/[0.02] text-white/75 hover:bg-white/[0.06]";
                if (show && isCorrect) cls = "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
                else if (show && isChosen && !isCorrect) cls = "border-rose-400/40 bg-rose-500/15 text-rose-200";
                return (
                  <button
                    key={oi}
                    onClick={() => chosen === undefined && setAnswers((a) => ({ ...a, [qi]: oi }))}
                    disabled={chosen !== undefined}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-sm transition-colors ${cls}`}
                  >
                    {show && isCorrect && <Icon name="Check" size={15} className="text-emerald-400 shrink-0" />}
                    {show && isChosen && !isCorrect && <Icon name="X" size={15} className="text-rose-400 shrink-0" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
