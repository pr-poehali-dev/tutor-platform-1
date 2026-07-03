import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FAQ } from "./data";

export default function WritingOutcomesPricingFaq() {
  return (
    <>
      {/* Что получишь */}
      <div className="bg-gradient-to-br from-emerald-900/20 via-teal-900/15 to-cyan-900/20 border border-emerald-500/25 rounded-3xl p-6 md:p-8 mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Award" size={20} className="text-emerald-300" />
          <span className="text-emerald-300 text-[11px] uppercase tracking-wider font-bold">
            Что ты будешь уметь
          </span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5">
          Результаты после курса
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "Напишешь итоговое сочинение 11 класса на «зачёт» с запасом",
            "Сочинение ЕГЭ — 25 первичных баллов по критериям ФИПИ",
            "Освоишь 5 жанров журналистики: репортаж, очерк, рецензия, интервью, колонка",
            "Соберёшь портфолио из 12 опубликованных работ для подачи в вуз",
            "Выработаешь авторский стиль: ритм, точная деталь, живая интонация",
            "Получишь профессиональную обратную связь по каждому тексту от ИИ-редактора",
            "Подготовишься к ДВИ журфака МГУ и творческим экзаменам ВШЭ, СПбГУ",
            "Сможешь побеждать в олимпиадах: Высшая проба, Ломоносов, «Звезда»",
          ].map((o, i) => (
            <div key={i} className="flex items-start gap-2.5 text-white/85 text-sm">
              <Icon name="CheckCircle2" size={18} className="text-emerald-300 flex-shrink-0 mt-0.5" />
              <span>{o}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Цена и CTA */}
      <div className="bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-rose-500/15 border border-amber-500/30 rounded-3xl p-6 md:p-8 mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/25 border border-amber-500/45 rounded-full px-3 py-1 mb-2">
              <Icon name="Crown" size={12} className="text-amber-200" />
              <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">
                Премиум-курс
              </span>
            </div>
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-1">
              Мастерская сочинений
            </h2>
            <p className="text-white/65 text-sm">
              Полный доступ к курсу + ИИ-редактор + проверка работ
            </p>
          </div>
          <div className="text-right">
            <p className="text-amber-300 text-3xl md:text-4xl font-black">890 ₽</p>
            <p className="text-white/55 text-xs">за полный курс</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="Sparkles" size={16} />
            Начать пробный урок
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="HelpCircle" size={20} className="text-cyan-300" />
          <span className="text-cyan-300 text-[11px] uppercase tracking-wider font-bold">
            Частые вопросы
          </span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5">
          Отвечаем честно
        </h2>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <details
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 group"
            >
              <summary className="text-white font-bold text-sm cursor-pointer flex items-center justify-between gap-3">
                <span>{f.q}</span>
                <Icon
                  name="ChevronDown"
                  size={14}
                  className="text-white/55 group-open:rotate-180 transition-transform flex-shrink-0"
                />
              </summary>
              <p className="text-white/70 text-sm mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Перелинковка для SEO */}
      <div className="mt-10 bg-white/[0.02] border border-white/8 rounded-3xl p-6">
        <h2 className="font-montserrat font-black text-lg mb-3">Смотри также</h2>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <Link
            to="/mgu-track"
            className="flex items-center gap-2 text-white/75 hover:text-white p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            <Icon name="GraduationCap" size={16} className="text-amber-300" />
            МГУ-трек: индивидуальная стратегия поступления
          </Link>
          <Link
            to="/courses/russian"
            className="flex items-center gap-2 text-white/75 hover:text-white p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            <Icon name="BookOpen" size={16} className="text-rose-300" />
            Все курсы по русскому языку
          </Link>
          <Link
            to="/courses/literature"
            className="flex items-center gap-2 text-white/75 hover:text-white p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            <Icon name="Library" size={16} className="text-violet-300" />
            Курсы по литературе
          </Link>
          <Link
            to="/score-calculator"
            className="flex items-center gap-2 text-white/75 hover:text-white p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            <Icon name="Calculator" size={16} className="text-cyan-300" />
            Калькулятор баллов ЕГЭ
          </Link>
        </div>
      </div>
    </>
  );
}