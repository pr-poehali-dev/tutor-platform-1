import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/8 bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">
                🚀
              </div>
              <span className="font-montserrat font-black text-white text-lg">Космо-Учитель</span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-md">
              Образовательная онлайн-платформа с ИИ-методистами. Информационно-консультационные услуги в области образования.
            </p>
            <p className="text-white/35 text-xs mt-2">Продукт ООО «МАТ-ЛАБС»</p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-montserrat font-bold text-white text-sm mb-3">Документы</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/pricing" className="text-white/55 hover:text-white transition-colors">Тарифы и оплата</Link></li>
              <li><Link to="/legal/offer" className="text-white/55 hover:text-white transition-colors">Публичная оферта</Link></li>
              <li><Link to="/legal/privacy" className="text-white/55 hover:text-white transition-colors">Политика конфиденциальности</Link></li>
              <li><Link to="/legal/terms" className="text-white/55 hover:text-white transition-colors">Пользовательское соглашение</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-montserrat font-bold text-white text-sm mb-3">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-white/55 flex items-center gap-1.5"><Icon name="ShieldCheck" size={13} className="text-green-400" /> Данные на серверах в РФ</li>
              <li className="text-white/55 flex items-center gap-1.5"><Icon name="Lock" size={13} className="text-cyan-400" /> Шифрование HTTPS</li>
              <li className="text-white/55 flex items-center gap-1.5"><Icon name="UserCheck" size={13} className="text-purple-400" /> Минимум персональных данных</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="text-white/40 text-xs leading-relaxed">
              <p className="font-bold text-white/70 mb-1">© {new Date().getFullYear()} ООО «МАТ-ЛАБС»</p>
              <p>Сервис «Космо-Учитель» — продукт ООО «МАТ-ЛАБС». Все права защищены.</p>
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