import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Section, P, Callout, Quiz } from "./AnalysisPrimitives";
import { AnalysisData } from "./types";

export default function AnalysisContent({ data }: { data: AnalysisData }) {
  return (
    <article className="min-w-0 space-y-14">
      {/* О произведении */}
      <Section id="about" icon="BookOpen" title="О произведении">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {data.facts.map((row) => (
            <div key={row.k} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">{row.k}</div>
              <div className="text-white/90 font-medium">{row.v}</div>
            </div>
          ))}
        </div>
        {data.aboutParagraphs.map((t, i) => (
          <P key={i}>{t}</P>
        ))}
      </Section>

      {/* История создания */}
      <Section id="history" icon="ScrollText" title="История создания">
        {data.historyParagraphs.map((t, i) => (
          <P key={i}>{t}</P>
        ))}
        {data.historyCallout && (
          <Callout icon="Quote" tone="amber" title={data.historyCallout.title}>
            {data.historyCallout.text}
          </Callout>
        )}
      </Section>

      {/* Сюжет */}
      <Section id="plot" icon="ListOrdered" title="Сюжет по действиям">
        <P className="mb-6">{data.plotIntro}</P>
        <div className="space-y-4">
          {data.acts.map((a) => (
            <div key={a.act} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 pl-16">
              <div className="absolute left-4 top-5 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-rose-500/20 border border-amber-400/30 flex items-center justify-center font-montserrat font-black text-amber-300">
                {a.act}
              </div>
              <h4 className="font-montserrat font-bold text-white text-lg mb-1.5">{a.title}</h4>
              <p className="text-white/65 leading-relaxed text-[15px]">{a.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Герои */}
      <Section id="heroes" icon="Users" title="Система образов">
        <P className="mb-6">{data.heroesIntro}</P>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.heroes.map((h) => (
            <div key={h.name} className={`rounded-2xl border p-4 ${h.color}`}>
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-montserrat font-black text-base">{h.name}</span>
                <span className="text-[11px] uppercase tracking-wider opacity-70">{h.role}</span>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">{h.trait}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Темы */}
      <Section id="themes" icon="Lightbulb" title="Темы и проблемы">
        <div className="grid sm:grid-cols-2 gap-4">
          {data.themes.map((th) => (
            <div key={th.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mb-3">
                <Icon name={th.icon} size={18} className="text-amber-300" />
              </div>
              <h4 className="font-montserrat font-bold text-white mb-1.5">{th.title}</h4>
              <p className="text-white/65 text-sm leading-relaxed">{th.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Композиция */}
      <Section id="composition" icon="Layers" title="Композиция и приёмы">
        <P>{data.compositionIntro}</P>
        <div className="grid sm:grid-cols-2 gap-4 my-6">
          {data.devices.map((c) => (
            <div key={c.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h4 className="font-montserrat font-bold text-amber-200 mb-1.5">{c.t}</h4>
              <p className="text-white/65 text-sm leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Цитаты */}
      <Section id="quotes" icon="Quote" title="Цитаты с разбором">
        <div className="space-y-4">
          {data.quotes.map((q, i) => (
            <figure key={i} className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.06] to-transparent p-6">
              <Icon name="Quote" size={22} className="text-amber-400/60 mb-3" />
              <blockquote className="font-montserrat font-bold text-white text-lg md:text-xl leading-snug mb-2">
                {q.text}
              </blockquote>
              <figcaption className="text-amber-300/80 text-sm font-medium mb-3">— {q.who}</figcaption>
              <p className="text-white/65 text-sm leading-relaxed border-t border-white/10 pt-3">{q.note}</p>
            </figure>
          ))}
        </div>
      </Section>

      {/* Смысл */}
      <Section id="meaning" icon="Sparkles" title="Смысл произведения и финал">
        {data.meaningParagraphs.map((t, i) => (
          <P key={i}>{t}</P>
        ))}
        {data.meaningCallout && (
          <Callout icon="Heart" tone="rose" title={data.meaningCallout.title}>
            {data.meaningCallout.text}
          </Callout>
        )}
      </Section>

      {/* Экзамен */}
      <Section id="exam" icon="GraduationCap" title="Подготовка к экзамену">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 mb-5">
          <h4 className="font-montserrat font-bold text-emerald-200 mb-3 flex items-center gap-2">
            <Icon name="PenLine" size={18} /> Аргументы для сочинения
          </h4>
          <ul className="space-y-2.5">
            {data.examArguments.map((a) => (
              <li key={a} className="flex items-start gap-2.5 text-white/75 text-[15px]">
                <Icon name="Check" size={16} className="text-emerald-400 mt-1 shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h4 className="font-montserrat font-bold text-white mb-3 flex items-center gap-2">
            <Icon name="HelpCircle" size={18} className="text-amber-300" /> Частые темы сочинений
          </h4>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {data.examTopics.map((t) => (
              <div key={t} className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/75 text-sm">{t}</div>
            ))}
          </div>
        </div>
      </Section>

      {/* Тест */}
      <Section id="test" icon="CircleCheck" title="Проверь себя">
        <Quiz items={data.quiz} />
      </Section>

      {/* CTA — продукт */}
      <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.08] via-rose-500/[0.05] to-transparent p-7 md:p-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 text-xs font-bold uppercase tracking-wider mb-5">
          <Icon name="Sparkles" size={14} />
          Учись глубже
        </div>
        <h3 className="font-montserrat font-black text-2xl md:text-3xl mb-3">
          Понравился разбор? Это лишь начало.
        </h3>
        <p className="text-white/70 max-w-xl mx-auto mb-7">
          На УЧИСЬПРО — разборы всей школьной классики, подготовка к ЕГЭ и ОГЭ, личный ИИ-наставник и тренажёры. Учись легко и поступай уверенно.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-[#0b1020] font-black text-sm hover:opacity-90 transition-opacity"
          >
            <Icon name="Rocket" size={16} />
            Открыть платформу
          </Link>
          <Link
            to="/feed"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/8 hover:bg-white/15 text-white font-bold text-sm transition-colors"
          >
            <Icon name="BookOpen" size={16} />
            Другие разборы
          </Link>
        </div>
      </div>
    </article>
  );
}
