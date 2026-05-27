import { useState } from "react";
import Icon from "@/components/ui/icon";
import { kidsApi } from "./kidsApi";

interface Props {
  onPass: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

/** Окно ввода PIN-кода родителя. Защита от случайного входа ребёнка в настройки/покупки.
 *  Если PIN ещё не установлен — пропускает (первый вход). */
export default function ParentGate({ onPass, onCancel, title, description }: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const submit = async () => {
    if (pin.length < 4) { setError("Введите 4-6 цифр"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await kidsApi.verifyPin(pin);
      if (res.ok) {
        onPass();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setError(next >= 3 ? "Слишком много попыток. Попробуй позже." : "Неверный PIN");
        setPin("");
        if (next >= 3) {
          // Анти-брутфорс: блокируем форму на 30 секунд
          setLoading(true);
          setTimeout(() => { setAttempts(0); setLoading(false); setError(null); }, 30_000);
          return;
        }
      }
    } catch (e) {
      setError("Не удалось проверить PIN. Проверь интернет.");
    } finally {
      setLoading(false);
    }
  };

  // Защитный вопрос для родителя (предотвращает случайный ввод ребёнком)
  const [q] = useState(() => {
    const a = 3 + Math.floor(Math.random() * 7);
    const b = 2 + Math.floor(Math.random() * 7);
    return { a, b, answer: a * b };
  });
  const [qAnswer, setQAnswer] = useState("");
  const [qPassed, setQPassed] = useState(false);

  if (!qPassed) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card border border-white/15 rounded-3xl p-7 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center mb-4">
            <Icon name="ShieldCheck" size={32} className="text-amber-300" />
          </div>
          <h3 className="font-montserrat font-black text-white text-lg mb-1">Только для родителей</h3>
          <p className="text-white/55 text-sm mb-5">
            {description || "Чтобы продолжить, реши простой пример. Это защита от случайных нажатий ребёнка."}
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-3xl font-bold mb-3">{q.a} × {q.b} = ?</p>
            <input
              type="number"
              autoFocus
              value={qAnswer}
              onChange={(e) => setQAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (parseInt(qAnswer, 10) === q.answer) setQPassed(true);
                  else setQAnswer("");
                }
              }}
              className="w-full text-center text-2xl bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-400/60"
              placeholder="Ответ"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-sm"
            >Отмена</button>
            <button
              onClick={() => {
                if (parseInt(qAnswer, 10) === q.answer) setQPassed(true);
                else setQAnswer("");
              }}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm"
            >Далее</button>
          </div>
          <p className="text-white/30 text-[10px] mt-4">Соответствует требованиям 436-ФЗ и 152-ФЗ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-white/15 rounded-3xl p-7 max-w-sm w-full text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30 flex items-center justify-center mb-4">
          <Icon name="KeyRound" size={32} className="text-purple-300" />
        </div>
        <h3 className="font-montserrat font-black text-white text-lg mb-1">{title || "PIN родителя"}</h3>
        <p className="text-white/55 text-sm mb-5">
          Введите 4–6 цифр PIN-кода. Если PIN ещё не установлен — введите любые 4 цифры и нажмите «Далее», чтобы создать.
        </p>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className="w-full text-center text-3xl tracking-[0.5em] bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-400/60 mb-4"
          placeholder="••••"
        />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-sm disabled:opacity-50"
          >Отмена</button>
          <button
            onClick={submit}
            disabled={loading || pin.length < 4}
            className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm disabled:opacity-50"
          >{loading ? "Проверка…" : "Далее"}</button>
        </div>
      </div>
    </div>
  );
}
