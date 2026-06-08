interface PdfPayload {
  title: string;
  subjectLabel: string;
  gradeLabel: string;
  modeLabel: string;
  verdict: "correct" | "errors" | "review";
  resultText: string;
  /** data:URL или http(s) ссылки на фото задания. */
  images: string[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Открывает чистое окно с разбором и вызывает печать — пользователь сохраняет в PDF. */
export function printHomeworkPdf(p: PdfPayload) {
  const verdictBadge =
    p.verdict === "correct"
      ? '<span class="badge badge-ok">✓ Решение верное</span>'
      : p.verdict === "errors"
      ? '<span class="badge badge-warn">⚠ Есть ошибки</span>'
      : '<span class="badge badge-info">📖 Разбор задачи</span>';

  const imagesHtml = p.images
    .map(
      (src, i) =>
        `<figure class="photo"><img src="${src}" alt="Фото ${i + 1}" /><figcaption>Фото ${i + 1}</figcaption></figure>`
    )
    .join("");

  const dateStr = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(p.title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 32px 36px; }
  .head { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 14px; margin-bottom: 20px; }
  .brand { font-weight: 800; font-size: 18px; color: #7c3aed; letter-spacing: .5px; }
  .date { color: #6b7280; font-size: 12px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  .meta { color: #4b5563; font-size: 13px; margin-bottom: 14px; }
  .badge { display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 18px; }
  .badge-ok { background: #d1fae5; color: #065f46; }
  .badge-warn { background: #fef3c7; color: #92400e; }
  .badge-info { background: #cffafe; color: #155e75; }
  .photos { display: flex; flex-wrap: wrap; gap: 10px; margin: 14px 0 22px; }
  .photo { margin: 0; width: 160px; }
  .photo img { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; }
  .photo figcaption { font-size: 11px; color: #6b7280; text-align: center; margin-top: 4px; }
  .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: .6px; color: #7c3aed; font-weight: 700; margin: 20px 0 8px; }
  .result { white-space: pre-wrap; font-size: 14px; line-height: 1.65; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 16px 20px; } .photo { width: 140px; } }
</style>
</head>
<body>
  <div class="head">
    <span class="brand">🚀 УЧИСЬПРО · Домашка</span>
    <span class="date">${dateStr}</span>
  </div>
  <h1>${escapeHtml(p.title)}</h1>
  <div class="meta">${escapeHtml(p.subjectLabel)} · ${escapeHtml(p.gradeLabel)} · ${escapeHtml(p.modeLabel)}</div>
  ${verdictBadge}
  ${p.images.length ? `<div class="section-title">Задание</div><div class="photos">${imagesHtml}</div>` : ""}
  <div class="section-title">Разбор</div>
  <div class="result">${escapeHtml(p.resultText)}</div>
  <div class="footer">Сгенерировано в УЧИСЬПРО · учисьпро.рф</div>
  <script>
    window.onload = function () {
      var imgs = Array.prototype.slice.call(document.images);
      var pending = imgs.filter(function (i) { return !i.complete; }).length;
      function go() { setTimeout(function () { window.print(); }, 250); }
      if (pending === 0) { go(); return; }
      imgs.forEach(function (img) {
        if (img.complete) return;
        img.addEventListener('load', function () { if (--pending <= 0) go(); });
        img.addEventListener('error', function () { if (--pending <= 0) go(); });
      });
    };
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
