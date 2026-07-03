import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import type { BuilderCourse, GenerateResult } from "./api";
import { printCoursePdf } from "@/lib/coursePdf";
import { useAuth } from "@/context/AuthContext";
import { saveCourseToSchool } from "@/components/school/api";

const LESSON_TYPE: Record<string, { label: string; color: string; icon: string }> = {
  theory: { label: "Теория", color: "text-sky-300 bg-sky-500/15", icon: "BookOpen" },
  practice: { label: "Практика", color: "text-amber-300 bg-amber-500/15", icon: "PenTool" },
  test: { label: "Проверка", color: "text-fuchsia-300 bg-fuchsia-500/15", icon: "ClipboardCheck" },
  project: { label: "Проект", color: "text-emerald-300 bg-emerald-500/15", icon: "Rocket" },
};

function typeMeta(t: string) {
  return LESSON_TYPE[t] || { label: "Урок", color: "text-white/60 bg-white/10", icon: "Circle" };
}

interface Props {
  result: GenerateResult;
  onRestart: () => void;
  onLead: () => void;
}

export default function CourseResult({ result, onRestart, onLead }: Props) {
  const c: BuilderCourse = result.course;
  const [openModule, setOpenModule] = useState<number>(0);
  const { isAuthenticated, openLogin } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [noAccess, setNoAccess] = useState(false);

  const saveToSchool = async () => {
    if (saving || saved) return;
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem("pending_school_course", JSON.stringify({ course: c, builderId: result.id }));
      } catch {
        /* ignore */
      }
      openLogin();
      return;
    }
    setSaving(true);
    setNoAccess(false);
    const res = await saveCourseToSchool(c, result.id);
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => navigate("/school"), 900);
    } else if (res.status === 403) {
      setNoAccess(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок курса */}
      <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-6 md:p-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1">
              <Icon name="Check" size={12} /> Курс готов
            </span>
            {result.is_fallback && (
              <span className="text-xs text-amber-300/80">черновой шаблон</span>
            )}
          </div>
          <button
            onClick={() => printCoursePdf(c)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white border border-white/15 hover:border-violet-400/50 rounded-xl px-3 py-1.5 transition-colors flex-shrink-0"
          >
            <Icon name="Download" size={15} /> <span className="hidden sm:inline">Скачать PDF</span>
          </button>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-2">{c.course_title}</h2>
        {c.tagline && <p className="text-violet-200/90 text-base md:text-lg mb-3">{c.tagline}</p>}
        <p className="text-white/70 text-sm md:text-base">{c.description}</p>

        <div className="flex flex-wrap gap-4 mt-5 text-sm">
          <span className="inline-flex items-center gap-2 text-white/70">
            <Icon name="Layers" size={15} className="text-violet-300" /> {result.modules_count} модулей
          </span>
          <span className="inline-flex items-center gap-2 text-white/70">
            <Icon name="GraduationCap" size={15} className="text-violet-300" /> {result.lessons_count} уроков
          </span>
          {c.estimated_hours > 0 && (
            <span className="inline-flex items-center gap-2 text-white/70">
              <Icon name="Clock" size={15} className="text-violet-300" /> ~{c.estimated_hours} ч
            </span>
          )}
        </div>
      </div>

      {/* Результаты обучения */}
      {c.outcomes?.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="font-montserrat font-bold text-lg text-white mb-3">Чему научит курс</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {c.outcomes.map((o, i) => (
              <div key={i} className="flex items-start gap-2 text-white/75 text-sm">
                <Icon name="CircleCheck" size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Программа */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-montserrat font-bold text-lg text-white mb-4">Программа курса</h3>
        <div className="space-y-3">
          {c.modules?.map((m, mi) => {
            const open = openModule === mi;
            return (
              <div key={mi} className="rounded-2xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenModule(open ? -1 : mi)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {mi + 1}
                    </span>
                    <span className="font-semibold text-white truncate">{m.title}</span>
                    <span className="text-white/40 text-xs flex-shrink-0">{m.lessons?.length || 0} ур.</span>
                  </div>
                  <Icon name="ChevronDown" size={16} className={`text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="p-3 space-y-2 bg-black/10">
                    {m.lessons?.map((l, li) => {
                      const tm = typeMeta(l.type);
                      return (
                        <div key={li} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${tm.color}`}>
                              <Icon name={tm.icon} size={11} /> {tm.label}
                            </span>
                            <span className="font-medium text-white text-sm">{l.title}</span>
                          </div>
                          {l.summary?.length > 0 && (
                            <ul className="text-white/60 text-xs space-y-1 mb-2 ml-1">
                              {l.summary.map((s, si) => (
                                <li key={si} className="flex gap-1.5"><span className="text-violet-400">•</span> {s}</li>
                              ))}
                            </ul>
                          )}
                          {l.task && (
                            <div className="text-xs text-white/70 bg-amber-500/8 border border-amber-500/15 rounded-lg px-2.5 py-1.5 mb-2">
                              <span className="text-amber-300 font-medium">Задание: </span>{l.task}
                            </div>
                          )}
                          {l.quiz?.q && (
                            <div className="text-xs text-white/70">
                              <span className="text-fuchsia-300 font-medium">Квиз: </span>{l.quiz.q}
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {l.quiz.options?.map((opt, oi) => (
                                  <span key={oi} className={`px-2 py-0.5 rounded-md border text-[11px] ${oi === l.quiz.correct ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-white/50"}`}>
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Маркетинг-пакет */}
      {c.marketing && (
        <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.05] p-6">
          <h3 className="font-montserrat font-bold text-lg text-white mb-1 flex items-center gap-2">
            <Icon name="Megaphone" size={18} className="text-cyan-300" /> Маркетинг-пакет для запуска
          </h3>
          <p className="text-white/50 text-xs mb-4">Готовые тексты, чтобы начать продавать сразу — этого нет у конкурентов.</p>

          {c.marketing.headlines?.length > 0 && (
            <div className="mb-4">
              <div className="text-white/45 text-xs uppercase tracking-wider mb-2">Заголовки для лендинга</div>
              <div className="space-y-1.5">
                {c.marketing.headlines.map((h, i) => (
                  <div key={i} className="text-white/80 text-sm bg-white/[0.04] rounded-lg px-3 py-2">{h}</div>
                ))}
              </div>
            </div>
          )}

          {c.marketing.social_posts?.length > 0 && (
            <div className="mb-4">
              <div className="text-white/45 text-xs uppercase tracking-wider mb-2">Посты для соцсетей</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {c.marketing.social_posts.map((p, i) => (
                  <div key={i} className="text-white/75 text-sm bg-white/[0.04] rounded-lg px-3 py-2">{p}</div>
                ))}
              </div>
            </div>
          )}

          {c.marketing.email_sequence?.length > 0 && (
            <div>
              <div className="text-white/45 text-xs uppercase tracking-wider mb-2">Email-цепочка запуска</div>
              <div className="space-y-1.5">
                {c.marketing.email_sequence.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm bg-white/[0.04] rounded-lg px-3 py-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-200 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-white/85 font-medium">{e.subject}</span>
                    <span className="text-white/45 text-xs">— {e.goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Бизнес-подсказки */}
      {c.business && (
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <Icon name="Tag" size={18} className="text-emerald-300 mb-2" />
            <div className="text-white/45 text-xs mb-1">Рекомендованная цена</div>
            <div className="text-white text-sm font-medium">{c.business.price_recommendation}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <Icon name="Star" size={18} className="text-amber-300 mb-2" />
            <div className="text-white/45 text-xs mb-1">Ваше УТП</div>
            <div className="text-white text-sm font-medium">{c.business.usp}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <Icon name="Radar" size={18} className="text-sky-300 mb-2" />
            <div className="text-white/45 text-xs mb-1">Где искать учеников</div>
            <div className="text-white text-sm font-medium">{(c.business.channels || []).join(", ")}</div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-500/15 to-cyan-500/10 p-6 md:p-8 text-center">
        <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">Нравится? Запустим вашу школу целиком</h3>
        <p className="text-white/70 text-sm mb-5 max-w-xl mx-auto">
          Это только демонстрация. На платформе ИИ соберёт весь курс с видео, подключит оплаты, ваш бренд и домен, и станет преподавателем для учеников 24/7.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={saveToSchool}
            disabled={saving || saved}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-70"
          >
            <Icon name={saved ? "Check" : saving ? "Loader2" : "FolderPlus"} size={18} className={saving ? "animate-spin" : ""} />
            {saved ? "Сохранено! Открываю школу…" : saving ? "Сохраняю…" : "Сохранить в мою школу"}
          </button>
          <button
            onClick={onLead}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white border border-white/15 px-5 py-3 rounded-xl transition-colors"
          >
            <Icon name="Rocket" size={16} /> Запустить целиком
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white border border-white/15 px-5 py-3 rounded-xl transition-colors"
          >
            <Icon name="RotateCcw" size={16} /> Другой курс
          </button>
        </div>

        {noAccess && (
          <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4 text-left max-w-xl mx-auto">
            <div className="flex items-center gap-2 text-amber-200 font-medium mb-1">
              <Icon name="Lock" size={16} /> Создание школы — по приглашению
            </div>
            <p className="text-white/65 text-sm mb-3">
              Чтобы сохранить курс в свою школу, нужен доступ к конструктору. Оставьте заявку — мы вышлем персональную ссылку.
            </p>
            <button
              onClick={() => navigate("/school")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform text-sm"
            >
              <Icon name="Send" size={15} /> Оставить заявку на доступ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}