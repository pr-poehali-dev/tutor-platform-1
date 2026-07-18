import Icon from "@/components/ui/icon";

const STEPS = [
  { icon: "ClipboardCheck", emoji: "📝", title: "Пройди тест", text: "Наставник задаёт 8 вопросов и честно измеряет твой уровень" },
  { icon: "ScanSearch", emoji: "🔍", title: "Увидь пробелы", text: "ИИ находит слабые темы и объясняет, почему они провалились" },
  { icon: "Route", emoji: "🗺️", title: "Получи план", text: "Персональная программа под твои пробелы — модуль за модулем" },
  { icon: "TrendingUp", emoji: "📈", title: "Дойди до цели", text: "Наставник ведёт по плану, повторяет темы и хвалит за прогресс" },
];

export default function TutorMentorIntro() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-4 pb-2 text-center">
      <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
        <Icon name="Sparkles" size={14} className="text-purple-300" />
        <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Твой наставник · строит план сам</span>
      </div>

      <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white leading-tight">
        Не знаешь, с чего начать? <span className="gradient-text-purple">Наставник подскажет</span>
      </h2>
      <p className="text-white/65 text-sm md:text-lg mt-4 max-w-2xl mx-auto">
        Он проверит, что ты уже знаешь, найдёт пробелы и составит персональный план обучения именно под тебя.
        Дальше просто идёшь по шагам — и видишь реальный результат.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-left">
        {STEPS.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-white/10 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-montserrat font-black text-white text-sm">
                {i + 1}
              </span>
              <span className="text-xl">{s.emoji}</span>
            </div>
            <h3 className="font-bold text-white text-sm">{s.title}</h3>
            <p className="text-white/55 text-xs mt-1 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
