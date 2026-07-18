import Icon from "@/components/ui/icon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Для какого класса подходит?",
    a: "Модуль охватывает школьную программу 5–11 класса и профильную подготовку к ОГЭ и ЕГЭ. Наставник сначала тестирует ученика и подстраивает уровень заданий под него — от базы до олимпиадных задач.",
  },
  {
    q: "Как проходит оплата?",
    a: "Оплата картой онлайн через защищённый сервис ЮKassa. Можно оформить подписку «Репетитор» (1490 ₽/мес или 9990 ₽/год) — открывает все функции, либо купить один предмет за 1990 ₽ навсегда. Доступ открывается сразу после оплаты.",
  },
  {
    q: "Можно ли вернуть деньги?",
    a: "Да. Если модуль не подошёл — напишите нам в течение 14 дней, и мы вернём оплату в полном объёме, без лишних вопросов. Подписку можно отменить в любой момент в личном кабинете.",
  },
  {
    q: "Что входит в модуль?",
    a: "ИИ-наставник с голосом, персональный план обучения по результатам теста, супер-курсы по физике, математике и информатике, проверка домашки по фото, задачники с разбором и подготовка к экзаменам. Всё это открывается одной подпиской.",
  },
  {
    q: "Чем это лучше живого репетитора?",
    a: "Наставник доступен 24/7 без записи и ожидания, объясняет столько раз, сколько нужно, и стоит в разы дешевле: месяц безлимита — как одно занятие с частным репетитором.",
  },
  {
    q: "Нужно ли что-то устанавливать?",
    a: "Нет. Всё работает прямо в браузере на компьютере, планшете и телефоне. Прогресс сохраняется в личном кабинете — можно продолжать с любого устройства.",
  },
];

export default function TutorFAQ() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12" aria-label="Частые вопросы о модуле Репетитор">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5 mb-3">
          <Icon name="MessageCircleQuestion" size={14} className="text-purple-300" />
          <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Частые вопросы</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Отвечаем на важное</h2>
        <p className="text-white/55 text-sm md:text-base mt-2">Всё, что нужно знать перед стартом</p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {FAQ.map((item, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border-b-0 rounded-2xl border border-white/10 bg-card/50 px-5 data-[state=open]:border-purple-500/30"
          >
            <AccordionTrigger className="text-left text-white font-bold text-base hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-white/65 text-sm leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
