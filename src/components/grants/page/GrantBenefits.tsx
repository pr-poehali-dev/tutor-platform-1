import Icon from "@/components/ui/icon";

export default function GrantBenefits() {
  return (
    <section className="grid sm:grid-cols-3 gap-3 mt-8 max-w-3xl mx-auto">
      {[
        { icon: "FileText", t: "Готовый текст", d: "Актуальность, цели, задачи, соцэффект, команда" },
        { icon: "Calculator", t: "Смета и план", d: "Бюджет с обоснованием и календарный план" },
        { icon: "ShieldCheck", t: "Проверка", d: "Разбор по критериям и оценка шансов" },
      ].map((c) => (
        <div key={c.t} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-center">
          <Icon name={c.icon} size={20} className="text-violet-300 mx-auto mb-2" />
          <div className="text-white font-bold text-sm mb-1">{c.t}</div>
          <div className="text-white/55 text-xs">{c.d}</div>
        </div>
      ))}
    </section>
  );
}
