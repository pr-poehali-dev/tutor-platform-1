import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

const WEBHOOK_URL = "https://functions.poehali.dev/245bdf64-011e-43dd-b49e-6cd2202c03f7";
const RETURN_URL_BASE = "https://xn--h1agdcde2c.xn--p1ai";

interface Step {
  id: string;
  title: string;
  intro: string;
  actions: { label: string; hint?: string; code?: string }[];
  warning?: string;
}

const STEPS: Step[] = [
  {
    id: "1",
    title: "Отзови старый ключ (срочно)",
    intro: "Ключ, который ты прислал в чат, виден в истории — его нужно отозвать. Это занимает 30 секунд.",
    actions: [
      { label: "Зайди в личный кабинет ЮKassa", hint: "yookassa.ru → войти" },
      { label: "Открой раздел «Интеграция» → «Ключи API»" },
      { label: "У старого ключа нажми «Отозвать»", hint: "после этого старый ключ перестанет работать" },
    ],
    warning: "Без этого шага деньги могут уйти не тебе.",
  },
  {
    id: "2",
    title: "Выпусти новый секретный ключ",
    intro: "После отзыва старого нужно создать новый — он будет использоваться сайтом для приёма платежей.",
    actions: [
      { label: "В том же разделе нажми «Выпустить ключ»" },
      { label: "Выбери «Боевой» (live), если магазин подтверждён", hint: "или «Тестовый» — для проверки без реальных списаний" },
      { label: "Скопируй ключ полностью (начинается на live_ или test_)" },
    ],
    warning: "Ключ показывается ОДИН раз. Сразу вставь его в окошко секрета на этой платформе.",
  },
  {
    id: "3",
    title: "Включи приём чеков (54-ФЗ)",
    intro: "Без этого ЮKassa не пропустит платёж — по закону нужен чек покупателю.",
    actions: [
      { label: "Раздел «Настройки» → «Чеки (54-ФЗ)»" },
      { label: "Подключи онлайн-кассу или партнёрский сервис", hint: "ЮKassa предлагает встроенные варианты: «Атол Онлайн», «Бизнес.Ру», «МодульКасса»" },
      { label: "В реквизитах укажи систему налогообложения", hint: "это нужно для корректного формирования чеков" },
    ],
  },
  {
    id: "4",
    title: "Настрой HTTP-уведомления (вебхук)",
    intro: "Так платформа узнаёт об успешной оплате и моментально открывает доступ к курсу.",
    actions: [
      { label: "Раздел «Интеграция» → «HTTP-уведомления»" },
      { label: "Нажми «Добавить URL»" },
      { label: "Вставь адрес уведомлений:", code: WEBHOOK_URL },
      { label: "Отметь события:", hint: "payment.succeeded и payment.canceled (минимум). Можно также refund.succeeded — для возвратов." },
      { label: "Сохрани и нажми «Тестовое уведомление»", hint: "должен прийти статус 200 OK — значит вебхук работает" },
    ],
  },
  {
    id: "5",
    title: "Проверь Shop ID",
    intro: "Shop ID уже добавлен на платформу, но проверь — он должен совпадать с тем, что в кабинете.",
    actions: [
      { label: "В шапке кабинета увидишь номер магазина" },
      { label: "Он должен быть числом (например, 1234567)" },
      { label: "Если на платформе другой — обнови секрет YOOKASSA_SHOP_ID" },
    ],
  },
  {
    id: "6",
    title: "Сделай тестовый платёж",
    intro: "Финальная проверка — что всё работает с реальными картами.",
    actions: [
      { label: "Открой каталог:", code: `${RETURN_URL_BASE}/courses` },
      { label: "Выбери любой курс и нажми «Купить»" },
      { label: "Оплати 1 рубль тестовой картой ЮKassa", hint: "номер 5555 5555 5555 4444, любой срок, CVC 123" },
      { label: "Вернись на сайт — должен открыться доступ к курсу" },
    ],
    warning: "Если доступ не открылся — проверь логи вебхука в ЮKassa: должен быть статус 200.",
  },
];

