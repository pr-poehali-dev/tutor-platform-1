import type { BoardReview } from "@/components/bizlab/api";
import type { BizAnswers, BizMetrics, BizVerdict } from "@/components/bizlab/types";
import { fmt, fmt1 } from "@/components/bizlab/calc";

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TAX_LABELS: Record<string, string> = {
  npd: "Самозанятость (НПД)",
  usn6: "УСН «Доходы», 6%",
  usn15: "УСН «Доходы минус расходы», 15%",
  patent: "Патент",
  osno: "ОСНО (с НДС)",
};

const DEMAND_LABELS: Record<string, string> = {
  no: "не проверялся",
  asked: "только опрос знакомых (не считается проверкой)",
  preorder: "есть предзаказы или предоплаты",
  sales: "были реальные продажи",
};

const SOURCE_LABELS: Record<string, string> = {
  own: "свои накопления",
  loan: "кредит или займ",
  mixed: "часть своих, часть заёмных",
  investor: "инвестор или партнёр",
  grant: "грант, субсидия",
};

const ZONE_COLOR = { green: "#059669", amber: "#d97706", red: "#e11d48" };
const ZONE_BG = { green: "#ecfdf5", amber: "#fffbeb", red: "#fff1f2" };

/** Открывает окно с оформленным бизнес-планом и вызывает печать — пользователь сохраняет в PDF. */
export function printBizlabPdf(
  answers: BizAnswers,
  m: BizMetrics,
  verdict: BizVerdict,
  review: BoardReview,
) {
  const dateStr = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const a = (k: string) => esc(answers[k] || "—");
  const color = ZONE_COLOR[verdict.zone];
  const bg = ZONE_BG[verdict.zone];

  const metricRow = (label: string, value: string, note = "") =>
    `<div class="metric"><div class="m-label">${esc(label)}</div><div class="m-value">${esc(value)}</div>${
      note ? `<div class="m-note">${esc(note)}</div>` : ""
    }</div>`;

  const metricsHtml = [
    metricRow("Маржа с продажи", `${fmt(m.unitMargin)} ₽`, `${fmt1(m.marginPct)}% от цены`),
    metricRow(
      "Точка безубыточности",
      Number.isFinite(m.breakEvenUnits) ? `${fmt(m.breakEvenUnits)} шт/мес` : "не достигается",
      Number.isFinite(m.breakEvenRevenue) ? `выручка ${fmt(m.breakEvenRevenue)} ₽` : "",
    ),
    metricRow("Прибыль в месяц", `${fmt(m.plannedProfit)} ₽`, `при ${fmt(m.plannedUnits)} продажах`),
    metricRow("Запас прочности", `${fmt1(m.safetyMarginPct)}%`, "падение продаж до убытка"),
    metricRow("Постоянные расходы", `${fmt(m.fixedMonthly)} ₽/мес`, "платите даже без продаж"),
    metricRow(
      "Стресс-тест −40%",
      `${fmt(m.stressProfit)} ₽`,
      m.stressSurvives ? "переживёт спад" : "уйдёт в убыток",
    ),
    metricRow("Подушка", `${fmt1(m.runwayMonths)} мес.`, "проживёте без выручки"),
    metricRow(
      "Окупаемость",
      Number.isFinite(m.paybackMonths) ? `${fmt(m.paybackMonths)} мес.` : "не окупится",
      `вложено ${fmt(m.startCapital)} ₽`,
    ),
  ].join("");

  const loanHtml =
    m.loanMonthly > 0
      ? `<div class="section-title">Заёмные деньги</div>
         <div class="metrics">
           ${metricRow("Платёж по кредиту", `${fmt(m.loanMonthly)} ₽/мес`, "независимо от выручки")}
           ${metricRow("Покрытие платежа", `${fmt1(m.debtCover)}x`, "норма — от 2")}
           ${metricRow("Клиент стоит", `${fmt(m.cac)} ₽`, `приносит ${fmt(m.ltv)} ₽`)}
           ${metricRow("LTV / CAC", fmt1(m.ltvCac), "норма — от 3")}
         </div>`
      : "";

  const flagsHtml = verdict.flags
    .map((f) => {
      const cls = f.level === "critical" ? "risk-crit" : f.level === "warning" ? "risk-warn" : "risk-ok";
      const tag =
        f.level === "critical" ? "КРИТИЧНО" : f.level === "warning" ? "СЛАБОЕ МЕСТО" : "В ПОРЯДКЕ";
      return `<div class="risk ${cls}">
        <div class="risk-tag">${tag}</div>
        <div class="risk-title">${esc(f.title)}</div>
        <div class="risk-text">${esc(f.text)}</div>
        ${f.fix ? `<div class="risk-fix"><b>Что делать:</b> ${esc(f.fix)}</div>` : ""}
      </div>`;
    })
    .join("");

  const boardHtml = (review.board || [])
    .map(
      (b) => `<div class="expert">
        <div class="expert-role">${esc(b.emoji)} ${esc(b.role)}</div>
        <div class="expert-verdict">${esc(b.verdict)}</div>
        <ul>${(b.points || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        ${b.action ? `<div class="expert-action"><b>Действие:</b> ${esc(b.action)}</div>` : ""}
      </div>`,
    )
    .join("");

  const killersHtml = (review.killers || [])
    .map(
      (k) => `<div class="killer">
        <div class="killer-title">${esc(k.title)}</div>
        <div class="risk-text">${esc(k.why)}</div>
        <div class="risk-fix"><b>Что делать:</b> ${esc(k.fix)}</div>
      </div>`,
    )
    .join("");

  const dp = review.demand_plan;
  const demandHtml = dp
    ? `<div class="section-title">${esc(dp.title)}</div>
       <div class="budget">Бюджет проверки: <b>${esc(dp.budget)}</b></div>
       <ol>${(dp.steps || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
       <div class="dual">
         <div class="ok-box"><b>Спрос есть:</b> ${esc(dp.success_metric)}</div>
         <div class="bad-box"><b>Идею надо менять:</b> ${esc(dp.fail_metric)}</div>
       </div>`
    : "";

  const checklistHtml = (review.before_launch || [])
    .map((t) => `<li class="check">${esc(t)}</li>`)
    .join("");

  const daysHtml = (review.first_90_days || [])
    .map(
      (p) => `<div class="period">
        <div class="period-name">${esc(p.period)} — ${esc(p.focus)}</div>
        <ul>${(p.tasks || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${p.metric ? `<div class="period-metric">Измеряем: ${esc(p.metric)}</div>` : ""}
      </div>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>Бизнес-план — БИЗНЕС 2026</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 30px 38px; }
  .head { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f59e0b; padding-bottom: 14px; margin-bottom: 20px; }
  .brand { font-weight: 800; font-size: 17px; color: #d97706; letter-spacing: .4px; }
  .date { color: #6b7280; font-size: 12px; }
  h1 { font-size: 24px; margin: 0 0 10px; }
  .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: .6px; color: #d97706; font-weight: 800; margin: 24px 0 10px; border-top: 1px solid #eee; padding-top: 14px; page-break-after: avoid; }
  ul, ol { margin: 4px 0 10px; padding-left: 20px; }
  li { font-size: 13px; line-height: 1.5; margin-bottom: 3px; }

  .verdict { background: ${bg}; border: 2px solid ${color}; border-radius: 12px; padding: 16px 18px; margin-bottom: 8px; page-break-inside: avoid; }
  .score { font-size: 34px; font-weight: 800; color: ${color}; line-height: 1; }
  .score span { font-size: 14px; color: #6b7280; font-weight: 600; }
  .verdict-title { font-size: 19px; font-weight: 800; margin: 6px 0 6px; }
  .verdict-sum { font-size: 13px; line-height: 1.6; color: #374151; }

  .metrics { display: flex; flex-wrap: wrap; gap: 8px; }
  .metric { width: calc(25% - 6px); border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; page-break-inside: avoid; }
  .m-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: .3px; }
  .m-value { font-size: 15px; font-weight: 800; margin: 2px 0; }
  .m-note { font-size: 10px; color: #9ca3af; line-height: 1.3; }

  table.data { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  table.data td { border: 1px solid #e5e7eb; padding: 6px 9px; vertical-align: top; }
  table.data td:first-child { font-weight: 700; color: #6b7280; width: 190px; background: #f9fafb; }

  .risk { border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; page-break-inside: avoid; border: 1px solid #e5e7eb; }
  .risk-crit { background: #fff1f2; border-color: #fecdd3; }
  .risk-warn { background: #fffbeb; border-color: #fde68a; }
  .risk-ok { background: #ecfdf5; border-color: #a7f3d0; }
  .risk-tag { font-size: 9px; font-weight: 800; letter-spacing: .5px; color: #6b7280; margin-bottom: 3px; }
  .risk-title { font-size: 14px; font-weight: 800; margin-bottom: 3px; }
  .risk-text { font-size: 12.5px; line-height: 1.5; color: #374151; }
  .risk-fix { font-size: 12px; color: #0f766e; background: #f0fdfa; border-radius: 5px; padding: 5px 8px; margin-top: 5px; }

  .expert { border-left: 3px solid #fcd34d; padding: 4px 0 6px 11px; margin-bottom: 10px; page-break-inside: avoid; }
  .expert-role { font-size: 14px; font-weight: 800; }
  .expert-verdict { font-size: 12.5px; font-weight: 600; color: #374151; margin: 2px 0 3px; }
  .expert-action { font-size: 12px; color: #1e40af; background: #eff6ff; border-radius: 5px; padding: 5px 8px; margin-top: 4px; }

  .killer { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; page-break-inside: avoid; }
  .killer-title { font-size: 14px; font-weight: 800; color: #9f1239; margin-bottom: 3px; }

  .budget { font-size: 13px; margin-bottom: 6px; }
  .dual { display: flex; gap: 8px; margin-top: 6px; }
  .ok-box, .bad-box { flex: 1; font-size: 12px; border-radius: 6px; padding: 7px 9px; line-height: 1.45; }
  .ok-box { background: #ecfdf5; border: 1px solid #a7f3d0; }
  .bad-box { background: #fff1f2; border: 1px solid #fecdd3; }

  li.check { list-style: none; margin-left: -14px; margin-bottom: 6px; }
  li.check:before { content: "☐"; margin-right: 7px; color: #9ca3af; font-size: 15px; }

  .period { border: 1px solid #e5e7eb; border-radius: 8px; padding: 9px 12px; margin-bottom: 8px; page-break-inside: avoid; }
  .period-name { font-size: 13.5px; font-weight: 800; margin-bottom: 3px; }
  .period-metric { font-size: 11.5px; color: #6b7280; background: #f9fafb; border-radius: 5px; padding: 4px 8px; }

  .advice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 11px 13px; font-size: 13px; line-height: 1.6; page-break-inside: avoid; }
  .final { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 12px 14px; font-size: 13.5px; line-height: 1.6; font-weight: 600; page-break-inside: avoid; }
  .disclaimer { font-size: 10.5px; color: #9ca3af; line-height: 1.5; margin-top: 14px; border-top: 1px dashed #e5e7eb; padding-top: 8px; }
  .footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 14px 20px; } .metric { width: calc(25% - 6px); } }
</style>
</head>
<body>
  <div class="head">
    <span class="brand">🏗️ УЧИСЬПРО · БИЗНЕС 2026</span>
    <span class="date">${dateStr}</span>
  </div>

  <h1>Проверка бизнес-идеи на прочность</h1>

  <div class="verdict">
    <div class="score">${verdict.score}<span> / 100</span></div>
    <div class="verdict-title">${esc(verdict.title)}</div>
    <div class="verdict-sum">${esc(verdict.summary)}</div>
  </div>

  <div class="section-title">Что за бизнес</div>
  <table class="data">
    <tr><td>Идея</td><td>${a("idea")}</td></tr>
    <tr><td>Клиент</td><td>${a("client")}</td></tr>
    <tr><td>Проблема</td><td>${a("problem")}</td></tr>
    <tr><td>Конкуренты</td><td>${a("competitors")}</td></tr>
    <tr><td>Почему выберут вас</td><td>${a("why_you")}</td></tr>
    <tr><td>Спрос</td><td>${esc(DEMAND_LABELS[answers.demand_tested || ""] || "—")}</td></tr>
  </table>

  <div class="section-title">Ключевые цифры</div>
  <div class="metrics">${metricsHtml}</div>
  ${loanHtml}

  <div class="section-title">Исходные данные</div>
  <table class="data">
    <tr><td>Цена / себестоимость</td><td>${a("price")} ₽ / ${a("cost_unit")} ₽</td></tr>
    <tr><td>Эквайринг / брак</td><td>${a("acquiring")}% / ${a("defect")}%</td></tr>
    <tr><td>План продаж</td><td>${a("planned_units")} шт/мес (${a("volume_logic")})</td></tr>
    <tr><td>Аренда / зарплаты</td><td>${a("rent")} ₽ / ${a("salary")} ₽ (+30% взносы)</td></tr>
    <tr><td>Своя зарплата / реклама</td><td>${a("owner_salary")} ₽ / ${a("marketing_monthly")} ₽</td></tr>
    <tr><td>Налоговый режим</td><td>${esc(TAX_LABELS[answers.tax_mode || ""] || "—")}</td></tr>
    <tr><td>Вложения / подушка</td><td>${a("start_capital")} ₽ / ${a("cushion")} ₽</td></tr>
    <tr><td>Источник денег</td><td>${esc(SOURCE_LABELS[answers.money_source || ""] || "—")}</td></tr>
    <tr><td>Главный риск</td><td>${a("main_risk")}</td></tr>
    <tr><td>План Б</td><td>${a("plan_b")}</td></tr>
    <tr><td>Точка выхода</td><td>${a("exit_point")}</td></tr>
  </table>

  <div class="section-title">Риски и слабые места</div>
  ${flagsHtml}

  <div class="section-title">Разбор совета директоров</div>
  <div class="risk-text" style="margin-bottom:10px"><b>${esc(review.headline)}</b></div>
  ${review.reality_check ? `<div class="advice" style="margin-bottom:10px">${esc(review.reality_check)}</div>` : ""}
  ${boardHtml}

  ${killersHtml ? `<div class="section-title">Что может убить этот бизнес</div>${killersHtml}` : ""}

  ${demandHtml}

  ${checklistHtml ? `<div class="section-title">Чек-лист перед запуском</div><ul>${checklistHtml}</ul>` : ""}

  ${daysHtml ? `<div class="section-title">Первые 90 дней</div>${daysHtml}` : ""}

  ${review.money_advice ? `<div class="section-title">Про деньги и кредит</div><div class="advice">${esc(review.money_advice)}</div>` : ""}

  ${review.verdict_short ? `<div class="section-title">Итог</div><div class="final">${esc(review.verdict_short)}</div>` : ""}

  <div class="disclaimer">
    Расчёт построен на данных, которые вы ввели сами, и носит справочный характер. Он не заменяет
    консультацию бухгалтера и юриста и не является инвестиционной рекомендацией. Проверьте налоговый
    режим и требования именно вашей сферы перед запуском.
  </div>

  <div class="footer">Сгенерировано в тренажёре БИЗНЕС 2026 · учисьпро.рф/bizlab</div>
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
