import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import { getCourseMaterials, MATERIAL_KIND_META } from "@/components/courses/courseMaterialsData";

interface Props {
  course: Course;
}

export default function CourseDetailMaterials({ course }: Props) {
  const materials = getCourseMaterials(course);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Интро */}
      <div className="flex items-start gap-3 bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Icon name="Files" fallback="Folder" size={18} className="text-emerald-300" />
        </div>
        <div>
          <p className="font-montserrat font-bold text-white text-sm mb-0.5">
            Материалы для закрепления
          </p>
          <p className="text-white/60 text-xs leading-relaxed">
            Рабочие тетради, шпаргалки, схемы и тренажёры к этому курсу. Помогают повторить
            пройденное и довести навык до автоматизма. Доступны вместе с уроками курса.
          </p>
        </div>
      </div>

      {/* Список материалов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {materials.map((m, i) => {
          const meta = MATERIAL_KIND_META[m.kind];
          return (
            <div
              key={i}
              className="group bg-white/4 border border-white/8 rounded-2xl p-4 flex gap-3.5 hover:border-white/20 transition-colors"
            >
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${meta.bg}`}
              >
                <Icon name={meta.icon} fallback="FileText" size={20} className={meta.color} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-bold text-white text-sm leading-tight">{m.title}</h4>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide rounded-full border px-2 py-0.5 ${meta.bg} ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{m.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Подсказка */}
      <p className="text-white/40 text-xs flex items-center gap-2">
        <Icon name="Info" size={13} />
        Материалы открываются в уроках курса. Начни обучение, чтобы получить к ним доступ.
      </p>
    </div>
  );
}