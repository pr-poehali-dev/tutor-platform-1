import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import { CourseDetail } from "@/components/courses/courseDetailsData";

interface Props {
  course: Course;
  detail: CourseDetail;
}

// Профессиональное «обещание результата» по предмету взрослого курса.
const RESULT_PROMISE: Record<string, string> = {
  datascience: "самостоятельно строить модели машинного обучения и анализировать данные на реальных задачах",
  product: "управлять продуктом от идеи до запуска и говорить на одном языке с командой и заказчиком",
  prompteng: "профессионально работать с нейросетями и получать от них точный результат под любую задачу",
  ai: "внедрять ИИ-ассистентов в рабочие процессы и экономить десятки часов рутины",
  chinese: "читать иероглифы, вести первые диалоги и уверенно двигаться к экзамену HSK",
  korean: "читать хангыль, понимать речь на слух и свободно вести бытовые диалоги",
  marketing: "запускать рекламные кампании, считать окупаемость и приводить клиентов системно",
  business: "запустить и легально вести собственное дело с понятной экономикой",
  sales: "выстраивать воронку продаж и закрывать сделки без давления на клиента",
};

export default function CourseDetailResult({ course, detail }: Props) {
  if (course.grade !== "adult") return null;

  const promise =
    RESULT_PROMISE[course.subject] ||
    "применять новую профессию на практике и уверенно решать реальные рабочие задачи";

  // Ключевые результаты — берём первые пункты «Что освоишь».
  const keyOutcomes = detail.outcomes.slice(0, 4);
  const modulesCount = detail.modules.length;

  const stats: { icon: string; value: string; label: string }[] = [
    { icon: "LayoutList", value: String(modulesCount), label: modulesCount === 1 ? "модуль" : "модулей" },
    { icon: "PlayCircle", value: String(course.lessons), label: "уроков с практикой" },
    { icon: "Award", value: "Есть", label: "сертификат об окончании" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-600/12 via-teal-600/8 to-cyan-600/12 p-5">
      <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-emerald-500/12 blur-3xl" aria-hidden="true" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/25 rounded-full px-3 py-1 mb-3">
          <Icon name="Target" size={12} className="text-emerald-300" />
          <span className="text-emerald-200 text-[11px] font-bold uppercase tracking-wider">Результат курса</span>
        </div>

        <h3 className="font-montserrat font-black text-white text-lg md:text-xl leading-snug mb-4">
          После курса вы сможете{" "}
          <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            {promise}
          </span>
          .
        </h3>

        {keyOutcomes.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-2 mb-4">
            {keyOutcomes.map((o, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white/[0.05] border border-white/10 rounded-xl p-3">
                <Icon name="CircleCheck" size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" fallback="Check" />
                <span className="text-white/80 text-sm leading-snug">{o}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1">
          {stats.map((s) => (
            <div key={s.label} className="text-center bg-white/[0.04] border border-white/8 rounded-xl px-2 py-3">
              <Icon name={s.icon} size={17} className="text-cyan-300 mx-auto mb-1.5" fallback="Circle" />
              <p className="font-montserrat font-black text-white text-base leading-none mb-1">{s.value}</p>
              <p className="text-white/50 text-[11px] leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
