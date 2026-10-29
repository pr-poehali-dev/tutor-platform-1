import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["learning-path"];

interface Run {
  step: string;
  lesson: string | null;
  result: string;
  before: number | null;
  after: number | null;
  at: string;
}

interface Status {
  lessons_total: number;
  lessons_reviewed: number;
  avg_score: number;
  lessons_good: number;
  lessons_improved: number;
  avg_gain: number;
  week: { accepted: number; rejected: number; reviewed: number };
  rules: number;
  recent: Run[];
}

const LABEL: Record<string, string> = {
  good: "проверен — хорошо",
  needs_work: "проверен — нужна доработка",
  candidate: "написана новая версия",
  accepted: "новая версия принята",
  rejected: "новая версия хуже — оставлен прежний",
  ai_error: "ИИ не ответил, повторит позже",
};

const STEP: Record<string, string> = { review: "Проверка", improve: "Улучшение", verdict: "Вердикт" };

export default function MethodistPanel() {
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "methodist_status" }),
    })
      .then((r) => r.json())
      .then((d) => d && typeof d.lessons_total === "number" && setS(d))
      .catch(() => {});
  }, []);

  const tiles = s
    ? [
        { label: "Средняя оценка уроков", value: s.lessons_reviewed ? `${s.avg_score}/100` : "—" },
        { label: "Проверено уроков", value: `${s.lessons_reviewed} из ${s.lessons_total}` },
        { label: "Улучшено уроков", value: s.lessons_improved },
        { label: "Правил методиста", value: s.rules },
      ]
    : [];

  return (
    <div className="bg-card/60 border border-white/10 rounded-3xl p-5 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="GraduationCap" size={18} className="text-purple-300" />
        <h2 className="font-montserrat font-black text-white text-lg">ИИ-методист: рост уровня уроков</h2>
      </div>
      <p className="text-white/55 text-sm mb-4">
        Круглосуточно: критик проверяет уроки, методист переписывает слабые, новая версия заменяет старую только если
        оценка выросла. Из каждого разбора выводится правило — его учитывают все новые уроки.
      </p>
      {!s ? (
        <p className="text-white/40 text-sm">Загружаю…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                <div className="text-white font-montserrat font-black text-xl">{t.value}</div>
                <div className="text-white/50 text-xs">{t.label}</div>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-xs mb-3">
            За 7 дней: проверено {s.week.reviewed}, принято улучшений {s.week.accepted}, отклонено {s.week.rejected}
            {s.avg_gain ? ` · средний прирост оценки +${s.avg_gain}` : ""}
          </p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {s.recent.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-white/[0.03] rounded-xl px-3 py-2">
                <span className="text-purple-200 font-bold w-20 flex-shrink-0">{STEP[r.step] || r.step}</span>
                <span className="text-white/80 flex-1 truncate">{r.lesson || "—"}</span>
                <span className={r.result === "accepted" ? "text-emerald-300" : r.result === "rejected" ? "text-amber-300" : "text-white/50"}>
                  {LABEL[r.result] || r.result}
                  {r.before != null && r.after != null ? ` (${r.before} → ${r.after})` : r.before != null ? ` (${r.before})` : ""}
                </span>
              </div>
            ))}
            {s.recent.length === 0 && <p className="text-white/40 text-xs">Методист ещё не начал работу.</p>}
          </div>
        </>
      )}
    </div>
  );
}
