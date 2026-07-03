import type { GrantApplication, GrantFull } from "./api";

// Экранирование HTML — защита от «сломанного» документа при спецсимволах.
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function p(text: unknown): string {
  return `<p>${esc(text).replace(/\n/g, "<br/>")}</p>`;
}

function h(title: string): string {
  return `<h2>${esc(title)}</h2>`;
}

function list(items: unknown[]): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

/**
 * Собирает заявку в Word-документ (.doc) и скачивает её.
 * Простой и надёжный способ: HTML с MS Office-заголовком, без внешних библиотек.
 * Word открывает такой файл штатно.
 */
export function downloadGrantDoc(app: GrantApplication): void {
  const full: GrantFull | null | undefined = app.full;
  if (!full) return;

  const title = esc(full.project_title || app.project_title || "Грантовая заявка");
  const parts: string[] = [];

  parts.push(`<h1>${title}</h1>`);
  parts.push(`<p><i>Заявка на: ${esc(app.grant_name)}</i></p>`);

  if (full.annotation) {
    parts.push(h("Аннотация проекта"), p(full.annotation));
  }
  if (full.relevance) {
    parts.push(h("Актуальность и проблема"), p(full.relevance));
  }
  if (full.goal) {
    parts.push(h("Цель проекта"), p(full.goal));
  }
  if (full.tasks?.length) {
    parts.push(h("Задачи проекта"), list(full.tasks));
  }
  if (full.target_audience) {
    parts.push(h("Целевая аудитория"), p(full.target_audience));
  }
  if (full.social_effect) {
    parts.push(h("Социальный эффект"), p(full.social_effect));
  }
  if (full.team?.length) {
    parts.push(
      h("Команда проекта"),
      `<ul>${full.team
        .map((m) => `<li><b>${esc(m.role)}</b> — ${esc(m.responsibility)}</li>`)
        .join("")}</ul>`
    );
  }
  if (full.calendar_plan?.length) {
    parts.push(
      h("Календарный план"),
      `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
        <tr><th>Этап</th><th>Сроки</th><th>Результат</th></tr>
        ${full.calendar_plan
          .map(
            (s) =>
              `<tr><td>${esc(s.stage)}</td><td>${esc(s.period)}</td><td>${esc(s.result)}</td></tr>`
          )
          .join("")}
      </table>`
    );
  }
  if (full.budget?.length) {
    parts.push(
      h("Смета и бюджет"),
      `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
        <tr><th>Статья расходов</th><th>Сумма</th><th>Обоснование</th></tr>
        ${full.budget
          .map(
            (b) =>
              `<tr><td>${esc(b.item)}</td><td>${esc(b.amount)}</td><td>${esc(b.justification)}</td></tr>`
          )
          .join("")}
        ${
          full.budget_total
            ? `<tr><td><b>Итого</b></td><td colspan="2"><b>${esc(full.budget_total)}</b></td></tr>`
            : ""
        }
      </table>`
    );
  }
  if (full.kpi?.length) {
    parts.push(h("Показатели результата (KPI)"), list(full.kpi));
  }
  if (full.risks?.length) {
    parts.push(
      h("Риски и их минимизация"),
      `<ul>${full.risks
        .map((r) => `<li><b>${esc(r.risk)}</b> — ${esc(r.mitigation)}</li>`)
        .join("")}</ul>`
    );
  }
  if (full.expert_review) {
    const r = full.expert_review;
    parts.push(h("Разбор экспертом"));
    if (r.score != null) parts.push(p(`Оценка шансов: ${esc(r.score)} из 100`));
    if (r.strengths?.length) {
      parts.push(`<p><b>Сильные стороны:</b></p>`, list(r.strengths));
    }
    if (r.weaknesses?.length) {
      parts.push(`<p><b>Что усилить перед подачей:</b></p>`, list(r.weaknesses));
    }
    if (r.verdict) parts.push(p(`Вывод: ${esc(r.verdict)}`));
  }
  if (full.cover_letter) {
    parts.push(h("Сопроводительное письмо"), p(full.cover_letter));
  }

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; line-height: 1.5; }
  h1 { font-size: 18pt; text-align: center; }
  h2 { font-size: 14pt; border-bottom: 1px solid #999; padding-bottom: 4px; margin-top: 18px; }
  table { margin: 8px 0; }
  th { background: #f0f0f0; text-align: left; }
  ul { margin: 6px 0; }
</style>
</head>
<body>${parts.join("\n")}</body>
</html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  const safeName = (full.project_title || app.project_title || "zayavka")
    .replace(/[^\wа-яёА-ЯЁ\s-]/gi, "")
    .trim()
    .slice(0, 60)
    .replace(/\s+/g, "_");

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName || "zayavka"}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
