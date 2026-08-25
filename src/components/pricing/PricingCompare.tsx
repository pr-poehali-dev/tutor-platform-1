import { Fragment } from "react";
import Icon from "@/components/ui/icon";

/** Средняя цена очного занятия с репетитором, ₽ — для сравнения. */
const TUTOR_LESSON = 1200;
const SUB_MONTH = 1490;

const ROWS: { label: string; classic: string; sub: string; win: boolean }[] = [
  {
    label: "Цена за месяц",
    classic: `${(TUTOR_LESSON * 8).toLocaleString("ru-RU")} ₽ (8 занятий)`,
    sub: `${SUB_MONTH.toLocaleString("ru-RU")} ₽ без лимита`,
    win: true,
  },
  {
    label: "Сколько занятий",
    classic: "Строго по оплате",
    sub: "Сколько нужно, хоть каждый день",
    win: true,
  },
  {
    label: "Когда заниматься",
    classic: "По расписанию репетитора",
    sub: "Круглосуточно, в любой момент",
    win: true,
  },
  {
    label: "Сколько предметов",
    classic: "Один — за каждый платите отдельно",
    sub: "Все предметы входят в подписку",
    win: true,
  },
  {
    label: "Пропустили занятие",
    classic: "Чаще всего деньги сгорают",
    sub: "Ничего не теряется",
    win: true,
  },
  {
    label: "Проверка домашки",
    classic: "Обычно в рамках занятия",
    sub: "По фото, без ограничений",
    win: true,
  },
  {
    label: "Живой контакт с человеком",
    classic: "Есть — главное преимущество",
    sub: "Голосовой диалог, но это не человек",
    win: false,
  },
];

export default function PricingCompare() {
  const year = TUTOR_LESSON * 8 * 9;
  const subYear = 9990;

  return (
    <section className="max-w-4xl mx-auto px-4 py-14">
      <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
        Подписка или обычный репетитор
      </h2>
      <p className="text-white/60 text-center max-w-2xl mx-auto mb-10">
        Сравниваем честно: подписка выигрывает в цене и доступности, но живого преподавателя
        она не заменяет полностью.
      </p>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-px bg-white/[0.06]">
          <div className="bg-[#12121c] p-4 text-white/50 text-xs md:text-sm font-semibold">
            Что сравниваем
          </div>
          <div className="bg-[#12121c] p-4 text-white/70 text-xs md:text-sm font-semibold text-center">
            Репетитор очно
          </div>
          <div className="bg-purple-500/[0.12] p-4 text-white text-xs md:text-sm font-bold text-center">
            Подписка УЧИСЬПРО
          </div>

          {ROWS.map((r) => (
            <Fragment key={r.label}>
              <div className="bg-[#12121c] p-4 text-white/75 text-xs md:text-sm">{r.label}</div>
              <div className="bg-[#12121c] p-4 text-white/55 text-xs md:text-sm text-center">
                {r.classic}
              </div>
              <div
                className={`p-4 text-xs md:text-sm text-center ${
                  r.win ? "bg-purple-500/[0.08] text-white" : "bg-[#12121c] text-white/55"
                }`}
              >
                <span className="inline-flex items-center gap-1.5 justify-center">
                  {r.win && (
                    <Icon name="Check" size={14} className="text-emerald-400 flex-shrink-0" />
                  )}
                  {r.sub}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-purple-400/25 bg-gradient-to-br from-purple-500/12 to-cyan-500/8 p-6 md:p-8 text-center">
        <div className="text-white/70 mb-2">Учебный год с репетитором — примерно</div>
        <div className="font-montserrat font-black text-2xl md:text-3xl text-white/60 line-through mb-1">
          {year.toLocaleString("ru-RU")} ₽
        </div>
        <div className="text-white/70 mt-4 mb-1">Год подписки «Репетитор»</div>
        <div className="font-montserrat font-black text-3xl md:text-4xl gradient-text-purple">
          {subYear.toLocaleString("ru-RU")} ₽
        </div>
        <p className="text-white/50 text-sm mt-4 max-w-lg mx-auto">
          Расчёт при двух занятиях в неделю по {TUTOR_LESSON.toLocaleString("ru-RU")} ₽ в течение
          девяти учебных месяцев. Цены репетиторов в вашем городе могут отличаться.
        </p>
      </div>
    </section>
  );
}