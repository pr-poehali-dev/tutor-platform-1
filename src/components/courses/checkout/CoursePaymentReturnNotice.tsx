import Icon from "@/components/ui/icon";

interface CoursePaymentReturnNoticeProps {
  checkingReturn: boolean;
  onRefresh: () => void;
  onRestart: () => void;
}

export default function CoursePaymentReturnNotice({
  checkingReturn,
  onRefresh,
  onRestart,
}: CoursePaymentReturnNoticeProps) {
  if (checkingReturn) {
    return (
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5 mb-5 text-center">
        <Icon name="Loader2" size={28} className="animate-spin text-cyan-300 mx-auto mb-3" />
        <p className="text-cyan-200 font-bold text-sm mb-1">Проверяем оплату...</p>
        <p className="text-white/60 text-xs">Получаем подтверждение от ЮKassa. Это занимает до 10 секунд.</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-5">
      <p className="text-amber-200 font-bold text-sm flex items-center gap-2 mb-2">
        <Icon name="Clock" size={16} />
        Оплата ещё не подтверждена
      </p>
      <p className="text-white/70 text-sm mb-4">
        Если ты только что оплатил — банк может отправлять подтверждение до 1–2 минут. Обнови страницу позже или начни заново.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-white/12 transition-colors"
        >
          <Icon name="RefreshCw" size={14} />
          Проверить ещё раз
        </button>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm px-4 py-2.5 transition-colors"
        >
          Начать заново
        </button>
      </div>
    </div>
  );
}
