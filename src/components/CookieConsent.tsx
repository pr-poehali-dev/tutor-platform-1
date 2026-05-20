import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "cookie-consent-v1";

type Choice = "accepted" | "rejected" | null;

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Choice;
    if (!saved) {
      // Показываем баннер с небольшой задержкой, чтобы не мешать первой загрузке
      const t = setTimeout(() => setVisible(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (choice: Exclude<Choice, null>) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
      localStorage.setItem(`${STORAGE_KEY}-date`, new Date().toISOString());
    } catch {
      /* localStorage может быть недоступен */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] p-3 md:p-5 pointer-events-none animate-fade-in">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-card/95 backdrop-blur-xl border border-white/15 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden">

          {/* Top gradient */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500" />

          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-5 md:items-start">

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                🍪
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-montserrat font-black text-white text-base md:text-lg mb-1.5">
                  Мы используем cookie
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  Для работы сервиса и сохранения твоего прогресса. Продолжая пользоваться платформой, ты соглашаешься с обработкой данных в соответствии с{" "}
                  <Link to="/legal/privacy" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                    Политикой конфиденциальности
                  </Link>{" "}
                  (152-ФЗ).
                </p>

                {expanded && (
                  <div className="mt-4 space-y-3 text-xs animate-fade-in">
                    <div className="bg-white/4 border border-white/8 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="ShieldCheck" size={13} className="text-green-400" />
                        <span className="font-bold text-white">Необходимые (всегда включены)</span>
                      </div>
                      <p className="text-white/55 leading-relaxed">Сохранение сессии, настроек интерфейса, прогресса обучения. Без них сервис не работает.</p>
                    </div>
                    <div className="bg-white/4 border border-white/8 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="BarChart3" size={13} className="text-cyan-400" />
                        <span className="font-bold text-white">Аналитические (по согласию)</span>
                      </div>
                      <p className="text-white/55 leading-relaxed">Помогают понимать, как улучшить курсы. Данные обезличены, не передаются третьим лицам в идентифицируемой форме.</p>
                    </div>
                    <p className="text-white/40 leading-relaxed">
                      Отказ от cookie возможен в настройках браузера. При отказе от аналитических cookie часть функций может работать ограниченно. Согласие можно отозвать в любой момент.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 text-white/45 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  {expanded ? "Свернуть" : "Подробнее о cookie"}
                  <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={12} />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
              <button
                onClick={() => save("accepted")}
                className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Icon name="Check" size={15} />
                Принять все
              </button>
              <button
                onClick={() => save("rejected")}
                className="flex-1 bg-white/8 border border-white/15 text-white/85 hover:bg-white/12 text-sm font-bold py-3 rounded-xl transition-colors"
              >
                Только необходимые
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
