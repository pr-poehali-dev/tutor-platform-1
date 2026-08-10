import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { BizAnswers, BizMetrics, BizVerdict } from "./types";
import { BoardReview } from "./api";
import VerdictView from "./VerdictView";
import BoardView from "./BoardView";
import { printBizlabPdf } from "@/lib/bizlabPdf";
import { getSavedAccess } from "@/components/intensive/api";
import { REPORT_PRICE, REPORT_TRACK } from "./report/reportContent";

export default function BizLabResult({
  verdict,
  metrics,
  review,
  answers,
  onRestart,
}: {
  verdict: BizVerdict;
  metrics: BizMetrics;
  review: BoardReview;
  answers: BizAnswers;
  onRestart: () => void;
}) {
  // PDF-разбор — платный продукт. На экране расчёт виден бесплатно,
  // документ для сохранения открывается после оплаты.
  const hasReport = !!getSavedAccess(REPORT_TRACK);
  const savePdf = () => printBizlabPdf(answers, metrics, verdict, review);

  return (
    <div className="space-y-8">
      <VerdictView verdict={verdict} m={metrics} />

      {/* Забрать расчёт с собой: показать партнёру, взять в банк, вернуться через месяц */}
      {hasReport ? (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-montserrat font-bold text-white mb-1">
              Ваш разбор готов к скачиванию
            </h3>
            <p className="text-white/55 text-sm">
              Все цифры, вердикт, разбор совета, риски и план на 90 дней — одним документом.
            </p>
          </div>
          <button
            onClick={savePdf}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white hover:scale-[1.02] transition-transform whitespace-nowrap"
          >
            <Icon name="Download" size={16} />
            Скачать PDF-разбор
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-montserrat font-bold text-white mb-1">Забрать расчёт с собой</h3>
            <p className="text-white/55 text-sm">
              Этот расчёт исчезнет, когда вы закроете вкладку. Полный разбор на 10-12 страниц —
              с рисками, планом проверки спроса и первыми 90 днями — сохраняется документом:
              показать партнёру, взять в банк, сверить через месяц.
            </p>
          </div>
          <Link
            to="/biz-report"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-white hover:scale-[1.02] transition-transform whitespace-nowrap shadow-lg shadow-amber-500/20"
          >
            <Icon name="FileText" size={16} />
            Получить за {REPORT_PRICE} ₽
          </Link>
        </div>
      )}

      <BoardView r={review} />

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-montserrat font-black text-lg text-white mb-3">Что дальше</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/mini-course/business-2026"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors group"
          >
            <span className="text-2xl">📚</span>
            <div className="min-w-0">
              <div className="font-bold text-white group-hover:text-primary transition-colors">
                Курс «БИЗНЕС 2026»
              </div>
              <div className="text-white/50 text-sm">Налоги, найм, договоры, учёт</div>
            </div>
          </Link>
          <Link
            to="/fin-advisor"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors group"
          >
            <span className="text-2xl">💰</span>
            <div className="min-w-0">
              <div className="font-bold text-white group-hover:text-primary transition-colors">
                Финансовый консультант
              </div>
              <div className="text-white/50 text-sm">Разбор действующего бизнеса</div>
            </div>
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {hasReport ? (
            <button
              onClick={savePdf}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white hover:scale-[1.01] transition-transform"
            >
              <Icon name="Download" size={16} />
              Скачать PDF-разбор
            </button>
          ) : (
            <Link
              to="/biz-report"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white hover:scale-[1.01] transition-transform"
            >
              <Icon name="FileText" size={16} />
              Разбор в PDF за {REPORT_PRICE} ₽
            </Link>
          )}
          <button
            onClick={onRestart}
            className="rounded-xl border border-white/10 py-3 text-white/60 hover:text-white hover:bg-white/5 text-sm font-bold transition-colors"
          >
            Пересчитать с другими цифрами
          </button>
        </div>
      </div>
    </div>
  );
}