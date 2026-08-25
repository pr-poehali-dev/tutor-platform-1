import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitFeedback } from "@/components/contact/api";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const GRADES = ["1–4 класс", "5–9 класс", "10–11 класс", "Взрослый"];
const GOALS = ["Подтянуть предмет", "Подготовка к ЕГЭ", "Подготовка к ОГЭ", "Помощь с домашкой"];

const inputCls =
  "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors";

function Chips({
  options,
  value,
  onPick,
}: {
  options: string[];
  value: string;
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

export default function PricingLeadForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [grade, setGrade] = useState("");
  const [goal, setGoal] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmail = contact.includes("@");
  const isPhone = /[\d\s+\-()]{7,}/.test(contact) && !isEmail;

  const submit = async () => {
    if (loading) return;
    if (name.trim().length < 2) return setError("Укажите имя");
    if (!isEmail && !isPhone) return setError("Укажите email или телефон для связи");

    setLoading(true);
    setError(null);

    const lines = [
      "ЗАЯВКА: РЕПЕТИТОР ПО ПОДПИСКЕ",
      grade ? `Класс: ${grade}` : "",
      goal ? `Задача: ${goal}` : "",
      comment.trim() ? `Комментарий: ${comment.trim()}` : "",
    ].filter(Boolean);

    const res = await submitFeedback({
      contact_name: name.trim(),
      contact_email: isEmail ? contact.trim() : undefined,
      contact_phone: isPhone ? contact.trim() : undefined,
      subject: "general",
      message: lines.join("\n"),
    });

    setLoading(false);
    if (!res.ok) return setError(res.message || "Не удалось отправить");
    trackGoal("lead_form_success", { form_type: "pricing" });
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.08] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <Icon name="Check" size={30} className="text-emerald-300" />
        </div>
        <h3 className="font-montserrat font-black text-2xl text-white mb-2">Заявка принята!</h3>
        <p className="text-white/70 leading-relaxed">
          Мы свяжемся с вами в течение рабочего дня, подберём предметы и поможем начать.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-montserrat font-black text-2xl text-white mb-2">
        Не уверены, что подойдёт?
      </h3>
      <p className="text-white/60 mb-6">
        Оставьте заявку — поможем выбрать между подпиской и разовой покупкой, ответим на вопросы.
      </p>

      <div className="space-y-5">
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className={inputCls}
            placeholder="Как вас зовут *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={160}
          />
          <input
            className={inputCls}
            placeholder="Email или телефон *"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={200}
          />
        </div>

        <div>
          <div className="text-white/80 text-sm font-semibold mb-2">Кто будет заниматься</div>
          <Chips options={GRADES} value={grade} onPick={setGrade} />
        </div>

        <div>
          <div className="text-white/80 text-sm font-semibold mb-2">Что нужно</div>
          <Chips options={GOALS} value={goal} onPick={setGoal} />
        </div>

        <textarea
          className={`${inputCls} min-h-[80px] resize-y`}
          placeholder="Комментарий (необязательно)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 flex items-center gap-2">
          <Icon name="TriangleAlert" size={15} />
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full mt-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Icon name="LoaderCircle" size={17} className="animate-spin" />
            Отправляем…
          </>
        ) : (
          "Получить консультацию"
        )}
      </button>
      <p className="text-white/35 text-xs text-center mt-3">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных
      </p>
    </div>
  );
}
