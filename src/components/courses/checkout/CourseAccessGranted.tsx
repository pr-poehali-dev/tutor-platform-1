import Icon from "@/components/ui/icon";

interface CourseAccessGrantedProps {
  freeForever: boolean;
  promoOn: boolean;
  hasSubscription: boolean;
  onStart: () => void;
}

export default function CourseAccessGranted({
  freeForever,
  promoOn,
  hasSubscription,
  onStart,
}: CourseAccessGrantedProps) {
  return (
    <>
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-5">
        <p className="text-green-300 font-bold text-sm flex items-center gap-2 mb-2">
          <Icon name={freeForever ? "Gift" : "CheckCircle2"} size={18} />
          {freeForever
            ? "Этот курс бесплатный навсегда 🎁"
            : promoOn ? "Открыто бесплатно по акции ДОБРО ❤️"
            : hasSubscription ? "Курс открыт по подписке"
            : "Доступ к курсу открыт"}
        </p>
        <p className="text-white/70 text-sm">
          {freeForever
            ? "Все уроки доступны бесплатно — без оплаты, без карты и без ограничения по времени. Начинай в любой момент!"
            : promoOn
            ? "Все уроки этого курса открыты бесплатно — без оплаты и без карты. Можно начинать прямо сейчас!"
            : "Все уроки курса доступны. Открывай программу и продолжай с любого места."}
        </p>
        <button
          onClick={onStart}
          className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity"
        >
          <Icon name="Play" size={14} />
          Начать обучение
        </button>
      </div>
    </>
  );
}