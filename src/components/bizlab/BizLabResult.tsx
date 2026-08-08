import { Link } from "react-router-dom";
import { BizMetrics, BizVerdict } from "./types";
import { BoardReview } from "./api";
import VerdictView from "./VerdictView";
import BoardView from "./BoardView";

export default function BizLabResult({
  verdict,
  metrics,
  review,
  onRestart,
}: {
  verdict: BizVerdict;
  metrics: BizMetrics;
  review: BoardReview;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-8">
      <VerdictView verdict={verdict} m={metrics} />

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
        <button
          onClick={onRestart}
          className="mt-4 w-full rounded-xl border border-white/10 py-3 text-white/60 hover:text-white hover:bg-white/5 text-sm font-bold transition-colors"
        >
          Пересчитать с другими цифрами
        </button>
      </div>
    </div>
  );
}
