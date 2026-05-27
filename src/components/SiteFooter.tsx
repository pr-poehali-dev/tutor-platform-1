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
          </section>

          {/* Tools */}
          <nav aria-label="Полезные ссылки">
            <h4 className="font-montserrat font-bold text-white text-sm mb-3">Полезное</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/exam-bank" className="text-white/70 hover:text-white transition-colors">Сборник заданий ОГЭ и ЕГЭ</Link></li>
              <li><Link to="/score-calculator" className="text-white/70 hover:text-white transition-colors">Калькулятор баллов ЕГЭ</Link></li>
              <li><Link to="/mgu-track" className="text-amber-200 hover:text-amber-100 transition-colors font-bold">👑 МГУ-трек: поступление в МГУ</Link></li>
              <li><Link to="/writing-craft" className="text-amber-200 hover:text-amber-100 transition-colors font-bold">✍️ Мастерская сочинений и журналистики</Link></li>
              <li><Link to="/pricing" className="text-white/70 hover:text-white transition-colors">Тарифы и оплата</Link></li>
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

        {/* Bottom */}
        <div className="pt-6 border-t border-white/8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="text-white/40 text-xs leading-relaxed">
              <p className="font-bold text-white/70 mb-1">© {new Date().getFullYear()} ООО «МАТ-ЛАБС»</p>
              <p>Сервис «УЧИСЬПРО» (учисьпро.рф) — продукт ООО «МАТ-ЛАБС». Все права защищены.</p>
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