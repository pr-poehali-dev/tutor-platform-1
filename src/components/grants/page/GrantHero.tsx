import Icon from "@/components/ui/icon";

interface Props {
  priceRub: number | null;
}

export default function GrantHero({ priceRub }: Props) {
  return (
    <section className="text-center mb-8">
      <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
        <Icon name="Sparkles" size={12} className="text-violet-300" />
        <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">ИИ-помощник по грантам</span>
      </div>
      <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
        Заявка на грант{" "}
        <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">за считанные минуты</span>
      </h1>
      <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto">
        Опишите грант и свой проект — ИИ-эксперт подготовит профессиональную заявку: актуальность, цели, задачи,
        смету, календарный план и разбор по критериям. Черновик — бесплатно.
      </p>
      <div className="inline-flex items-center gap-2 mt-5 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5">
        <Icon name="Sparkles" size={13} className="text-emerald-300" />
        <span className="text-sm text-white/75">
          Черновик и оценка шансов — <span className="text-emerald-300 font-bold">бесплатно</span>
          {priceRub != null && (
            <>
              {" · "}полный пакет — <span className="text-white font-bold">{priceRub.toLocaleString("ru-RU")} ₽</span>
            </>
          )}
        </span>
      </div>
    </section>
  );
}
