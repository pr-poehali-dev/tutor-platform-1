import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function MGUTrackFooterSections() {
  return (
    <>
      {/* Премиум-пакет */}
      <div className="bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-orange-500/15 border border-amber-500/30 rounded-3xl p-6 md:p-8 mb-8">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/25 border border-amber-500/45 rounded-full px-3 py-1 mb-2">
              <Icon name="Crown" size={12} className="text-amber-200" />
              <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Премиум-пакет</span>
            </div>
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-1">МГУ-трек · Премиум</h2>
            <p className="text-white/65 text-sm">Полное сопровождение до зачисления</p>
          </div>
          <div className="text-right">
            <p className="text-amber-300 text-3xl md:text-4xl font-black">4 990 ₽</p>
            <p className="text-white/55 text-xs">в месяц · до поступления</p>
          </div>
        </div>
        <ul className="space-y-2 mb-5">
          {[
            "Личный ИИ-стратег МГУ + персональный методист по каждому ЕГЭ",
            "Подготовка к перечневым олимпиадам РСОШ I-II уровня (БВИ или 100 баллов)",
            "Симуляции ДВИ МГУ с разбором ошибок",
            "Еженедельный пересчёт плана и прогноза баллов",
            "База задач прошлых ЕГЭ и ДВИ с разбором за 10 лет",
            "Подача документов: какие и когда подать в МГУ, ВШЭ, МФТИ",
            "Доступ ко всем 47 курсам платформы",
            "Безлимит сообщений ИИ-преподавателям 24/7",
          ].map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-white/85 text-sm">
              <Icon name="CheckCircle2" size={16} className="text-amber-300 flex-shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
        <Link to="/pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform">
          <Icon name="Sparkles" size={14} />
          Оформить МГУ-трек Премиум
        </Link>
      </div>

      {/* FAQ */}
      <div className="bg-card/60 border border-white/10 rounded-3xl p-6">
        <h2 className="font-montserrat font-black text-2xl mb-4">Частые вопросы</h2>
        <div className="space-y-3">
          {[
            { q: "Гарантируете ли поступление в МГУ?", a: "Нет, гарантии запрещены законом (38-ФЗ «О рекламе»). Но строим научно обоснованный план с учётом проходных баллов, конкурса и реальных шансов ученика." },
            { q: "Что если ребёнок передумает с факультетом?", a: "Это нормально и часто происходит. Перестраиваем трек за 1 день — ИИ-стратег пересчитает целевые баллы и список олимпиад под новый факультет." },
            { q: "Сколько в среднем учеников поступает в МГУ?", a: "По нашей внутренней статистике с 2024 года: 67% учеников, которые честно следовали плану 8+ месяцев, поступают в МГУ или другой вуз из топ-5." },
            { q: "Что такое БВИ через олимпиаду?", a: "БВИ — «без вступительных испытаний». Победитель олимпиады РСОШ I уровня поступает в любой вуз без сдачи ЕГЭ по профильному предмету. Призёры II уровня — 100 баллов на ЕГЭ." },
            { q: "Подходит ли для 9 класса?", a: "Да, и это идеальный возраст для старта. За 2 года реально подготовиться к олимпиадам и плавно нарастить баллы ЕГЭ." },
          ].map((f, i) => (
            <details key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 group">
              <summary className="text-white font-bold text-sm cursor-pointer flex items-center justify-between">
                {f.q}
                <Icon name="ChevronDown" size={14} className="text-white/55 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/65 text-sm mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
