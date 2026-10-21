import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { HelperReport, helperApi } from "./api";

/** Отчёт: цифры бесплатно; вопросы без ответа и диалоги — в PRO. */
export default function HelperReportPanel({ id, onUpgrade, price }: { id: number; onUpgrade: () => void; price: number }) {
  const [rep, setRep] = useState<HelperReport | null>(null);

  useEffect(() => {
    helperApi.report(id).then((r) => r.ok && r.data && setRep(r.data));
  }, [id]);

  if (!rep) return <div className="py-8 text-center"><Icon name="Loader2" size={20} className="animate-spin mx-auto text-white/40" /></div>;
  const s = rep.summary;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Stat label="Вопросов за 30 дней" value={s.questions_30d} />
        <Stat label="Человек спрашивали" value={s.people_30d} />
        <Stat label="За неделю" value={s.questions_7d} />
        <Stat label="Без ответа в базе" value={s.missed_30d} warn={s.missed_30d > 0} />
      </div>

      {rep.is_pro ? (
        <>
          <div>
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Icon name="CircleHelp" size={16} className="text-amber-300" /> Чего не хватает в базе знаний
            </h4>
            {rep.missed && rep.missed.length ? (
              <ul className="space-y-1.5">
                {rep.missed.map((m, i) => (
                  <li key={i} className="flex justify-between gap-3 rounded-lg bg-amber-500/[0.07] border border-amber-400/20 px-3 py-2 text-sm">
                    <span>{m.question}</span>
                    <span className="text-amber-200/80 text-xs shrink-0">×{m.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">Пока все вопросы закрыты базой знаний.</p>
            )}
            <p className="text-xs text-white/45 mt-2">Допишите ответы на эти вопросы в базу знаний — помощник станет отвечать на них сам.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Последние диалоги</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {(rep.recent || []).map((d, i) => (
                <div key={i} className="rounded-lg bg-white/[0.04] border border-white/10 p-3 text-sm">
                  <p className="font-semibold">{d.question}</p>
                  <p className="text-white/65 mt-1 whitespace-pre-wrap">{d.answer}</p>
                  <p className="text-[11px] text-white/35 mt-1">{new Date(d.at).toLocaleString("ru-RU")}{!d.found && " · не нашёл в базе"}</p>
                </div>
              ))}
              {!rep.recent?.length && <p className="text-sm text-white/50">Диалогов пока нет — поделитесь ссылкой с клиентами.</p>}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-violet-400/30 bg-violet-500/[0.08] p-4">
          <p className="font-bold flex items-center gap-2"><Icon name="Lock" size={16} /> Полный отчёт — в PRO</p>
          <p className="text-sm text-white/65 mt-1">
            Список вопросов, на которые помощник не нашёл ответа, и все диалоги с клиентами. Видно, что спрашивают чаще всего и
            что дописать в базу — помощник становится умнее каждую неделю.
          </p>
          <button onClick={onUpgrade} className="mt-3 h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-semibold">
            Подключить PRO за {price} ₽ / 30 дней
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
      <p className={`font-montserrat font-black text-2xl ${warn ? "text-amber-300" : ""}`}>{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}
