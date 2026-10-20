import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

const NAVY = "#14113a";
const VIOLET = "#6d28d9";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";
const QR = "/qr-leaflet-shkolniki.svg";
const SITE = "учисьпро.рф/start";

const FEATURES = [
  { icon: "Camera", title: "Домашка по фото", text: "Сфоткай задание — разберём по шагам, а не просто дадим ответ" },
  { icon: "Bot", title: "ИИ-репетитор 24/7", text: "Объяснит любую тему простыми словами — даже ночью перед контрольной" },
  { icon: "Target", title: "ОГЭ и ЕГЭ", text: "Задания с разбором, чек-листы и план подготовки" },
  { icon: "GraduationCap", title: "1–11 класс", text: "Математика, физика, химия, русский, английский и другие" },
];

/** Листовка А5 (148×210 мм) для школьников. QR ведёт на /start с UTM-меткой «leaflet». */
function Leaflet() {
  return (
    <div
      className="relative bg-white text-slate-800 font-golos overflow-hidden flex flex-col"
      style={{ width: "148mm", height: "210mm", flexShrink: 0 }}
    >
      <div
        className="relative px-[10mm] pt-[8mm] pb-[7mm] text-white overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${VIOLET} 70%, ${CYAN} 130%)` }}
      >
        <div className="absolute -right-[14mm] -top-[14mm] w-[45mm] h-[45mm] rounded-full opacity-20" style={{ background: CYAN }} />
        <div className="relative flex items-center justify-between mb-[5mm]">
          <span className="font-montserrat font-black text-[13pt] tracking-wide">УЧИСЬПРО</span>
          <span className="text-[7.5pt] uppercase tracking-[0.16em] font-bold text-cyan-200">для 1–11 класса</span>
        </div>
        <p className="relative font-montserrat font-extrabold text-[22pt] leading-[1.08]">
          Застрял на домашке?
          <br />
          <span style={{ color: AMBER }}>Разберём за минуту</span>
        </p>
        <p className="relative mt-[3mm] text-[10pt] text-white/85 leading-snug">
          Личный ИИ-репетитор, который объясняет, а не списывает за тебя
        </p>
      </div>

      <div className="px-[10mm] pt-[6mm] grid grid-cols-2 gap-[3mm]">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-[2.5mm] bg-slate-50 px-[3mm] py-[3mm]">
            <div
              className="w-[8mm] h-[8mm] rounded-[2mm] flex items-center justify-center mb-[1.5mm] text-white"
              style={{ background: VIOLET }}
            >
              <Icon name={f.icon} size={15} />
            </div>
            <p className="font-montserrat font-extrabold text-[9.5pt] leading-tight" style={{ color: NAVY }}>{f.title}</p>
            <p className="text-[7.6pt] text-slate-600 leading-snug mt-[0.8mm]">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mx-[10mm] mt-[5mm] rounded-[3mm] border-[0.6mm] flex items-center gap-[5mm] p-[3.5mm]" style={{ borderColor: VIOLET }}>
        <img src={QR} alt={`QR-код на ${SITE}`} className="block flex-shrink-0" style={{ width: "34mm", height: "34mm" }} />
        <div className="min-w-0">
          <p className="text-[7.5pt] uppercase tracking-[0.16em] font-bold mb-[1mm]" style={{ color: VIOLET }}>Начни бесплатно</p>
          <p className="font-montserrat font-extrabold text-[12pt] leading-tight" style={{ color: NAVY }}>Наведи камеру на QR-код</p>
          <p className="text-[8.5pt] text-slate-600 mt-[1.5mm] leading-snug">
            или открой <b className="text-slate-900">{SITE}</b>
          </p>
          <p className="text-[8pt] text-slate-500 mt-[1.5mm] leading-snug">Регистрация за минуту — по почте или через Яндекс ID</p>
        </div>
      </div>

      <div className="mx-[10mm] mt-[4mm] rounded-[2.5mm] px-[4mm] py-[3mm]" style={{ background: "#fffbeb" }}>
        <p className="text-[8.6pt] leading-snug text-slate-700">
          <b style={{ color: NAVY }}>Бесплатно без подписки:</b> первый урок каждого предмета, проверка домашки по фото и 30+ мини-курсов.
          Полный доступ — <b style={{ color: NAVY }}>1 490 ₽/мес</b>, дешевле одного занятия с репетитором.
        </p>
      </div>

      <div className="mt-auto mx-[10mm] pb-[5mm] pt-[2.5mm] text-[6.5pt] text-slate-400 leading-snug border-t border-slate-100">
        ООО «МАТ-Лабс», Самара. Покажи листовку родителям — подписку оформляет взрослый. Подробности на сайте учисьпро.рф
      </div>
    </div>
  );
}

/** Печать: лист А4 альбомный = две листовки А5 с линией отреза. */
export default function StudentLeaflet() {
  return (
    <div className="min-h-screen bg-slate-200 font-golos">
      <Seo
        title="Листовка для школьников — УЧИСЬПРО"
        description="Печатная рекламная листовка УЧИСЬПРО для школьников 1–11 класса с QR-кодом."
        canonical="https://учисьпро.рф/leaflet/shkolniki"
        noindex
      />
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { background: #fff !important; height: 210mm !important; overflow: hidden !important; }
          body * { visibility: hidden; }
          .leaflet-sheet, .leaflet-sheet * { visibility: visible; }
          .leaflet-sheet { position: fixed !important; left: 0; top: 0; box-shadow: none !important; margin: 0 !important; }
          .leaflet-toolbar { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="leaflet-toolbar sticky top-0 z-10 bg-white border-b border-slate-300">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-slate-800 text-sm md:text-base">Листовка для школьников (А5)</h1>
            <p className="text-slate-500 text-xs md:text-sm">Лист А4 = 2 листовки. Печать: масштаб 100%, без полей, «Фон» включён.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <Icon name="Home" size={16} /> На сайт
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 text-sm font-semibold"
            >
              <Icon name="Printer" size={16} /> Печать / PDF
            </button>
          </div>
        </div>
      </div>

      <div className="py-8 px-4 flex justify-start lg:justify-center overflow-x-auto">
        <div className="leaflet-sheet bg-white shadow-xl flex relative flex-shrink-0" style={{ width: "297mm", height: "210mm" }}>
          <Leaflet />
          <div className="relative" style={{ width: "1mm" }}>
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-400" />
            <span className="absolute left-1/2 -translate-x-1/2 top-[3mm] bg-white text-slate-400 text-[9pt] leading-none">✂</span>
          </div>
          <Leaflet />
        </div>
      </div>
    </div>
  );
}
