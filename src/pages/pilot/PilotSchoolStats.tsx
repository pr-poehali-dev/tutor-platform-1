import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SchoolKit from "@/components/pilot/SchoolKit";
import { mySchool, pilotApi } from "@/components/pilot/api";

type Stats = Awaited<ReturnType<typeof pilotApi.stats>>;

/** Личная страница ответственного: сколько учеников подключилось, по классам и дням, плюс все материалы. */
export default function PilotSchoolStats() {
  const [params] = useSearchParams();
  const code = params.get("c") || "";
  const key = params.get("k") || "";
  const [data, setData] = useState<Stats | null>(null);
  const [showKit, setShowKit] = useState(false);

  useEffect(() => {
    pilotApi.stats(code, key).then((r) => {
      setData(r);
      if (r.ok) {
        mySchool.set(r.school);
        // Пока учеников нет, главное для ответственного — ссылка и тексты: показываем их сразу.
        if (r.total === 0) setShowKit(true);
      }
    });
  }, [code, key]);

  const maxClass = Math.max(1, ...(data?.ok ? data.classes.map((c) => c.count) : [1]));
  const maxDay = Math.max(1, ...(data?.ok ? data.days.map((d) => d.count) : [1]));

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Статистика школы — пилотный проект УЧИСЬПРО" description="Сколько учеников подключилось" noindex />
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg">🎓</div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <span className="text-sm text-white/50">Кабинет школы</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8">
        {!data ? (
          <div className="flex h-60 items-center justify-center text-white/60">
            <Icon name="Loader2" size={24} className="mr-2 animate-spin" /> Загружаем…
          </div>
        ) : !data.ok ? (
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <Icon name="Lock" size={32} className="mx-auto mb-3 text-white/50" />
            <p className="mb-1 font-bold">Ссылка недействительна</p>
            <p className="mb-4 text-sm text-white/60">Откройте ссылку из подтверждения подключения или подключите школу заново — ссылки останутся прежними.</p>
            <Link to="/podklyuchit-shkolu" className="font-bold text-cyan-200 hover:underline">
              Подключить школу
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-white/50">{data.school.city_name}</p>
              <h1 className="font-montserrat text-2xl font-black md:text-3xl">{data.school.school_name}</h1>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-montserrat text-3xl font-black text-cyan-200">{data.total}</p>
                <p className="text-sm text-white/60">учеников подключилось</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-montserrat text-3xl font-black text-emerald-300">+{data.week}</p>
                <p className="text-sm text-white/60">за последние 7 дней</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:col-span-1">
                <p className="font-montserrat text-3xl font-black">{data.classes.filter((c) => c.label !== "Не указан").length}</p>
                <p className="text-sm text-white/60">классов участвуют</p>
              </div>
            </div>

            {data.total === 0 ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
                <p className="mb-1 font-bold">Пока никто не подключился</p>
                <p className="mb-3 text-sm text-white/70">
                  Отправьте классным руководителям ссылку <b>{data.school.student_label}</b> и готовый текст для чатов — обычно первые ученики
                  появляются в течение дня.
                </p>
                <button onClick={() => setShowKit(true)} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold hover:bg-white/20">
                  Открыть тексты и QR-код
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="mb-3 font-bold">По классам</p>
                  <div className="space-y-2">
                    {data.classes.map((c) => (
                      <div key={c.label} className="flex items-center gap-3 text-sm">
                        <span className="w-20 shrink-0 text-white/75">{c.label}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded bg-white/10">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${(c.count / maxClass) * 100}%` }} />
                        </div>
                        <span className="w-8 text-right font-bold">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="mb-3 font-bold">По дням (30 дней)</p>
                  <div className="flex h-32 items-end gap-1">
                    {data.days.map((d) => (
                      <div key={d.day} className="flex-1" title={`${new Date(d.day).toLocaleDateString("ru-RU")}: ${d.count}`}>
                        <div className="rounded-t bg-cyan-400/80" style={{ height: `${Math.max(6, (d.count / maxDay) * 120)}px` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
              <Icon name="ShieldCheck" size={15} className="mr-1 inline text-emerald-300" />
              Мы показываем только количество учеников по классам — без имён и контактов. Итоговый отчёт по школе пришлём в июне 2027.
            </div>

            <div>
              <button onClick={() => setShowKit((v) => !v)} className="mb-4 flex items-center gap-2 font-bold text-cyan-200 hover:text-white">
                <Icon name={showKit ? "ChevronUp" : "ChevronDown"} size={18} /> Ссылка, QR-код и тексты для чатов
              </button>
              {showKit && <SchoolKit school={data.school} existing />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
