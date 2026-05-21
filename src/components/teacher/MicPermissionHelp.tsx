import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

type Device = "ios" | "android" | "desktop";

interface MicPermissionHelpProps {
  open: boolean;
  onClose: () => void;
}

const TABS: { id: Device; label: string; icon: string }[] = [
  { id: "ios", label: "iPhone / iPad", icon: "Apple" },
  { id: "android", label: "Android", icon: "Smartphone" },
  { id: "desktop", label: "Компьютер", icon: "Monitor" },
];

const STEPS: Record<Device, { title: string; text: string }[]> = {
  ios: [
    { title: "Открой адресную строку Safari", text: "Нажми на иконку «АА» слева от адреса учисьпро.рф." },
    { title: "Выбери «Настройки веб-сайта»", text: "Появится меню с настройками текущего сайта." },
    { title: "Найди пункт «Микрофон»", text: "Переключи в режим «Разрешить»." },
    { title: "Обнови страницу", text: "Потяни сверху вниз или нажми кнопку перезагрузки." },
    { title: "Если не помогло", text: "Открой Настройки iPhone → Safari → Микрофон → разреши учисьпро.рф." },
  ],
  android: [
    { title: "Нажми на замочек в адресной строке", text: "Слева от адреса сайта учисьпро.рф." },
    { title: "Открой «Разрешения»", text: "Появится список того, что сайт может использовать." },
    { title: "Найди «Микрофон»", text: "Переключи на «Разрешить»." },
    { title: "Обнови страницу", text: "Нажми кнопку перезагрузки в браузере." },
    { title: "Если не помогло", text: "Настройки телефона → Приложения → Браузер → Разрешения → Микрофон." },
  ],
  desktop: [
    { title: "Найди замочек слева от адреса", text: "В адресной строке рядом со ссылкой учисьпро.рф." },
    { title: "Открой «Настройки сайта»", text: "Или «Разрешения» — зависит от браузера." },
    { title: "Найди «Микрофон»", text: "Переключи на «Разрешить»." },
    { title: "Обнови страницу", text: "Нажми F5 или Ctrl+R / Cmd+R." },
    { title: "Если микрофон занят", text: "Закрой Zoom, Discord, Skype и другие программы со звонками." },
  ],
};

function detectDevice(): Device {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export default function MicPermissionHelp({ open, onClose }: MicPermissionHelpProps) {
  const defaultDevice = useMemo(detectDevice, []);
  const [device, setDevice] = useState<Device>(defaultDevice);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const steps = STEPS[device];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-white/10 rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-white/8 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/40 flex items-center justify-center">
              <Icon name="Mic" size={20} className="text-purple-300" />
            </div>
            <div>
              <h3 className="font-montserrat font-bold text-white text-base leading-tight">
                Как разрешить микрофон
              </h3>
              <p className="text-white/50 text-xs mt-0.5">5 простых шагов</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-2 mb-6 bg-white/5 p-1 rounded-2xl">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDevice(tab.id)}
                className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                  device === tab.id
                    ? "bg-purple-500/30 text-white shadow-lg border border-purple-500/40"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon name={tab.icon} size={18} />
                <span className="leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>

          <ol className="flex flex-col gap-3">
            {steps.map((step, idx) => (
              <li
                key={idx}
                className="flex gap-3 p-3 rounded-2xl bg-white/4 border border-white/8 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-montserrat font-bold text-white text-sm shadow-lg">
                  {idx + 1}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="font-medium text-white text-sm leading-snug">{step.title}</p>
                  <p className="text-white/55 text-xs mt-1 leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex gap-2.5">
            <Icon name="Info" size={16} className="text-blue-300 flex-shrink-0 mt-0.5" />
            <p className="text-blue-200/90 text-xs leading-relaxed">
              Сайт ни в коем случае не записывает звук без твоей команды — микрофон работает только пока ты держишь кнопку записи.
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-montserrat font-bold text-sm transition-all shadow-lg shadow-purple-500/30"
          >
            Понятно, попробую
          </button>
        </div>
      </div>
    </div>
  );
}
