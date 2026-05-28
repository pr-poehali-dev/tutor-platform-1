export function dt(iso: string | null): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}
