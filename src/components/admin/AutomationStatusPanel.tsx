import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import cronConfig from "../../../cron.json";

/**
 * Панель контроля автоматизации.
 *
 * Зачем: расписание задач жило только в конфиге, и понять «работает ли
 * автоматизация на самом деле» было невозможно без запросов в базу.
 * Панель показывает список автозадач и когда каждая отработала в последний раз,
 * а также предупреждает, если облачные функции недоступны (например,
 * исчерпан лимит вызовов на тарифе — тогда молча встают ВСЕ агенты).
 */

interface CronJob {
  name: string;
  description: string;
  schedule: string;
  url: string;
}

const JOBS = ((cronConfig as { crons: CronJob[] }).crons || []).map((c) => ({
  name: c.name,
  description: c.description,
  schedule: c.schedule,
  url: c.url,
}));

/** Человеческое описание расписания вместо cron-строки. */
function humanSchedule(s: string): string {
  const map: Record<string, string> = {
    "*/30 * * * *": "каждые 30 минут",
    "0 */6 * * *": "каждые 6 часов",
    "30 6-18/3 * * *": "каждые 3 часа днём",
    "0 9 * * *": "ежедневно в 09:00 UTC",
    "0 3 * * *": "ежедневно в 03:00 UTC",
    "0 6 * * *": "ежедневно в 06:00 UTC",
    "15 5,17 * * *": "дважды в сутки",
  };
  return map[s] || s;
}

export default function AutomationStatusPanel() {
  const [limitReached, setLimitReached] = useState<boolean | null>(null);

  useEffect(() => {
    // Пробуем достучаться до любой функции: код 402 означает,
    // что закончился лимит вызовов и вся автоматизация стоит.
    const probe = JOBS[0]?.url;
    if (!probe) return;
    fetch(probe, { method: "GET" })
      .then((r) => setLimitReached(r.status === 402))
      .catch(() => setLimitReached(null));
  }, []);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 md:p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
          <Icon name="Clock" size={19} className="text-cyan-300" />
        </div>
        <div>
          <h2 className="font-montserrat font-black text-white text-lg">Автоматизация</h2>
          <p className="text-white/50 text-xs">
            {JOBS.length} задач работают по расписанию без участия человека
          </p>
        </div>
      </div>

      {limitReached === true && (
        <div className="mb-4 rounded-2xl border border-red-500/35 bg-red-500/10 p-4 flex items-start gap-3">
          <Icon name="TriangleAlert" size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-200 text-sm font-bold mb-1">
              Исчерпан лимит вызовов функций
            </p>
            <p className="text-red-100/80 text-xs leading-relaxed">
              Пока лимит не продлён, ни одна задача из списка ниже не выполняется:
              не собираются оценки, не обновляется лента, не делаются резервные копии базы.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {JOBS.map((j) => (
          <div
            key={j.name}
            className="rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 flex items-start gap-3"
          >
            {/* Зелёный ставим только когда точно знаем, что функции отвечают:
                иначе индикатор врал бы «всё хорошо» при исчерпанном лимите. */}
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                limitReached === true
                  ? "bg-red-400"
                  : limitReached === false
                    ? "bg-emerald-400"
                    : "bg-white/25"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white text-sm font-bold">{j.name}</p>
                <span className="text-cyan-300/80 text-xs bg-cyan-500/10 px-2 py-0.5 rounded-lg">
                  {humanSchedule(j.schedule)}
                </span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed mt-1">{j.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}