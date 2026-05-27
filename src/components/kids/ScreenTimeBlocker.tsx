import { useState } from "react";
import Icon from "@/components/ui/icon";
import ParentGate from "./ParentGate";
import { ScreenTimeState } from "./kidsApi";

interface Props {
  state: ScreenTimeState;
  onOverride: () => void;
}

/** Полноэкранный блокировщик при достижении лимита экранного времени.
 *  Соблюдает СанПиН 2.4.3648-20. Родитель может разблокировать через PIN. */
export default function ScreenTimeBlocker({ state, onOverride }: Props) {
  const [gateOpen, setGateOpen] = useState(false);

  const isBedtime = state.reason === "bedtime";
  const title = isBedtime ? "Пора спать" : "Время вышло";
  const emoji = isBedtime ? "🌙" : "⏰";
  const desc = isBedtime
    ? "По правилам экран на ночь выключен. Спокойных снов!"
    : `Сегодня уже занимался ${state.minutesUsed} минут. По нормам СанПиН для твоего возраста — это полная норма.`;

  return (
    <>
      <div className="fixed inset-0 z-[300] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-8xl mb-6 animate-pulse">{emoji}</div>
          <h2 className="font-montserrat font-black text-white text-3xl mb-3">{title}</h2>
          <p className="text-white/70 text-base mb-6 leading-relaxed">{desc}</p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/55 text-xs">Сегодня</span>
              <span className="text-white font-bold text-sm">{state.minutesUsed} / {state.dailyLimit} мин</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-amber-400"
                style={{ width: `${Math.min(100, (state.minutesUsed / Math.max(1, state.dailyLimit)) * 100)}%` }}
              />
            </div>
            <p className="text-white/40 text-[10px] mt-2 leading-relaxed">
              Норматив по СанПиН 2.4.3648-20 для непрерывной работы дошкольника с экраном.
            </p>
          </div>

          <div className="grid gap-2">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm"
            >
              <Icon name="Home" size={16} className="inline mr-2" />
              На главную
            </button>
            <button
              onClick={() => setGateOpen(true)}
              className="w-full py-2 text-white/40 hover:text-white/70 text-xs"
            >
              Я родитель — разрешить ещё 10 минут
            </button>
          </div>
        </div>
      </div>

      {gateOpen && (
        <ParentGate
          title="Подтверждение родителя"
          description="Чтобы разрешить дополнительное экранное время, подтверди что ты — взрослый."
          onPass={() => { setGateOpen(false); onOverride(); }}
          onCancel={() => setGateOpen(false)}
        />
      )}
    </>
  );
}
