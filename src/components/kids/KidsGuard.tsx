import { useEffect, useState, ReactNode } from "react";
import { useKidsAccess } from "@/components/kids/useKidsAccess";
import KidsPaywall from "@/components/kids/KidsPaywall";

interface Props {
  /** Уникальный id занятия (например "reading", "games", "poznavashka"). */
  activityId: string;
  children: ReactNode;
}

/**
 * Гейт доступа к занятию модуля «Малыш».
 * Первое занятие открывается бесплатно, остальные — только по подписке.
 * Если доступа нет — показывает окно с предложением оформить абонемент.
 */
export default function KidsGuard({ activityId, children }: Props) {
  const { canOpen, markOpened } = useKidsAccess();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = canOpen(activityId);
    if (ok) {
      markOpened(activityId);
      setAllowed(true);
    } else {
      setAllowed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, canOpen]);

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <KidsPaywall onClose={() => window.history.back()} />
      </div>
    );
  }

  return <>{children}</>;
}
