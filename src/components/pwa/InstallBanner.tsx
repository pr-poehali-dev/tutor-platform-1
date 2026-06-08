import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import useInstallPrompt from "@/hooks/useInstallPrompt";

const DISMISS_KEY = "uchispro_install_dismissed_v1";
const APP_ICON = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/565c75c2-6b6a-4efd-99f6-86ab094c6cb4.jpg";

/** Ненавязчивый баннер «Установить приложение» внизу экрана.
 *  Показывается, если установка доступна, приложение не установлено и
 *  пользователь не закрывал баннер. Не мешает на странице /app. */
export default function InstallBanner() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (isInstalled || !canInstall || dismissed || location.pathname === "/app") {
    return null;
  }

  return (
    <div className="fixed bottom-3 inset-x-3 z-[90] md:left-auto md:right-4 md:max-w-sm animate-fade-in-up">
      <div className="bg-card/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-purple-500/20 p-3.5 flex items-center gap-3">
        <img src={APP_ICON} alt="УЧИСЬПРО" className="w-11 h-11 rounded-xl flex-shrink-0 border border-white/10" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Установи приложение</p>
          <p className="text-white/55 text-xs">Быстрее, удобнее, работает офлайн</p>
        </div>
        <button
          onClick={() => promptInstall()}
          className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
        >
          Установить
        </button>
        <button
          onClick={close}
          aria-label="Закрыть"
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors flex-shrink-0"
        >
          <Icon name="X" size={15} />
        </button>
      </div>
    </div>
  );
}
