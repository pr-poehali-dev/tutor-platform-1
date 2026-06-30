import Icon from "@/components/ui/icon";

export function LoadingState() {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center text-white">
      <div className="text-center">
        <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3 text-cyan-300" />
        <p className="text-white/55 text-sm">Загружаю статью...</p>
      </div>
    </div>
  );
}

interface LimitedStateProps {
  limited: { limit?: number; message?: string };
  navigate: (to: string) => void;
}

export function LimitedState({ limited, navigate }: LimitedStateProps) {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center text-white px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="font-montserrat font-black text-2xl mb-2">
          Лимит на сегодня исчерпан
        </h1>
        <p className="text-white/70 text-sm mb-6">
          {limited.message ||
            `Бесплатно доступно ${limited.limit || 5} разборов произведений в день. Возвращайся завтра или открой полный доступ на платформе.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm"
          >
            <Icon name="Sparkles" size={14} />
            Открыть полный доступ
          </button>
          <button
            onClick={() => navigate("/feed")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-white font-bold text-sm"
          >
            <Icon name="ArrowLeft" size={14} />
            В ленту
          </button>
        </div>
      </div>
    </div>
  );
}

interface NotFoundStateProps {
  navigate: (to: string) => void;
}

export function NotFoundState({ navigate }: NotFoundStateProps) {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center text-white px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📭</div>
        <h1 className="font-montserrat font-black text-2xl mb-2">Статья не найдена</h1>
        <p className="text-white/65 text-sm mb-5">
          Возможно, она снята с публикации или ссылка устарела.
        </p>
        <button
          onClick={() => navigate("/feed")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold text-sm"
        >
          <Icon name="ArrowLeft" size={14} />
          Вернуться в ленту
        </button>
      </div>
    </div>
  );
}
