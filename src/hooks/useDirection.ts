import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Direction,
  LearnerDirection,
  directionForPath,
  getSavedDirection,
  isLearner,
  saveDirection,
} from "@/lib/directions";

/**
 * Направление текущей страницы + последний выбор посетителя.
 *  - page   — к чему относится сама страница
 *  - active — какое направление подсвечивать (страница или запомненный выбор)
 * Заход на страницу направления запоминает его: при следующем визите
 * главная предложит «Продолжить» именно там.
 */
export function useDirection(): { page: Direction; active: LearnerDirection | null } {
  const { pathname } = useLocation();
  const page = directionForPath(pathname);
  const [saved, setSaved] = useState<LearnerDirection | null>(() => getSavedDirection());

  useEffect(() => {
    if (isLearner(page)) {
      saveDirection(page);
      setSaved(page);
    }
  }, [page]);

  return { page, active: isLearner(page) ? page : saved };
}
