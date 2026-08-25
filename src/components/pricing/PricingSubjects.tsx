import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const SUBJECTS: { name: string; emoji: string; href: string; note: string }[] = [
  { name: "Математика", emoji: "🧮", href: "/super-courses", note: "с 1 класса до ЕГЭ" },
  { name: "Физика", emoji: "⚡", href: "/super-courses", note: "теория и задачи" },
  { name: "Информатика", emoji: "💻", href: "/super-courses", note: "и программирование" },
  { name: "Биология", emoji: "🧬", href: "/biology-problems", note: "задачник с разбором" },
  { name: "Химия", emoji: "🧪", href: "/chemistry-problems", note: "задачник с разбором" },
  { name: "Литература", emoji: "📚", href: "/feed", note: "разборы произведений" },
];

export default function PricingSubjects() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-14">
      <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
        Предметы — все в одной подписке
      </h2>
      <p className="text-white/60 text-center max-w-2xl mx-auto mb-10">
        С обычным репетитором за каждый предмет платят отдельно. Здесь второй и третий
        предмет не стоят ничего.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SUBJECTS.map((s) => (
          <Link
            key={s.name}
            to={s.href}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-purple-400/35 hover:bg-white/[0.05] transition-all group"
          >
            <div className="text-3xl mb-2">{s.emoji}</div>
            <div className="text-white font-semibold flex items-center gap-1.5">
              {s.name}
              <Icon
                name="ArrowUpRight"
                size={14}
                className="text-white/25 group-hover:text-purple-300 transition-colors"
              />
            </div>
            <div className="text-white/45 text-sm mt-0.5">{s.note}</div>
          </Link>
        ))}
      </div>

      <p className="text-center text-white/45 text-sm mt-6">
        Нужного предмета нет?{" "}
        <Link to="/order" className="text-purple-300 hover:text-purple-200 underline">
          Соберём индивидуальную программу
        </Link>
      </p>
    </section>
  );
}
