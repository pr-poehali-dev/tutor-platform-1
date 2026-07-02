import { useState } from "react";
import Icon from "@/components/ui/icon";
import { fetchSchoolCourse, updateSchoolCourse, type SchoolCourseListItem } from "./api";
import { printCoursePdf } from "@/lib/coursePdf";

interface Props {
  course: SchoolCourseListItem;
  onDelete: () => void;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SchoolCourseCard({ course, onDelete }: Props) {
  const [published, setPublished] = useState(course.is_published);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const downloadPdf = async () => {
    setBusy(true);
    const res = await fetchSchoolCourse(course.id);
    setBusy(false);
    if (res.ok && res.data) printCoursePdf(res.data.course.data);
  };

  const togglePublish = async () => {
    const next = !published;
    setPublished(next);
    await updateSchoolCourse(course.id, { is_published: next });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-montserrat font-bold text-base text-white">{course.title}</h3>
            {published ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-md px-2 py-0.5">
                <Icon name="Globe" size={10} /> Опубликован
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/50 bg-white/8 border border-white/15 rounded-md px-2 py-0.5">
                Черновик
              </span>
            )}
          </div>
          <p className="text-white/45 text-xs mt-1">
            {course.modules_count} модулей · {course.lessons_count} уроков · {fmtDate(course.created_at)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button
          onClick={downloadPdf}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white border border-white/12 hover:border-violet-400/40 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-60"
        >
          <Icon name={busy ? "Loader2" : "Download"} size={14} className={busy ? "animate-spin" : ""} /> PDF
        </button>
        <button
          onClick={togglePublish}
          className={`inline-flex items-center gap-1.5 text-sm rounded-lg px-3 py-1.5 transition-colors border ${
            published
              ? "text-white/70 border-white/12 hover:border-white/25"
              : "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
          }`}
        >
          <Icon name={published ? "EyeOff" : "Globe"} size={14} /> {published ? "Снять с публикации" : "Опубликовать"}
        </button>

        <div className="ml-auto">
          {confirmDel ? (
            <div className="flex items-center gap-1.5">
              <button onClick={onDelete} className="text-sm text-rose-300 hover:text-rose-200 px-2 py-1.5">
                Удалить
              </button>
              <button onClick={() => setConfirmDel(false)} className="text-sm text-white/50 hover:text-white px-2 py-1.5">
                Отмена
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-rose-300 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Icon name="Trash2" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