export default function YookassaSetup() {
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleDone = (id: string) => {
    setDoneSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      /* noop */
    }
  };

  const progress = Math.round((doneSteps.size / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Настройка ЮKassa — УЧИСЬПРО (для администратора)"
        description="Пошаговая инструкция подключения приёма платежей через ЮKassa."
        noindex
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 137.5) % 100) + "%",
              top: ((i * 97.3) % 100) + "%",
              opacity: 0.1 + (i % 4) * 0.06,
            }}
          />
        ))}
      </div>

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">Админ · Настройка</span>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16">
        <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          На главную
        </Link>

        {/* Hero */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-5">
          <Icon name="CreditCard" size={14} className="text-emerald-300" />
          <span className="text-sm text-emerald-200 font-semibold uppercase tracking-wider">Платежи · ЮKassa</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Настройка <span className="gradient-text-purple">за 5 минут</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mb-8">
          Шесть простых шагов — и сайт начнёт принимать реальные платежи. Отмечай шаги галочками по мере выполнения.
        </p>

        {/* Progress */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/70 text-sm font-semibold">Прогресс</p>
            <p className="text-white font-montserrat font-black text-xl">{progress}%</p>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/45 text-xs mt-2">
            {doneSteps.size === STEPS.length
              ? "Готово! Платежи подключены."
              : `Осталось шагов: ${STEPS.length - doneSteps.size}`}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step) => {
            const done = doneSteps.has(step.id);
            return (
              <div
                key={step.id}
                className={`bg-card border rounded-3xl p-5 md:p-6 transition-all ${
                  done ? "border-emerald-500/40 bg-emerald-500/[0.03]" : "border-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleDone(step.id)}
                    className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center font-montserrat font-black text-base transition-all ${
                      done
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white scale-105"
                        : "bg-white/8 border border-white/15 text-white/65 hover:bg-white/12"
                    }`}
                    aria-label={done ? "Сбросить шаг" : "Отметить выполненным"}
                  >
                    {done ? <Icon name="Check" size={20} /> : step.id}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-montserrat font-black text-lg md:text-xl text-white mb-1.5 transition-opacity ${done ? "opacity-60" : ""}`}>
                      {step.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">{step.intro}</p>

                    <ol className="space-y-2.5 mb-3">
                      {step.actions.map((a, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/55 font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-white/85 text-sm leading-relaxed">{a.label}</p>
                            {a.hint && (
                              <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{a.hint}</p>
                            )}
                            {a.code && (
                              <div className="mt-2 flex items-center gap-2 bg-background/60 border border-white/10 rounded-xl pl-3 pr-2 py-2">
                                <code className="text-purple-200 text-xs font-mono flex-1 truncate">{a.code}</code>
                                <button
                                  onClick={() => copy(a.code!, `${step.id}-${idx}`)}
                                  className="inline-flex items-center gap-1 bg-white/8 hover:bg-white/15 border border-white/15 text-white/85 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  <Icon name={copiedKey === `${step.id}-${idx}` ? "Check" : "Copy"} size={12} />
                                  {copiedKey === `${step.id}-${idx}` ? "Скопировано" : "Копировать"}
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>

                    {step.warning && (
                      <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5">
                        <Icon name="TriangleAlert" size={16} className="text-amber-300 flex-shrink-0 mt-0.5" />
                        <p className="text-amber-200/90 text-xs leading-relaxed">{step.warning}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final box */}
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-purple-500/15 to-cyan-500/15 border border-purple-500/30 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Rocket" size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-xl text-white mb-2">После всех шагов</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Платежи заработают автоматически. Покупки появятся в личном кабинете пользователя, доступ к курсу откроется в течение 10–30 секунд после оплаты (зависит от скорости вебхука ЮKassa).
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-background/40 border border-white/10 rounded-2xl p-3">
                  <Icon name="ShieldCheck" size={18} className="text-emerald-300 mb-2" />
                  <p className="text-white text-xs font-bold mb-1">54-ФЗ</p>
                  <p className="text-white/55 text-[11px] leading-snug">Чеки формируются автоматически</p>
                </div>
                <div className="bg-background/40 border border-white/10 rounded-2xl p-3">
                  <Icon name="RefreshCw" size={18} className="text-cyan-300 mb-2" />
                  <p className="text-white text-xs font-bold mb-1">Возвраты</p>
                  <p className="text-white/55 text-[11px] leading-snug">Через личный кабинет ЮKassa</p>
                </div>
                <div className="bg-background/40 border border-white/10 rounded-2xl p-3">
                  <Icon name="Lock" size={18} className="text-purple-300 mb-2" />
                  <p className="text-white text-xs font-bold mb-1">Безопасность</p>
                  <p className="text-white/55 text-[11px] leading-snug">Ключи только на сервере</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-white/45 text-xs">
          <a
            href="https://yookassa.ru/developers/payment-acceptance/getting-started/quick-start"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Документация ЮKassa
          </a>
          <span className="text-white/20">·</span>
          <a
            href="https://yookassa.ru/my/api-keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Ключи API
          </a>
          <span className="text-white/20">·</span>
          <a
            href="https://yookassa.ru/my/integration/http-notifications"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            HTTP-уведомления
          </a>
        </div>
      </div>
    </div>
  );
}
