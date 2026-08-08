import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { BizAnswers, BizMetrics, BizVerdict } from "./types";
import { BoardReview } from "./api";
import VerdictView from "./VerdictView";
import BoardView from "./BoardView";
import { printBizlabPdf } from "@/lib/bizlabPdf";

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
  const savePdf = () => printBizlabPdf(answers, metrics, verdict, review);

  return (
    <div className="space-y-8">
      <VerdictView verdict={verdict} m={metrics} />

      {/* Забрать расчёт с собой: показать партнёру, взять в банк, вернуться через месяц */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-montserrat font-bold text-white mb-1">Забрать расчёт с собой</h3>
          <p className="text-white/55 text-sm">
            Все ваши цифры, вердикт, разбор совета и чек-лист — одним файлом. Удобно показать
            партнёру или вернуться к нему через месяц.
          </p>
        </div>
        <button
          onClick={savePdf}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/8 hover:bg-white/14 border border-white/15 px-5 py-3 text-sm font-bold text-white transition-colors whitespace-nowrap"
        >
          <Icon name="Download" size={16} />
          Скачать план в PDF
        </button>
      </div>

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
          <button
            onClick={savePdf}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white hover:scale-[1.01] transition-transform"
          >
            <Icon name="Download" size={16} />
            Скачать план в PDF
          </button>
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