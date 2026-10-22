import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { simApi } from "../api";

type Stats = Awaited<ReturnType<typeof simApi.stats>>;

/** Аналитика автора: баллы, кто прошёл и шаги, где чаще всего ошибаются. */
export default function StatsPanel({ slug, editKey }: { slug: string; editKey: string }) {
  const [data, setData] = useState<Stats | null>(null);
  const [group, setGroup] = useState("");

  useEffect(() => {
    simApi.stats(slug, editKey).then(setData);
  }, [slug, editKey]);

  if (!data) return <p className="flex items-center gap-2 text-sm text-white/50"><Icon name="Loader2" size={14} className="animate-spin" /> Загружаем…</p>;
  if (!data.ok) return <p className="text-sm text-rose-300">{data.error}</p>;

  const s = data.summary;
  const maxErr = Math.max(1, ...data.heat.map((h) => h.errors));
  const groups = Array.from(new Set(data.runs.map((r) => r.group).filter(Boolean))) as string[];
  const runs = data.runs.filter((r) => !group || r.group === group);

  if (!s.runs)
    return (
      <div className="rounded-xl bg-white/5 p-4 text-sm text-white/60">
        Пока никто не прошёл. Отправьте ученикам ссылку — результаты появятся здесь сразу после прохождения.
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Прохождений", s.runs],
          ["Сдали", `${s.passed} (${Math.round((s.passed / s.runs) * 100)}%)`],
          ["Средний балл", s.avg_score],
          ["Среднее время", `${Math.floor(s.avg_duration / 60)}:${String(s.avg_duration % 60).padStart(2, "0")}`],
        ].map(([l, v]) => (
          <div key={String(l)} className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-black">{v}</p>
            <p className="text-xs text-white/50">{l}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Где ошибаются</p>
        <div className="space-y-1.5">
          {data.heat.map((h, i) => (
            <div key={h.step} className="text-xs">
              <div className="mb-0.5 flex justify-between text-white/70">
                <span className="truncate">
                  {i + 1}. {h.title}
                </span>
                <span className="shrink-0 pl-2">
                  {h.errors} ош.{h.avg_time != null ? ` · ${h.avg_time} с` : ""}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-white/10">
                <div
                  className={`h-full ${h.errors / maxErr > 0.66 ? "bg-rose-500" : h.errors / maxErr > 0.33 ? "bg-amber-400" : "bg-emerald-500"}`}
                  style={{ width: `${(h.errors / maxErr) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Ученики</p>
          {groups.length > 0 && (
            <select value={group} onChange={(e) => setGroup(e.target.value)} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
              <option value="" className="bg-slate-900">Все группы</option>
              {groups.map((g) => (
                <option key={g} value={g} className="bg-slate-900">
                  {g}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {runs.map((r, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5 text-xs">
              <span className={`w-8 shrink-0 text-center font-bold ${r.passed ? "text-emerald-300" : "text-rose-300"}`}>{r.score}</span>
              <span className="min-w-0 flex-1 truncate">{r.student || "Без имени"}</span>
              {r.group && <span className="text-white/45">{r.group}</span>}
              <span className="text-white/35">{new Date(r.at).toLocaleDateString("ru-RU")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
