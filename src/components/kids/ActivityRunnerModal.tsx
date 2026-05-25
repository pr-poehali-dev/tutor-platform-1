import { useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClose: () => void;
  hideHeader?: boolean;
}

/** Модальное окно ActivityRunner с подложкой и закрытием по Escape. */
export default function ActivityRunnerModal({ children, onClose, hideHeader = false }: Props) {
  // Закрытие по Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg bg-card border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fadeIn max-h-[92vh] overflow-y-auto scrollbar-hide">
        {!hideHeader && null}
        {children}
      </div>
    </div>
  );
}
