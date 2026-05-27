import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Error Boundary вокруг плеера сказок. Если внутри случается исключение,
 * вместо «слетевшей» страницы показываем понятное сообщение и кнопки
 * «Перезагрузить» / «Назад в библиотеку».
 */
export default class TalePlayerBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Что-то пошло не так" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
     
    console.error("[TalePlayer crash]", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: "" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="bg-card border border-rose-500/30 rounded-3xl p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-4">
          🦊
        </div>
        <p className="font-montserrat font-black text-white text-lg mb-2">
          Ой! Лиса немного запуталась
        </p>
        <p className="text-white/60 text-sm mb-5 max-w-md mx-auto">
          Не получилось включить эту сказку. Попробуй обновить страницу или выбрать другую.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="RotateCcw" size={14} />
            Попробовать ещё раз
          </button>
          <Link
            to="/kids/library"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Icon name="ArrowLeft" size={14} />
            В библиотеку
          </Link>
        </div>
      </div>
    );
  }
}
