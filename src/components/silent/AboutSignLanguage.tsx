import Icon from "@/components/ui/icon";

const FACTS = [
  {
    icon: "Languages",
    title: "Это отдельный язык",
    text: "Русский жестовый язык (РЖЯ) — самостоятельный язык со своей лексикой и грамматикой. Жест состоит из трёх частей: конфигурации руки, положения в пространстве и движения.",
  },
  {
    icon: "Smile",
    title: "Лицо — часть жеста",
    text: "В РЖЯ важна не только рука, но и мимика, губы, наклон головы. Смотри на лицо человека — оно меняет смысл жеста.",
  },
  {
    icon: "SpellCheck2",
    title: "Дактиль — буквы руками",
    text: "Дактильная азбука: каждой букве соответствует своя фигура пальцев (дактилема). Ею показывают слова по буквам — например, имя, когда нет отдельного жеста.",
  },
  {
    icon: "ShieldCheck",
    title: "Государственный язык",
    text: "С 2012 года РЖЯ получил официальный статус в России и государственную поддержку. На нём общаются сотни тысяч людей.",
  },
];

export default function AboutSignLanguage() {
  return (
    <section className="mb-14">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-400/30 rounded-full px-3.5 py-1 mb-3">
          <Icon name="BookOpen" size={13} className="text-cyan-300" />
          <span className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider">
            О жестовом языке
          </span>
        </div>
        <h2 className="font-montserrat font-black text-3xl md:text-4xl mb-2">
          Немного о РЖЯ — коротко и честно
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Чтобы учиться было понятнее — несколько важных фактов о русском жестовом языке.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {FACTS.map((f) => (
          <div key={f.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-purple-500/25 flex items-center justify-center flex-shrink-0">
              <Icon name={f.icon} size={22} className="text-white" fallback="Info" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-1">{f.title}</h3>
              <p className="text-white/65 text-sm leading-relaxed">{f.text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-white/40 text-xs text-center mt-5 max-w-2xl mx-auto">
        Описания жестов в курсе — учебные, для визуальной опоры. Точный жест лучше проверить
        у носителя РЖЯ или в официальном видеословаре.
      </p>
    </section>
  );
}
