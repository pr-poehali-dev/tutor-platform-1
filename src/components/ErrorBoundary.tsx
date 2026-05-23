import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * ErrorBoundary — глобальный перехватчик ошибок рендера React.
 * Предотвращает «белый экран» при падении компонента.
 *
 * Использование:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Логируем в консоль (в проде это попадёт в Sentry/аналитику при наличии)
     
    console.error("[ErrorBoundary] Caught error:", error, info);
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-purple-500/20 bg-card p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Что-то пошло не так
            </h1>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Произошла непредвиденная ошибка. Мы уже знаем о проблеме. Попробуй
            перезагрузить страницу или вернуться на главную.
          </p>

          {import.meta.env.DEV && (
            <pre className="text-xs bg-muted/40 rounded-lg p-3 mb-4 overflow-auto max-h-40 text-red-400">
              {error.message}
              {error.stack ? `\n\n${error.stack}` : ""}
            </pre>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              Перезагрузить
            </button>
            <button
              onClick={this.reset}
              className="px-4 py-2 rounded-lg border border-purple-500/30 text-foreground text-sm font-medium hover:bg-purple-500/10 transition-colors"
            >
              Попробовать снова
            </button>
            <button
              onClick={this.handleGoHome}
              className="px-4 py-2 rounded-lg text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
