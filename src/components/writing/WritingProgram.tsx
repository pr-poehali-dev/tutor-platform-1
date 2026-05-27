import Icon from "@/components/ui/icon";
import { MODULES, AUTHORS } from "./data";

export default function WritingProgram() {
  return (
    <>
      {/* Кому подходит */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: "PenTool",
            title: "Старшеклассникам",
            text: "Хотят сдать ЕГЭ по русскому и литературе на 90+ баллов, написать итоговое сочинение на «зачёт» с запасом",
            color: "text-amber-300",
          },
          {
            icon: "Newspaper",
            title: "Будущим журналистам",
            text: "Планируют поступать на журфак МГУ, ВШЭ медиакоммуникации, СПбГУ. Нужно портфолио и опыт письма",
            color: "text-rose-300",
          },
          {
            icon: "Edit3",
            title: "Будущим авторам",
            text: "Ведут блог, пишут в школьную газету, мечтают о собственной книге, подкасте, колонке",
            color: "text-purple-300",
          },
        ].map((c, i) => (
          <div key={i} className="bg-card/60 border border-white/10 rounded-3xl p-5">
            <Icon name={c.icon} size={28} className={`${c.color} mb-3`} />
            <h3 className="font-montserrat font-black text-white text-lg mb-2">{c.title}</h3>
            <p className="text-white/65 text-sm">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Авторы школьной программы */}
      <div className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="BookMarked" size={20} className="text-amber-300" />
          <span className="text-amber-300 text-[11px] uppercase tracking-wider font-bold">
            Школьная программа во всю глубину
          </span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
          Учимся у лучших русских авторов
        </h2>
        <p className="text-white/65 text-sm mb-5 max-w-3xl">
          Не «прочитал и забыл». Разбираем приёмы, которыми писали классики и пишут современные
          журналисты. Каждый автор — отдельный урок с практикой.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {AUTHORS.map((a) => (
            <div
              key={a.name}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 hover:bg-white/[0.06] transition-colors"
            >
              <p className="text-white font-bold text-sm">{a.name}</p>
              <p className="text-white/55 text-[11px] leading-snug mt-0.5">{a.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Программа курса */}
      <div id="program" className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="ListChecks" size={20} className="text-rose-300" />
          <span className="text-rose-300 text-[11px] uppercase tracking-wider font-bold">
            Полная программа · 48 уроков
          </span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-1">
          8 модулей от первой фразы до журфака
        </h2>
        <p className="text-white/65 text-sm mb-6">
          Каждый модуль — самостоятельная история. Учишься по порядку или прыгаешь к нужному.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {MODULES.map((m) => (
            <div
              key={m.num}
              className={`bg-gradient-to-br ${m.color} border rounded-3xl p-5 hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon name={m.icon} size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/55 text-[10px] uppercase tracking-wider font-bold">
                    Модуль {m.num}
                  </p>
                  <h3 className="font-montserrat font-black text-white text-lg leading-tight">
                    {m.title}
                  </h3>
                  <p className="text-white/65 text-xs">{m.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {m.lessons.map((l, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/80 text-xs">
                    <Icon name="Check" size={12} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
