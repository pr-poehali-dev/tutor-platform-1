import Icon from "@/components/ui/icon";

export const IDEA_MAX = 5000;

export const LOADING_STEPS = [
  "Анализирую грант и критерии оценки…",
  "Формулирую актуальность и цели…",
  "Собираю задачи, команду и календарный план…",
  "Готовлю смету и проверку по критериям…",
];

export const EXAMPLES = [
  "Фонд президентских грантов",
  "ФСИ «Старт»",
  "Росмолодёжь.Гранты",
  "Грант на культурный проект",
];

interface Props {
  loading: boolean;
  step: number;
  grantName: string;
  setGrantName: (v: string) => void;
  projectIdea: string;
  setProjectIdea: (v: string) => void;
  organization: string;
  setOrganization: (v: string) => void;
  grantAmount: string;
  setGrantAmount: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  extra: string;
  setExtra: (v: string) => void;
  showMore: boolean;
  setShowMore: (fn: (v: boolean) => boolean) => void;
  error: string | null;
  priceRub: number | null;
  submit: () => void;
}

export default function GrantForm({
  loading,
  step,
  grantName,
  setGrantName,
  projectIdea,
  setProjectIdea,
  organization,
  setOrganization,
  grantAmount,
  setGrantAmount,
  region,
  setRegion,
  deadline,
  setDeadline,
  extra,
  setExtra,
  showMore,
  setShowMore,
  error,
  priceRub,
  submit,
}: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 max-w-2xl mx-auto">
      {loading ? (
        <div className="py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-5">
            <Icon name="Loader2" size={28} className="text-violet-300 animate-spin" />
          </div>
          <div className="font-montserrat font-bold text-lg text-white mb-4">Готовлю вашу заявку…</div>
          <div className="space-y-2 max-w-sm mx-auto text-left">
            {LOADING_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-sm transition-all ${i <= step ? "text-white/85" : "text-white/30"}`}>
                <Icon
                  name={i < step ? "CircleCheck" : i === step ? "Loader2" : "Circle"}
                  size={15}
                  className={i < step ? "text-emerald-400" : i === step ? "text-violet-300 animate-spin" : "text-white/25"}
                />
                {s}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-5">Обычно занимает 20–50 секунд</p>
        </div>
      ) : (
        <>
          <label className="block text-white/70 text-sm font-medium mb-2">На какой грант или конкурс?</label>
          <input
            value={grantName}
            onChange={(e) => setGrantName(e.target.value)}
            placeholder="Например: Фонд президентских грантов"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 mb-3"
          />
          <div className="flex flex-wrap gap-1.5 mb-5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setGrantName(ex)}
                className="text-xs bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg px-2.5 py-1 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>

          <label className="block text-white/70 text-sm font-medium mb-2">Расскажите о проекте</label>
          <textarea
            value={projectIdea}
            onChange={(e) => setProjectIdea(e.target.value.slice(0, IDEA_MAX))}
            rows={4}
            maxLength={IDEA_MAX}
            placeholder="Что за проект, какую проблему решает, для кого, что планируете сделать…"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 resize-y mb-1"
          />
          <div className="text-right text-xs text-white/35 mb-3">{projectIdea.length} / {IDEA_MAX}</div>

          <button
            onClick={() => setShowMore((v) => !v)}
            className="text-sm text-violet-300 hover:text-violet-200 inline-flex items-center gap-1 mb-3"
          >
            <Icon name={showMore ? "ChevronUp" : "ChevronDown"} size={14} />
            {showMore ? "Скрыть детали" : "Добавить детали (точнее заявка)"}
          </button>

          {showMore && (
            <div className="space-y-3 mb-4">
              <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Заявитель: НКО, ИП, компания, физлицо" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50" />
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} placeholder="Запрашиваемая сумма" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50" />
                <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Регион" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50" />
              </div>
              <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Срок подачи / дедлайн" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50" />
              <textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={2} placeholder="Особые требования площадки / критерии (если знаете)" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 resize-y" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3.5 py-2.5 mb-3">
              <p className="text-rose-200 text-sm">{error}</p>
              <button
                onClick={submit}
                className="flex-shrink-0 text-xs font-bold text-white bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/30 rounded-lg px-3 py-1.5 transition-colors"
              >
                Повторить
              </button>
            </div>
          )}

          <button
            onClick={submit}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 rounded-xl hover:scale-[1.01] transition-transform"
          >
            <Icon name="Wand2" size={18} /> Подготовить заявку
          </button>
          <p className="text-white/40 text-xs text-center mt-3">
            Черновик и оценка шансов — бесплатно.
            {priceRub != null
              ? ` Полный пакет — ${priceRub.toLocaleString("ru-RU")} ₽, дешевле рынка в десятки раз.`
              : " Полный пакет — по желанию, дешевле рынка."}
          </p>
        </>
      )}
    </section>
  );
}
