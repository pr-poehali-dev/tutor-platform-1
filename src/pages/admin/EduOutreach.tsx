import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PIN_KEY = "uchispro_admin_pin_v1";

const SUBJECT = "Сотрудничество: ИИ-платформа УЧИСЬПРО для вашего учебного заведения";

const SHORT_LETTER = `Здравствуйте!

Меня зовут ___, я представляю образовательную платформу УЧИСЬПРО (учисьпро.рф).

Мы помогаем онлайн-школам, колледжам и техникумам запускать собственные онлайн-курсы под своим брендом и зарабатывать на них — без абонплаты, платите только процент с реальных продаж.

Что получает ваше заведение:
• ИИ-преподаватель 24/7 — отвечает ученикам, проверяет домашние задания;
• Конструктор курсов без программиста: ИИ собирает программу, уроки и тесты за час;
• Ваш бренд и домен (white-label) — платформы в кадре не видно;
• Приём оплат, чеки по 54-ФЗ и выплаты — уже встроены;
• Аналитика прогресса и доходимости учеников.

Готовы бесплатно показать платформу на коротком созвоне (15–20 минут) и предложить условия под ваши задачи.

Подскажите, когда вам удобно?

С уважением,
___
УЧИСЬПРО · учисьпро.рф
Телефон: ___ · Email: ___`;

const FULL_LETTER = `Тема: ${SUBJECT}

Здравствуйте, уважаемые коллеги!

Меня зовут ___, я представляю образовательную платформу УЧИСЬПРО (учисьпро.рф). Мы развиваем современную образовательную экосистему на базе искусственного интеллекта и предлагаем вашему заведению взаимовыгодное сотрудничество.

ЧЕМ МЫ МОЖЕМ БЫТЬ ПОЛЕЗНЫ ВАШЕМУ УЧЕБНОМУ ЗАВЕДЕНИЮ

1. ИИ-преподаватель и наставник 24/7
Персональный ИИ-наставник отвечает ученикам круглосуточно в текстовом и голосовом формате, проверяет домашние задания и помогает разбирать сложные темы по школьным и профессиональным предметам.

2. Конструктор курсов без программиста
Вы вводите тему — ИИ за час собирает готовый курс: программу, модули, уроки с заданиями и тестами, а также маркетинговый пакет. Всё редактируется через удобный интерфейс, без кода.

3. Собственный бренд (white-label)
Курсы работают под вашим логотипом, фирменными цветами и на вашем домене. Ученики видят только ваш бренд.

4. Встроенные финансы и юридическая чистота
Приём оплат, рассрочка для учеников, промокоды, фискальные чеки по 54-ФЗ и автоматические отчёты для налоговой. Работаем с самозанятыми, ИП и юрлицами по договору. Выплаты идут напрямую на счёт вашего заведения.

5. Аналитика и рост
Наглядные дашборды: воронка, доходимость курсов, NPS, динамика выручки. ИИ подсказывает, что улучшить.

6. Помощь с грантами
Отдельный ИИ-сервис готовит профессиональные заявки на гранты и конкурсы — актуальность, цели, смету и календарный план — чтобы привлекать финансирование на развитие.

УСЛОВИЯ СОТРУДНИЧЕСТВА
• Без абонплаты — вы платите только процент с реальных продаж.
• Приём платежей и эквайринг уже включены.
• Запуск — за один вечер, с сопровождением нашей команды.

Будем рады провести короткую бесплатную презентацию (15–20 минут) в удобное для вас время и обсудить, как платформа решит именно ваши задачи.

Пожалуйста, сообщите, когда вам удобно пообщаться, или напишите нам в ответ на это письмо.

С уважением,
___
Образовательная платформа УЧИСЬПРО
Сайт: учисьпро.рф
Телефон: ___
Email: ___`;

function CopyBlock({ title, text, hint }: { title: string; text: string; hint: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard недоступен */
    }
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-montserrat font-bold">{title}</h3>
          <p className="text-white/45 text-xs">{hint}</p>
        </div>
        <Button size="sm" variant={copied ? "secondary" : "default"} onClick={copy}>
          <Icon name={copied ? "Check" : "Copy"} size={15} className="mr-1.5" />
          {copied ? "Скопировано" : "Копировать"}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed bg-background/60 rounded-xl border border-white/10 p-3 max-h-[360px] overflow-y-auto font-golos">
        {text}
      </pre>
    </Card>
  );
}

export default function EduOutreach() {
  const hasPin = !!(sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY));

  if (!hasPin) {
    return (
      <div className="min-h-screen bg-mesh text-white flex items-center justify-center p-6">
        <Card className="p-6 text-center max-w-sm">
          <Icon name="Lock" size={28} className="text-violet-300 mx-auto mb-3" />
          <p className="mb-4">Нужен доступ администратора</p>
          <Link to="/admin"><Button>Открыть кабинет</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh text-white">
      <Helmet><title>Письмо о сотрудничестве — Админ</title></Helmet>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/admin/edu-institutions" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1.5 mb-1">
          <Icon name="ChevronLeft" size={15} /> К базе учебных заведений
        </Link>
        <h1 className="font-montserrat font-black text-2xl mb-1">Письмо-презентация о сотрудничестве</h1>
        <p className="text-white/55 text-sm mb-5">
          Готовые тексты для рассылки онлайн-школам, колледжам и техникумам. Замените «___» на свои данные и скопируйте.
        </p>

        <Card className="p-4 mb-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="Presentation" size={18} className="text-cyan-300" />
            <span>Красивая презентационная страница для отправки ссылкой партнёрам</span>
          </div>
          <Link to="/for-schools" target="_blank">
            <Button variant="outline" size="sm">
              <Icon name="ExternalLink" size={15} className="mr-1.5" /> Открыть /for-schools
            </Button>
          </Link>
        </Card>

        <div className="mb-5">
          <CopyBlockSubject />
        </div>

        <div className="space-y-4">
          <CopyBlock title="Короткое письмо" hint="Для первого касания и мессенджеров" text={SHORT_LETTER} />
          <CopyBlock title="Подробное письмо" hint="Для email-рассылки с полным описанием" text={FULL_LETTER} />
        </div>
      </div>
    </div>
  );
}

function CopyBlockSubject() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SUBJECT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* нет доступа к буферу */
    }
  };
  return (
    <Card className="p-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-white/45 text-xs">Тема письма</p>
        <p className="text-sm truncate">{SUBJECT}</p>
      </div>
      <Button size="sm" variant="outline" onClick={copy}>
        <Icon name={copied ? "Check" : "Copy"} size={15} />
      </Button>
    </Card>
  );
}
