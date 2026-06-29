import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/8 bg-card/30 backdrop-blur-sm" aria-label="Подвал сайта">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <section className="md:col-span-2" aria-label="О проекте УЧИСЬПРО">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">
                🚀
              </div>
              <span className="font-montserrat font-black text-white text-lg">УЧИСЬПРО</span>
            </div>
            <p className="text-white/75 text-sm leading-relaxed max-w-md">
              Образовательная онлайн-платформа с персональным ИИ-репетитором: голосовые уроки, адаптивные программы, подготовка к ЕГЭ и ОГЭ. Учись когда удобно — на учисьпро.рф.
            </p>
            <p className="text-white/55 text-xs mt-2">учисьпро.рф · Продукт ООО «МАТ-ЛАБС»</p>
            <a
              href="https://max.ru/id631205241205_biz"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 transition-colors"
            >
              <Icon name="Send" size={16} aria-hidden="true" />
              Подписаться на канал в MAX
            </a>
          </section>

          {/* Tools */}
          <nav aria-label="Полезные ссылки">
            <h4 className="font-montserrat font-bold text-white text-sm mb-3">Полезное</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/app" className="text-cyan-200 hover:text-cyan-100 transition-colors font-bold">📱 Скачать приложение</Link></li>
              <li><Link to="/search" className="text-white/70 hover:text-white transition-colors">🔎 Поиск по сайту</Link></li>
              <li><Link to="/exam-bank" className="text-white/70 hover:text-white transition-colors">Сборник заданий ОГЭ и ЕГЭ</Link></li>
              <li><Link to="/score-calculator" className="text-white/70 hover:text-white transition-colors">Калькулятор баллов ЕГЭ</Link></li>
              <li><Link to="/feed" className="text-fuchsia-200 hover:text-fuchsia-100 transition-colors font-bold">📡 Лента: «Хочу всё знать»</Link></li>
              <li><Link to="/exam-checklist" className="text-rose-200 hover:text-rose-100 transition-colors font-bold">⏰ До ЕГЭ: чек-лист выпускника</Link></li>
              <li><Link to="/know-yourself" className="text-cyan-200 hover:text-cyan-100 transition-colors font-bold">🪞 Познай себя: профориентация</Link></li>
              <li><Link to="/graduate" className="text-purple-200 hover:text-purple-100 transition-colors font-bold">🎓 Выпускник: подбор вуза и программа</Link></li>
              <li><Link to="/mgu-track" className="text-amber-200 hover:text-amber-100 transition-colors font-bold">👑 МГУ-трек: поступление в МГУ</Link></li>
              <li><Link to="/writing-craft" className="text-amber-200 hover:text-amber-100 transition-colors font-bold">✍️ Мастерская сочинений и журналистики</Link></li>
              <li><Link to="/pricing" className="text-white/70 hover:text-white transition-colors">Тарифы и оплата</Link></li>
            </ul>
          </nav>

          {/* Поддержка */}
          <nav aria-label="Поддержка">
            <h4 className="font-montserrat font-bold text-white text-sm mb-3">Поддержка</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/promo/dobro" className="text-rose-200 hover:text-rose-100 transition-colors font-black">❤️ Акция ДОБРО — бесплатно до 15.06</Link></li>
              <li><Link to="/znaika" className="text-amber-200 hover:text-amber-100 transition-colors font-bold">🪙 ЗНАЙКИ — копи и трать</Link></li>
              <li><Link to="/help" className="text-emerald-200 hover:text-emerald-100 transition-colors font-bold">💡 Центр помощи и FAQ</Link></li>
              <li><Link to="/contacts" className="text-cyan-200 hover:text-cyan-100 transition-colors font-bold">✉️ Написать нам</Link></li>
              <li><Link to="/reviews" className="text-yellow-200 hover:text-yellow-100 transition-colors font-bold">⭐ Отзывы учеников</Link></li>
              <li><Link to="/referral" className="text-amber-200 hover:text-amber-100 transition-colors font-bold">🎁 Приведи друга — +7 дней</Link></li>
              <li><a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">💬 Telegram-сообщество</a></li>
              <li><a href="https://max.ru/id631205241205_biz" target="_blank" rel="noopener noreferrer" className="text-sky-200 hover:text-sky-100 transition-colors font-bold">📢 Канал в MAX</a></li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Правовые документы">
            <h4 className="font-montserrat font-bold text-white text-sm mb-3">Документы</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/legal/offer" className="text-white/70 hover:text-white transition-colors">Публичная оферта</Link></li>
              <li><Link to="/legal/privacy" className="text-white/70 hover:text-white transition-colors">Конфиденциальность</Link></li>
              <li><Link to="/legal/terms" className="text-white/70 hover:text-white transition-colors">Пользовательское соглашение</Link></li>
            </ul>
            <div className="mt-3 pt-3 border-t border-white/8 space-y-1.5 text-xs">
              <p className="text-white/70 flex items-center gap-1.5"><Icon name="ShieldCheck" size={12} className="text-green-400" aria-hidden="true" /> Серверы в РФ</p>
              <p className="text-white/70 flex items-center gap-1.5"><Icon name="Lock" size={12} className="text-cyan-400" aria-hidden="true" /> Шифрование HTTPS</p>
            </div>
          </nav>
        </div>

        {/* Партнёр — банк Точка */}
        <div className="pt-6 border-t border-white/8 flex flex-col items-center text-center gap-2 mb-4">
          <p className="text-white/40 text-xs uppercase tracking-wider">Наш партнёр</p>
          <img
            src="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/27eb9e3b-2e0c-484b-9b80-4a129f46befa.png"
            alt="Сертификат партнёра — УЧИСЬПРО.РФ является партнёром и другом банка Точка"
            loading="lazy"
            className="w-32 md:w-40 rounded-xl border border-white/10 shadow-lg opacity-90 hover:opacity-100 transition-opacity"
          />
          <a
            href="https://partner.tochka.com?referer1=6312223437"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-cyan-200/80 hover:text-cyan-100 text-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="Landmark" size={12} aria-hidden="true" />
            Открыть расчётный счёт в банке Точка
          </a>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="text-white/40 text-xs leading-relaxed">
              <p className="font-bold text-white/70 mb-1">© {new Date().getFullYear()} ООО «МАТ-ЛАБС»</p>
              <p>Сервис «УЧИСЬПРО» (учисьпро.рф) — продукт ООО «МАТ-ЛАБС». Все права защищены.</p>
              <p className="mt-1 max-w-xl">
                Программы, методики, тексты уроков и материалы курсов являются объектами авторского права (ст. 1225–1302 ГК РФ). Исключительные права принадлежат ООО «МАТ-ЛАБС». Копирование, распространение и перепродажа без письменного согласия правообладателя запрещены.
              </p>
              <p className="mt-1 max-w-xl">
                Сервис не выдаёт документов государственного образца. Услуги носят информационно-консультационный характер. Не подлежит лицензированию в соответствии со ст. 91 273-ФЗ.
              </p>
            </div>
            <div className="text-white/30 text-xs">
              Обработка данных: 152-ФЗ · Реклама: 38-ФЗ · ЗоЗПП
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}