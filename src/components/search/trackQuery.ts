import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["search-analytics"];

/**
 * Записываем, что люди ищут и что при этом находят.
 *
 * Зачем: запросы без результата — прямая подсказка, какого контента не хватает
 * на сайте. Это дешевле любого опроса: люди сами говорят, чего хотят.
 *
 * Отправка «в фоне»: если сбор аналитики недоступен, посетитель этого
 * не заметит — поиск продолжает работать как обычно.
 */
export function trackQuery(
  query: string,
  source: "search" | "courses" | "library" | "home",
  foundCount: number,
  pickedIds?: string[],
) {
  const q = query.trim();
  if (!URL || q.length < 2) return;

  try {
    const uid = localStorage.getItem("user_id") || "";
    fetch(URL, {
      method: "POST",
      headers: uid
        ? { "Content-Type": "application/json", "X-User-Id": uid }
        : { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        query: q.slice(0, 300),
        source,
        found_count: foundCount,
        picked_ids: (pickedIds || []).join(",").slice(0, 300),
      }),
    }).catch(() => {
      /* аналитика не должна ломать поиск */
    });
  } catch {
    /* noop */
  }
}
