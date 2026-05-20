import Icon from "@/components/ui/icon";
import { SubjectChoice, SUBJECTS } from "./journeyData";

interface Props {
  selectedSubject: SubjectChoice | null;
  setSelectedSubject: (s: SubjectChoice) => void;
  selectedGrade: string;
  setSelectedGrade: (g: string) => void;
  onStart: () => void;
  isLoading: boolean;
}

export default function StepSubject({ selectedSubject, setSelectedSubject, selectedGrade, setSelectedGrade, onStart, isLoading }: Props) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/25 rounded-full px-4 py-1.5 mb-4">
          <Icon name="Sparkles" size={14} className="text-cyan-300" />
          <span className="text-sm text-cyan-300 font-medium">Шаг 1 из 4 · Выбор направления</span>
        </div>
        <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-3">
          С чего начнём <span className="gradient-text-purple">обучение?</span>
        </h2>
        <p className="text-white/55 max-w-xl mx-auto">
          Выбери предмет — ИИ-методист проведёт диагностику, найдёт пробелы и составит персональную программу
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {SUBJECTS.map(s => {
          const active = selectedSubject?.id === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedSubject(s)}
              className={`relative bg-card/60 border rounded-2xl p-5 cursor-pointer transition-all duration-300 card-hover ${
                active ? "scale-[1.02]" : "border-white/8 hover:border-white/20"
              }`}
              style={active ? { borderColor: s.accent, boxShadow: `0 0 24px ${s.accent}40` } : {}}
            >
              {active && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: s.accent }}>
                  <Icon name="Check" size={11} className="text-white" />
                </div>
              )}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl mb-3`}>
                {s.emoji}
              </div>
              <p className="font-montserrat font-black text-base text-white">{s.name}</p>
              <p className="text-white/40 text-xs mt-1">{s.grades.length} уровня</p>
            </div>
          );
        })}
      </div>

      {selectedSubject && (
        <div className="animate-fade-in">
          <p className="text-white/60 text-sm mb-3">Уровень программы:</p>
          <div className="flex gap-2 flex-wrap mb-8">
            {selectedSubject.grades.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  selectedGrade === g.id
                    ? "text-white"
                    : "bg-white/5 border-white/10 text-white/55 hover:text-white"
                }`}
                style={selectedGrade === g.id ? { background: `${selectedSubject.accent}25`, borderColor: `${selectedSubject.accent}60`, color: selectedSubject.accent } : {}}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl p-6 border" style={{ background: `linear-gradient(135deg, ${selectedSubject.accent}15, transparent)`, borderColor: `${selectedSubject.accent}30` }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">🧪</div>
              <div className="flex-1">
                <h3 className="font-montserrat font-black text-lg text-white mb-1">Что тебя ждёт?</h3>
                <p className="text-white/55 text-sm">Адаптивная диагностика + индивидуальный маршрут</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
              {[
                { icon: "🎯", label: "7 вопросов", desc: "по таксономии Блума" },
                { icon: "📊", label: "Анализ", desc: "найдём слабые места" },
                { icon: "🗺️", label: "Программа", desc: "4–6 модулей" },
                { icon: "🎮", label: "Задания", desc: "не повторяются" },
              ].map(f => (
                <div key={f.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <p className="text-white text-xs font-bold">{f.label}</p>
                  <p className="text-white/40 text-xs">{f.desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={onStart}
              disabled={!selectedGrade || isLoading}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${selectedSubject.accent}, ${selectedSubject.accent}cc)`, boxShadow: `0 4px 24px ${selectedSubject.accent}40` }}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  ИИ готовит вопросы...
                </>
              ) : (
                <>
                  <Icon name="Play" size={16} />
                  Начать диагностику
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
