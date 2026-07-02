import type { BuilderCourse } from "@/components/builder/api";

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TYPE_LABEL: Record<string, string> = {
  theory: "Теория",
  practice: "Практика",
  test: "Проверка",
  project: "Проект",
};

/** Открывает окно с оформленным курсом и вызывает печать — пользователь сохраняет в PDF. */
export function printCoursePdf(c: BuilderCourse) {
  const dateStr = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const outcomes = (c.outcomes || [])
    .map((o) => `<li>${esc(o)}</li>`)
    .join("");

  const modulesHtml = (c.modules || [])
    .map((m, mi) => {
      const lessons = (m.lessons || [])
        .map((l) => {
          const summary = (l.summary || []).map((s) => `<li>${esc(s)}</li>`).join("");
          const quiz = l.quiz?.q
            ? `<div class="quiz"><b>Квиз:</b> ${esc(l.quiz.q)}<ul class="opts">${(l.quiz.options || [])
                .map(
                  (opt, oi) =>
                    `<li class="${oi === l.quiz.correct ? "correct" : ""}">${esc(opt)}${
                      oi === l.quiz.correct ? " ✓" : ""
                    }</li>`
                )
                .join("")}</ul></div>`
            : "";
          return `<div class="lesson">
            <div class="lesson-head"><span class="ltype">${esc(TYPE_LABEL[l.type] || "Урок")}</span> <b>${esc(l.title)}</b></div>
            ${summary ? `<ul class="summary">${summary}</ul>` : ""}
            ${l.task ? `<div class="task"><b>Задание:</b> ${esc(l.task)}</div>` : ""}
            ${quiz}
          </div>`;
        })
        .join("");
      return `<div class="module">
        <div class="module-title">Модуль ${mi + 1}. ${esc(m.title)}</div>
        ${lessons}
      </div>`;
    })
    .join("");

  const mk = c.marketing;
  const marketingHtml = mk
    ? `<div class="section-title">Маркетинг-пакет</div>
       ${
         mk.headlines?.length
           ? `<div class="sub">Заголовки для лендинга</div><ul>${mk.headlines
               .map((h) => `<li>${esc(h)}</li>`)
               .join("")}</ul>`
           : ""
       }
       ${
         mk.social_posts?.length
           ? `<div class="sub">Посты для соцсетей</div><ul>${mk.social_posts
               .map((p) => `<li>${esc(p)}</li>`)
               .join("")}</ul>`
           : ""
       }
       ${
         mk.email_sequence?.length
           ? `<div class="sub">Email-цепочка запуска</div><ol>${mk.email_sequence
               .map((e) => `<li><b>${esc(e.subject)}</b> — ${esc(e.goal)}</li>`)
               .join("")}</ol>`
           : ""
       }`
    : "";

  const bz = c.business;
  const businessHtml = bz
    ? `<div class="section-title">Бизнес-подсказки</div>
       <table class="biz">
         <tr><td>Рекомендованная цена</td><td>${esc(bz.price_recommendation)}</td></tr>
         <tr><td>УТП</td><td>${esc(bz.usp)}</td></tr>
         <tr><td>Каналы продаж</td><td>${esc((bz.channels || []).join(", "))}</td></tr>
       </table>`
    : "";

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>${esc(c.course_title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 32px 40px; }
  .head { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 14px; margin-bottom: 22px; }
  .brand { font-weight: 800; font-size: 18px; color: #7c3aed; letter-spacing: .5px; }
  .date { color: #6b7280; font-size: 12px; }
  h1 { font-size: 26px; margin: 0 0 6px; }
  .tagline { color: #7c3aed; font-size: 15px; margin-bottom: 10px; }
  .desc { color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
  .facts { color: #6b7280; font-size: 13px; margin-bottom: 8px; }
  .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: .6px; color: #7c3aed; font-weight: 800; margin: 26px 0 10px; border-top: 1px solid #eee; padding-top: 16px; }
  .sub { font-size: 12px; font-weight: 700; color: #6b7280; margin: 12px 0 4px; text-transform: uppercase; letter-spacing: .4px; }
  ul, ol { margin: 4px 0 10px; padding-left: 20px; }
  li { font-size: 13px; line-height: 1.5; margin-bottom: 3px; }
  .module { margin-bottom: 16px; page-break-inside: avoid; }
  .module-title { font-size: 15px; font-weight: 800; color: #1a1a2e; background: #f5f3ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; }
  .lesson { border-left: 3px solid #ddd6fe; padding: 4px 0 6px 12px; margin: 0 0 10px 4px; page-break-inside: avoid; }
  .lesson-head { font-size: 14px; margin-bottom: 4px; }
  .ltype { display: inline-block; font-size: 10px; font-weight: 700; background: #ede9fe; color: #6d28d9; padding: 2px 7px; border-radius: 5px; margin-right: 6px; text-transform: uppercase; }
  .summary li { color: #4b5563; }
  .task { font-size: 12px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 5px 9px; margin: 5px 0; }
  .quiz { font-size: 12px; color: #374151; margin-top: 4px; }
  .opts { list-style: none; padding-left: 0; margin: 3px 0; }
  .opts li { display: inline-block; border: 1px solid #e5e7eb; border-radius: 5px; padding: 1px 8px; margin: 2px 4px 2px 0; font-size: 11px; }
  .opts li.correct { border-color: #6ee7b7; background: #ecfdf5; color: #065f46; font-weight: 700; }
  table.biz { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.biz td { border: 1px solid #e5e7eb; padding: 7px 10px; }
  table.biz td:first-child { font-weight: 700; color: #6b7280; width: 200px; background: #f9fafb; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 16px 22px; } }
</style>
</head>
<body>
  <div class="head">
    <span class="brand">🚀 УЧИСЬПРО · Конструктор курсов</span>
    <span class="date">${dateStr}</span>
  </div>
  <h1>${esc(c.course_title)}</h1>
  ${c.tagline ? `<div class="tagline">${esc(c.tagline)}</div>` : ""}
  ${c.description ? `<div class="desc">${esc(c.description)}</div>` : ""}
  <div class="facts">${
    c.target_audience ? `Для кого: ${esc(c.target_audience)}` : ""
  }${c.estimated_hours ? ` · ~${c.estimated_hours} ч` : ""}</div>
  ${outcomes ? `<div class="section-title">Чему научит курс</div><ul>${outcomes}</ul>` : ""}
  <div class="section-title">Программа курса</div>
  ${modulesHtml}
  ${marketingHtml}
  ${businessHtml}
  <div class="footer">Сгенерировано в УЧИСЬПРО · учисьпро.рф</div>
  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 300); };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Разрешите всплывающие окна, чтобы сохранить PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
