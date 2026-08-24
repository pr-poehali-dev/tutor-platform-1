import Icon from "@/components/ui/icon";
import { OrderRequest } from "./api";

interface Props {
  req: OrderRequest;
  onChange: (patch: Partial<OrderRequest>) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

const LEVELS = ["С нуля", "Кое-что знаю", "Есть опыт", "Продвинутый"];
const TIMES = ["1–2 часа в неделю", "3–5 часов", "6–10 часов", "Больше 10 часов"];
const FORMATS = ["Видео и текст", "Живые занятия", "Практика с наставником", "Не важно"];
const DEADLINES = ["Не спешу", "За месяц", "За 2–3 месяца", "Срочно"];

const inputCls =
  "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors";

function Chips({
  options,
  value,
  onPick,
}: {
  options: string[];
  value?: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onPick(active ? "" : o)}
            className={`px-3.5 py-2 rounded-xl text-sm border transition-all ${
              active
                ? "bg-purple-500/20 border-purple-400/50 text-white font-semibold"
                : "bg-white/[0.04] border-white/10 text-white/70 hover:border-white/25"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function OrderForm({ req, onChange, onSubmit, loading, error }: Props) {
  const canSubmit = req.topic.trim().length >= 3 && !loading;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6">
        <div>
          <label className="block mb-2">
            <span className="text-white font-semibold">Чему хотите научиться?</span>
            <span className="text-red-300 ml-1">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="Например: продвижение кофейни в соцсетях"
            value={req.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            maxLength={300}
          />
        </div>

        <div>
          <label className="block mb-2">
            <span className="text-white font-semibold">Зачем это нужно?</span>
            <span className="text-white/45 text-sm ml-2">Какой результат хотите получить</span>
          </label>
          <textarea
            className={`${inputCls} min-h-[100px] resize-y`}
            placeholder="Открыл кофейню, клиентов мало. Хочу сам вести соцсети и приводить гостей, не нанимая агентство."
            value={req.goal || ""}
            onChange={(e) => onChange({ goal: e.target.value })}
            maxLength={1500}
          />
        </div>

        <div>
          <label className="block mb-2 text-white font-semibold">Ваш уровень сейчас</label>
          <Chips options={LEVELS} value={req.level} onPick={(v) => onChange({ level: v })} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-white font-semibold">Сколько времени готовы уделять</label>
            <Chips options={TIMES} value={req.time_per_week} onPick={(v) => onChange({ time_per_week: v })} />
          </div>
          <div>
            <label className="block mb-2 text-white font-semibold">Когда нужен результат</label>
            <Chips options={DEADLINES} value={req.deadline_pref} onPick={(v) => onChange({ deadline_pref: v })} />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-white font-semibold">Удобный формат</label>
          <Chips options={FORMATS} value={req.format_pref} onPick={(v) => onChange({ format_pref: v })} />
        </div>

        <div>
          <label className="block mb-2">
            <span className="text-white font-semibold">Что ещё важно знать?</span>
          </label>
          <textarea
            className={`${inputCls} min-h-[90px] resize-y`}
            placeholder="Любые детали: чего боитесь, что уже пробовали, какие материалы нужны."
            value={req.details || ""}
            onChange={(e) => onChange({ details: e.target.value })}
            maxLength={2000}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
          <Icon name="TriangleAlert" size={16} />
          {error}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-4 rounded-2xl hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Icon name="LoaderCircle" size={18} className="animate-spin" />
            Подбираем программу…
          </>
        ) : (
          <>
            <Icon name="Sparkles" size={18} />
            Подобрать курс под мой запрос
          </>
        )}
      </button>
      <p className="text-center text-white/45 text-sm">
        Бесплатно и без регистрации. Программу увидите сразу.
      </p>
    </div>
  );
}