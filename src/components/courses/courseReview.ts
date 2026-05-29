// Короткие отзывы для карточек курсов. Выбираются детерминированно по id курса,
// чтобы у каждого курса был стабильный отзыв (не прыгал при ререндере).

interface MiniReview {
  initials: string;
  name: string;
  text: string;
}

const REVIEWS: MiniReview[] = [
  { initials: "ДК", name: "Дмитрий", text: "Объясняет понятнее, чем в школе. Наконец-то разобрался." },
  { initials: "АС", name: "Анна", text: "Удобно заниматься в своём темпе, ИИ отвечает сразу." },
  { initials: "ИВ", name: "Иван", text: "Готовился по этому курсу — сдал лучше, чем ожидал." },
  { initials: "МП", name: "Мария", text: "Дочке зашло, занимается сама без напоминаний." },
  { initials: "СН", name: "Сергей", text: "Структурно и по делу, без воды. Рекомендую." },
  { initials: "ЕЛ", name: "Елена", text: "Голосовой формат — топ, слушаю по дороге." },
  { initials: "ПК", name: "Павел", text: "За пару недель подтянул тему, которую не понимал." },
  { initials: "ОР", name: "Ольга", text: "Понятные разборы и примеры. Очень помогло." },
];

const ACCENTS = [
  "from-purple-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-green-500 to-emerald-500",
  "from-amber-500 to-orange-500",
];

export function getCourseReview(courseId: number) {
  const r = REVIEWS[courseId % REVIEWS.length];
  const color = ACCENTS[courseId % ACCENTS.length];
  return { ...r, color };
}
