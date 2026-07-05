import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Скрытый административный хаб.
 * Доступ — по PIN, который хранится в localStorage.
 * Здесь собраны все внутренние инструменты, которых не должно быть в подвале сайта.
 */

const PIN_KEY = "uchispro_admin_pin_v1";
const ADMIN_PIN = "7777"; // PIN по умолчанию (можно поменять через .env при необходимости)

interface Section {
  group: string;
  items: { label: string; path: string; icon: string; description: string; external?: boolean }[];
}

const SECTIONS: Section[] = [
  {
    group: "Отдел продаж",
    items: [
      { label: "Заявки для бизнеса", path: "/admin/leads", icon: "Inbox", description: "Заявки со страницы «Для бизнеса»: статусы, контакты и заметки менеджера" },
      { label: "Выплаты школам", path: "/admin/payouts", icon: "Wallet", description: "Заявки на вывод, реестр начислений и доля школ к выплате" },
      { label: "Заявки на гранты", path: "/admin/grants", icon: "Target", description: "ИИ-помощник по грантам: все заявки, оплаты и выручка" },
      { label: "Дашборд продаж", path: "/admin/sales", icon: "BarChart3", description: "KPI, выручка, воронка, конверсия и динамика по дням" },
      { label: "База клиентов", path: "/admin/sales", icon: "Users", description: "Поиск по email/телефону, сегменты, LTV, история покупок" },
    ],
  },
  {
    group: "Отдел маркетинга",
    items: [
      { label: "Стратегия и аналитика", path: "/admin/marketing", icon: "Target", description: "SWOT, воронка, когорты, RFM-сегменты, идеи роста и план на месяц" },
      { label: "ИИ-стратег", path: "/admin/marketing", icon: "Brain", description: "Глубокий анализ от GPT с рекомендациями и расчётом эффекта в ₽" },
      { label: "Задачи отделу продаж", path: "/admin/marketing", icon: "ClipboardList", description: "Создание и контроль задач: прозвон лидов, реактивация, кампании" },
    ],
  },
  {
    group: "Маркетинг и продвижение",
    items: [
      { label: "Канал в MAX", path: "/admin/max-channel", icon: "Send", description: "ИИ-агент канала: посты, конкурсы с призами, статистика и автопилот" },
      { label: "Промо-ролики для соцсетей", path: "/promo/video", icon: "Clapperboard", description: "Генерация видеообзоров с озвучкой для VK, TikTok, YouTube Shorts" },
      { label: "Акция ДОБРО", path: "/promo/dobro", icon: "Heart", description: "Лендинг бесплатной акции до 15.06" },
      { label: "Рекламные кампании", path: "/admin/ads", icon: "Megaphone", description: "Управление UTM, креативами и лендингами" },
    ],
  },
  {
    group: "Состояние платформы",
    items: [
      { label: "Статус систем", path: "/status", icon: "Activity", description: "Здоровье бэкенда, БД, S3, очередей" },
      { label: "Здоровье сайта", path: "/admin/site-health", icon: "HeartPulse", description: "Метрики, ошибки фронта, скорость" },
    ],
  },
  {
    group: "Контент и курсы",
    items: [
      { label: "Контент курсов", path: "/admin/courses-content", icon: "BookOpen", description: "Редактирование уроков и модулей" },
      { label: "Видео-студия", path: "/admin/video-studio", icon: "Film", description: "Генерация видеоуроков" },
      { label: "Движок оживления Ксюши", path: "/admin/ksusha-engine", icon: "Sparkles", description: "Генерация говорящих роликов маскота одной кнопкой" },
      { label: "Лаборатория ИИ", path: "/admin/ai-lab", icon: "Atom", description: "Эволюция и обучение моделей" },
      { label: "Лента (модерация)", path: "/admin/feed", icon: "Newspaper", description: "Управление статьями в ленте" },
    ],
  },
  {
    group: "Платежи",
    items: [
      { label: "ЮKassa: настройка", path: "/admin/yookassa-setup", icon: "Wallet", description: "Webhook, ключи, диагностика" },
    ],
  },
];

export default function AdminHub() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY);
    if (saved === ADMIN_PIN) setUnlocked(true);
  }, []);

  const tryUnlock = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(PIN_KEY, pin);
      setUnlocked(true);
      setError("");
    } else {
      setError("Неверный PIN");
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <Helmet>
          <title>Админ-зона</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Card className="w-full max-w-sm border border-white/10 bg-white/[0.03] p-7">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <Icon name="Lock" size={22} className="text-white/80" />
          </div>
          <h1 className="font-montserrat text-xl font-black text-center mb-2">Админ-зона</h1>
          <p className="text-white/55 text-sm text-center mb-5">Введи PIN для входа</p>
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
            className="text-center font-mono tracking-widest"
          />
          {error && <p className="text-rose-400 text-xs text-center mt-2">{error}</p>}
          <Button onClick={tryUnlock} className="w-full mt-4 bg-gradient-to-r from-purple-500 to-cyan-500">
            Войти
          </Button>
          <Link to="/" className="block text-center text-white/40 text-xs mt-4 hover:text-white/70">
            На главную
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Админ-хаб · УЧИСЬПРО</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-white/40 text-xs mb-1">Внутренний раздел</div>
            <h1 className="font-montserrat text-3xl md:text-4xl font-black">Админ-хаб</h1>
            <p className="text-white/55 text-sm mt-1">Все инструменты управления платформой в одном месте</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(PIN_KEY);
              localStorage.removeItem(PIN_KEY);
              setUnlocked(false);
            }}
            className="text-white/55 hover:text-white"
          >
            <Icon name="LogOut" size={14} className="mr-1.5" />
            Выйти
          </Button>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.group}>
              <h2 className="font-montserrat text-sm font-bold uppercase tracking-wider text-white/45 mb-3">
                {section.group}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.items.map((item, idx) => (
                  <Link key={`${section.group}-${item.label}-${idx}`} to={item.path}>
                    <Card className="border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all p-4 h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <Icon name={item.icon} size={18} className="text-purple-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-white mb-0.5">{item.label}</div>
                          <div className="text-white/50 text-xs leading-snug">{item.description}</div>
                        </div>
                        <Icon name="ChevronRight" size={14} className="text-white/30 flex-shrink-0 mt-1" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/35 text-xs">
          <Link to="/" className="hover:text-white/60">← Вернуться на сайт</Link>
        </div>
      </div>
    </div>
  );
}