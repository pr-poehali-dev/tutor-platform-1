import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { kidsApi, ParentControls } from "./kidsApi";

interface Props {
  onClose: () => void;
}

const AGE_BANDS: { id: ParentControls["childAgeBand"]; label: string; sanpin: number }[] = [
  { id: "1-2", label: "1–2 года", sanpin: 0 },
  { id: "2-3", label: "2–3 года", sanpin: 5 },
  { id: "3-4", label: "3–4 года", sanpin: 10 },
  { id: "4-5", label: "4–5 лет", sanpin: 15 },
  { id: "5-6", label: "5–6 лет", sanpin: 20 },
  { id: "6-7", label: "6–7 лет", sanpin: 25 },
];

/** Полные настройки родительского контроля + согласие 436-ФЗ. */
export default function ParentSettingsModal({ onClose }: Props) {
  const [controls, setControls] = useState<ParentControls | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    kidsApi.getControls()
      .then(setControls)
      .catch(() => setControls(null))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof ParentControls>(k: K, v: ParentControls[K]) => {
    setControls((c) => (c ? { ...c, [k]: v } : c));
  };

  const handleAgeChange = (band: ParentControls["childAgeBand"]) => {
    const sanpin = AGE_BANDS.find((a) => a.id === band)?.sanpin || 15;
    setControls((c) => (c ? { ...c, childAgeBand: band, sanpinLimit: sanpin, dailyLimitMinutes: Math.min(c.dailyLimitMinutes, sanpin) } : c));
  };

  const save = async () => {
    if (!controls) return;
    if (newPin) {
      if (newPin.length < 4 || newPin.length > 6) { setPinError("PIN: от 4 до 6 цифр"); return; }
      if (newPin !== confirmPin) { setPinError("PIN не совпадает"); return; }
    }
    setSaving(true);
    setPinError(null);
    try {
      await kidsApi.setControls({ ...controls, ...(newPin ? { pin: newPin } : {}) });
      setSaved(true);
      setNewPin("");
      setConfirmPin("");
      const fresh = await kidsApi.getControls();
      setControls(fresh);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setPinError("Не удалось сохранить. Проверь интернет.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !controls) {
    return (
      <div className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card border border-white/15 rounded-2xl p-8 text-white/60">Загрузка...</div>
      </div>
    );
  }

  const currentBand = AGE_BANDS.find((a) => a.id === controls.childAgeBand) || AGE_BANDS[3];

  return (
    <div className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-white/15 rounded-3xl max-w-lg w-full my-8">
        <div className="sticky top-0 bg-card border-b border-white/10 rounded-t-3xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Settings" size={22} className="text-purple-300" />
            <h2 className="font-montserrat font-black text-white text-lg">Настройки родителя</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <Icon name="X" size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Возраст ребёнка */}
          <div>
            <label className="text-white/80 text-sm font-bold mb-2 block">Возраст ребёнка</label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_BANDS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleAgeChange(a.id)}
                  className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                    controls.childAgeBand === a.id
                      ? "bg-purple-500/20 border-purple-400/60 text-purple-200"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Лимит экранного времени */}
          <div>
            <label className="text-white/80 text-sm font-bold mb-2 block">
              Лимит экранного времени в день
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-white text-3xl font-black">{controls.dailyLimitMinutes}</span>
                <span className="text-white/55 text-sm">мин/день</span>
              </div>
              <input
                type="range"
                min={0}
                max={currentBand.sanpin}
                step={1}
                value={controls.dailyLimitMinutes}
                onChange={(e) => update("dailyLimitMinutes", parseInt(e.target.value, 10))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-white/35 mt-1">
                <span>0 мин</span>
                <span>{currentBand.sanpin} мин (СанПиН)</span>
              </div>
              <p className="text-white/45 text-[11px] mt-3 leading-relaxed">
                Норматив СанПиН 2.4.3648-20 для возраста {currentBand.label}: до {currentBand.sanpin} минут непрерывной работы с экраном.
              </p>
            </div>
          </div>

          {/* Режим «Перед сном» */}
          <div>
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-white/80 text-sm font-bold">Режим «Перед сном»</span>
              <button
                onClick={() => update("bedtimeLockEnabled", !controls.bedtimeLockEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  controls.bedtimeLockEnabled ? "bg-purple-500" : "bg-white/15"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    controls.bedtimeLockEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
            {controls.bedtimeLockEnabled && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-white/50 text-[11px] block mb-1">С</label>
                  <input
                    type="time"
                    value={controls.bedtimeFrom}
                    onChange={(e) => update("bedtimeFrom", e.target.value)}
                    className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-[11px] block mb-1">До</label>
                  <input
                    type="time"
                    value={controls.bedtimeTo}
                    onChange={(e) => update("bedtimeTo", e.target.value)}
                    className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Блокировка покупок */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white/80 text-sm font-bold">Блокировать покупки без PIN</p>
              <p className="text-white/45 text-[11px]">Ребёнок не сможет купить курсы случайно</p>
            </div>
            <button
              onClick={() => update("blockPurchases", !controls.blockPurchases)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                controls.blockPurchases ? "bg-purple-500" : "bg-white/15"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  controls.blockPurchases ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>

          {/* PIN-код */}
          <div className="border-t border-white/10 pt-5">
            <label className="text-white/80 text-sm font-bold mb-2 block flex items-center gap-2">
              <Icon name="KeyRound" size={16} className="text-purple-300" />
              {controls.hasPin ? "Изменить PIN" : "Установить PIN (4-6 цифр)"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Новый PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                className="bg-black/30 border border-white/15 rounded-lg px-3 py-2.5 text-white text-center tracking-[0.3em]"
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Повтори PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                className="bg-black/30 border border-white/15 rounded-lg px-3 py-2.5 text-white text-center tracking-[0.3em]"
              />
            </div>
            {pinError && <p className="text-red-400 text-xs mt-2">{pinError}</p>}
          </div>

          {/* Согласие 436-ФЗ */}
          <label className="flex items-start gap-3 cursor-pointer bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <input
              type="checkbox"
              checked={controls.consent436fz}
              onChange={(e) => update("consent436fz", e.target.checked)}
              className="mt-1 w-4 h-4 accent-emerald-500"
            />
            <span className="text-white/70 text-[11px] leading-relaxed">
              Я родитель/законный представитель и даю согласие на использование ребёнком образовательного модуля согласно <b className="text-white/90">436-ФЗ «О защите детей от информации»</b> и <b className="text-white/90">152-ФЗ «О персональных данных»</b>.
              {controls.consentDate && (
                <span className="block text-emerald-300/70 mt-1">
                  Согласие дано: {new Date(controls.consentDate).toLocaleDateString("ru-RU")}
                </span>
              )}
            </span>
          </label>

          {/* Кнопка сохранить */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm disabled:opacity-50"
          >
            {saved ? "✓ Сохранено" : saving ? "Сохранение..." : "Сохранить настройки"}
          </button>

          <p className="text-white/30 text-[10px] text-center">
            Платформа работает по 273-ФЗ «Об образовании», 152-ФЗ, 436-ФЗ. Все данные хранятся согласно требованиям РФ.
          </p>
        </div>
      </div>
    </div>
  );
}
