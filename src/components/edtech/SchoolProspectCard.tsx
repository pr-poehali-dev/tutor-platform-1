import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  SchoolProspect,
  ProspectStatus,
  STATUS_META,
  STATUS_ORDER,
  SERVICES,
  SEGMENT_META,
} from "./schoolCrmApi";

interface Props {
  school: SchoolProspect;
  onStatusChange: (id: number, status: ProspectStatus) => void;
  onNoteSave: (id: number, note: string) => void;
  onServicesChange: (id: number, services: string[]) => void;
  saving?: boolean;
}

export default function SchoolProspectCard({
  school,
  onStatusChange,
  onNoteSave,
  onServicesChange,
  saving,
}: Props) {
  const [noteDraft, setNoteDraft] = useState(school.note);
  const [noteOpen, setNoteOpen] = useState(false);
  const seg = SEGMENT_META[school.segment] || SEGMENT_META.other;
  const noteDirty = noteDraft.trim() !== (school.note || "").trim();

  const toggleService = (id: string) => {
    const has = school.services_offered.includes(id);
    const next = has
      ? school.services_offered.filter((s) => s !== id)
      : [...school.services_offered, id];
    onServicesChange(school.id, next);
  };

  return (
    <div className="group relative flex flex-col bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/25 transition-all">
      <div className={`h-1.5 bg-gradient-to-r ${school.color}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Заголовок */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${school.color} flex items-center justify-center text-2xl flex-shrink-0`}
            aria-hidden="true"
          >
            {school.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-montserrat font-black text-white text-base leading-snug">
              {school.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-white/50 text-xs flex-wrap">
              <span className="inline-flex items-center gap-1">
                <span>{seg.emoji}</span>
                {seg.label}
              </span>
              {school.city && (
                <span className="inline-flex items-center gap-1">
                  <Icon name="MapPin" size={11} />
                  {school.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {school.fit_reason && (
          <p className="text-white/60 text-xs leading-relaxed mb-3">{school.fit_reason}</p>
        )}

        {/* Предметы */}
        {school.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {school.subjects.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-[11px] text-purple-200 bg-purple-500/10 border border-purple-500/25 rounded-lg px-2 py-0.5"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {school.contact_hint && (
          <p className="text-white/40 text-[11px] mb-3 inline-flex items-center gap-1.5">
            <Icon name="Search" size={11} />
            Где искать: {school.contact_hint}
          </p>
        )}

        {/* Статус — воронка */}
        <div className="mb-3">
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            Статус сделки
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_ORDER.map((st) => {
              const meta = STATUS_META[st];
              const active = school.status === st;
              return (
                <button
                  key={st}
                  onClick={() => onStatusChange(school.id, st)}
                  disabled={saving}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all disabled:opacity-50 ${
                    active
                      ? meta.tone
                      : "bg-white/5 border-white/10 text-white/45 hover:text-white"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? meta.dot : "bg-white/25"}`} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Услуги — что предложить */}
        <div className="mb-3">
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            Что предложить
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {SERVICES.map((sv) => {
              const on = school.services_offered.includes(sv.id);
              return (
                <button
                  key={sv.id}
                  onClick={() => toggleService(sv.id)}
                  disabled={saving}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1.5 rounded-lg border text-left transition-all disabled:opacity-50 ${
                    on
                      ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-100"
                      : "bg-white/5 border-white/10 text-white/45 hover:text-white"
                  }`}
                >
                  <Icon name={on ? "CheckSquare" : "Square"} size={13} />
                  <span className="leading-tight">{sv.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Заметка */}
        <div className="mt-auto">
          {!noteOpen && !school.note ? (
            <button
              onClick={() => setNoteOpen(true)}
              className="inline-flex items-center gap-1.5 text-white/45 hover:text-white text-xs transition-colors"
            >
              <Icon name="StickyNote" size={13} />
              Добавить заметку
            </button>
          ) : (
            <div>
              <textarea
                value={noteDraft}
                onFocus={() => setNoteOpen(true)}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Заметка менеджера: договорённости, контакты, следующий шаг…"
                rows={2}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-purple-500/40 resize-none"
              />
              {noteDirty && (
                <button
                  onClick={() => {
                    onNoteSave(school.id, noteDraft);
                    setNoteOpen(false);
                  }}
                  disabled={saving}
                  className="mt-1.5 inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-400/40 text-purple-100 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                  <Icon name="Check" size={12} />
                  Сохранить заметку
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
