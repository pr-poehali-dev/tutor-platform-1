import { useState } from "react";
import Icon from "@/components/ui/icon";
import useInstallPrompt from "@/hooks/useInstallPrompt";

interface Props {
  className?: string;
  size?: "md" | "lg";
}

/** Универсальная кнопка установки приложения.
 *  - Android/Desktop: запускает нативный диалог установки.
 *  - iOS: показывает инструкцию «Поделиться → На экран Домой».
 *  - Уже установлено: показывает статус. */
export default function InstallButton({ className = "", size = "lg" }: Props) {
  const { canInstall, isInstalled, platform, promptInstall } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  const pad = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm";

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-300 font-bold ${pad} ${className}`}>
        <Icon name="CircleCheck" size={20} />
        Приложение установлено
      </div>
    );
  }

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }
    // iOS и браузеры без beforeinstallprompt — показываем инструкцию
    setShowIosHint(true);
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2.5 rounded-2xl font-bold text-white shadow-xl shadow-purple-500/30 hover:opacity-90 active:scale-[0.98] transition-all bg-gradient-to-r from-purple-600 to-cyan-500 ${pad}`}
      >
        <Icon name="Download" size={20} />
        Установить приложение
      </button>

      {showIosHint && (
        <div className="max-w-sm rounded-2xl bg-white/[0.06] border border-white/15 p-4 text-left animate-fade-in">
          {platform === "ios" ? (
            <>
              <p className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                <Icon name="Share" size={16} className="text-cyan-300" /> Установка на iPhone / iPad
              </p>
              <ol className="text-white/75 text-sm space-y-1.5 list-decimal list-inside">
                <li>Нажми кнопку «Поделиться» внизу Safari</li>
                <li>Выбери «На экран «Домой»»</li>
                <li>Нажми «Добавить» — иконка появится на экране</li>
              </ol>
            </>
          ) : (
            <>
              <p className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                <Icon name="Info" size={16} className="text-cyan-300" /> Как установить
              </p>
              <p className="text-white/75 text-sm">
                Открой меню браузера (три точки) и выбери «Установить приложение»
                или «Добавить на главный экран». Если пункта нет — открой сайт
                в Chrome, Safari или Яндекс.Браузере.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
