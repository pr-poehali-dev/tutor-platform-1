import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { PERIODS } from "./types";

interface Props {
  period: number;
  setPeriod: (p: number) => void;
  aiLoading: boolean;
  onRunAi: () => void;
}

export default function DashboardHeader({ period, setPeriod, aiLoading, onRunAi }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <Link to="/admin" className="text-white/45 text-xs hover:text-white flex items-center gap-1 mb-1">
          <Icon name="ChevronLeft" size={12} /> Админ-хаб
        </Link>
        <h1 className="font-montserrat text-3xl md:text-4xl font-black flex items-center gap-3">
          <Icon name="Target" size={28} className="text-purple-300" />
          Отдел маркетинга
        </h1>
        <p className="text-white/55 text-sm mt-1">Стратегия, аналитика, задачи отделу продаж</p>
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <div className="flex gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p.id
                  ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/20 text-white border border-white/15"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Button
          onClick={onRunAi}
          disabled={aiLoading}
          className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400"
        >
          <Icon name={aiLoading ? "Loader2" : "Sparkles"} size={14} className={`mr-1.5 ${aiLoading ? "animate-spin" : ""}`} />
          {aiLoading ? "ИИ думает..." : "Стратегия от ИИ"}
        </Button>
        <Link to="/admin/sales">
          <Button variant="outline" size="sm" className="border-white/15">
            <Icon name="BarChart3" size={14} className="mr-1" /> Продажи
          </Button>
        </Link>
      </div>
    </div>
  );
}
