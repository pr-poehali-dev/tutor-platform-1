import { CourseDetail } from "@/components/courses/courseDetailsData";

interface Props {
  detail: CourseDetail;
}

export default function CourseDetailReviews({ detail }: Props) {
  return (
    <div className="animate-fade-in">
      <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-3 mb-5 text-yellow-200/85 text-xs">
        ℹ️ Отзывы публикуются обезличенно. Указаны только инициалы и город ученика — в соответствии с требованиями Федерального закона №152-ФЗ «О персональных данных».
      </div>
      <div className="flex flex-col gap-3">
        {detail.reviews.map((r, i) => (
          <div key={i} className="bg-white/4 border border-white/8 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                {r.initials.split(" ").map(p => p[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{r.initials}</p>
                <p className="text-white/40 text-xs">{r.city} · {r.grade} · {r.date}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className={`text-sm ${j < r.rating ? "text-yellow-400" : "text-white/15"}`}>★</span>
                ))}
              </div>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
