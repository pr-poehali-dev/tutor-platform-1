import { BizAnswers, BizMetrics, BizVerdict, RiskFlag } from "./types";

export const num = (a: BizAnswers, key: string, fallback = 0): number => {
  const raw = (a[key] || "").toString().replace(/\s|₽/g, "").replace(",", ".");
  const v = parseFloat(raw);
  return Number.isFinite(v) ? v : fallback;
};

export const fmt = (v: number): string => {
  if (!Number.isFinite(v)) return "—";
  const r = Math.round(v);
  return r.toLocaleString("ru-RU");
};

export const fmt1 = (v: number): string =>
  Number.isFinite(v) ? v.toFixed(1).replace(".", ",") : "—";

/**
 * Аннуитетный платёж по кредиту.
 * Считаем честно по банковской формуле, а не «сумма делённая на срок».
 */
export function loanPayment(amount: number, ratePct: number, months: number): number {
  if (amount <= 0 || months <= 0) return 0;
  const i = ratePct / 100 / 12;
  if (i <= 0) return amount / months;
  const k = (i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
  return amount * k;
}

/** Налоговая нагрузка на выручку в зависимости от режима. */
function taxRate(mode: string): number {
  switch (mode) {
    case "npd":
      return 0.06; // самозанятый с юрлицами
    case "usn6":
      return 0.06;
    case "usn15":
      return 0.15; // считаем от прибыли, применяем отдельно
    case "patent":
      return 0.02; // условная нагрузка, патент фиксирован
    case "osno":
      return 0.2;
    default:
      return 0.06;
  }
}

export function calcMetrics(a: BizAnswers): BizMetrics {
  const price = num(a, "price");
  const costPerUnit = num(a, "cost_unit");
  const acquiringPct = num(a, "acquiring", 0);
  const defectPct = num(a, "defect", 0);

  // Переменные расходы на одну продажу: себестоимость + эквайринг + брак/возвраты
  const acquiringCost = price * (acquiringPct / 100);
  const defectCost = (price - costPerUnit) * (defectPct / 100);
  const varCost = costPerUnit + acquiringCost + defectCost;

  const unitMargin = price - varCost;
  const marginPct = price > 0 ? (unitMargin / price) * 100 : 0;

  // Привлечение клиента
  const marketing = num(a, "marketing_monthly");
  const plannedUnits = Math.max(0, num(a, "planned_units"));
  const repeatPurchases = Math.max(1, num(a, "repeat", 1));
  const newClients = plannedUnits / repeatPurchases;
  const cac = newClients > 0 ? marketing / newClients : 0;
  const ltv = unitMargin * repeatPurchases;
  const ltvCac = cac > 0 ? ltv / cac : ltv > 0 ? 99 : 0;
  const contribution = unitMargin - cac / repeatPurchases;

  // Постоянные расходы в месяц
  const rent = num(a, "rent");
  const salary = num(a, "salary");
  const salaryTaxes = salary * 0.3; // взносы и НДФЛ сверху — то, что забывают
  const otherFixed = num(a, "other_fixed");
  const ownerSalary = num(a, "owner_salary");
  const fixedBase = rent + salary + salaryTaxes + otherFixed + ownerSalary + marketing;

  // Кредит
  const loanAmount = num(a, "loan_amount");
  const loanRate = num(a, "loan_rate", 25);
  const loanMonths = num(a, "loan_months", 24);
  const loanMonthly = loanPayment(loanAmount, loanRate, loanMonths);

  const fixedMonthly = fixedBase + loanMonthly;

  // Налоги
  const mode = a.tax_mode || "usn6";
  const tRate = taxRate(mode);
  const plannedRevenue = price * plannedUnits;

  const taxOn = (revenue: number, grossProfit: number): number => {
    if (mode === "usn15") return Math.max(0, grossProfit) * 0.15;
    if (mode === "osno") return Math.max(0, grossProfit) * 0.2;
    return revenue * tRate;
  };

  // Точка безубыточности: сколько продаж нужно, чтобы закрыть постоянные расходы
  // Учитываем налог с оборота, который «съедает» часть маржи.
  const perUnitAfterTax =
    mode === "usn15" || mode === "osno"
      ? unitMargin * (1 - (mode === "usn15" ? 0.15 : 0.2))
      : unitMargin - price * tRate;

  const breakEvenUnits = perUnitAfterTax > 0 ? fixedMonthly / perUnitAfterTax : Infinity;
  const breakEvenRevenue = Number.isFinite(breakEvenUnits) ? breakEvenUnits * price : Infinity;

  const grossPlanned = unitMargin * plannedUnits;
  const taxPlanned = taxOn(plannedRevenue, grossPlanned - fixedMonthly);
  const plannedProfit = grossPlanned - fixedMonthly - taxPlanned;

  const safetyMarginPct =
    plannedUnits > 0 && Number.isFinite(breakEvenUnits)
      ? ((plannedUnits - breakEvenUnits) / plannedUnits) * 100
      : -100;

  // Стартовые вложения и окупаемость
  const startCapital = num(a, "start_capital");
  const paybackMonths = plannedProfit > 0 ? startCapital / plannedProfit : Infinity;

  const debtCover = loanMonthly > 0 ? plannedProfit / loanMonthly : plannedProfit > 0 ? 99 : 0;

  // Подушка: сколько месяцев бизнес проживёт без выручки
  const cushion = num(a, "cushion");
  const runwayMonths = fixedMonthly > 0 ? cushion / fixedMonthly : 0;

  // Стресс-тест: продажи падают на 40%
  const stressUnits = plannedUnits * 0.6;
  const stressGross = unitMargin * stressUnits;
  const stressRevenue = price * stressUnits;
  const stressTax = taxOn(stressRevenue, stressGross - fixedMonthly);
  const stressProfit = stressGross - fixedMonthly - stressTax;

  return {
    unitMargin,
    marginPct,
    cac,
    ltv,
    ltvCac,
    contribution,
    fixedMonthly,
    breakEvenUnits,
    breakEvenRevenue,
    plannedUnits,
    plannedRevenue,
    plannedProfit,
    safetyMarginPct,
    startCapital,
    paybackMonths,
    loanMonthly,
    debtCover,
    cushion,
    runwayMonths,
    stressProfit,
    stressSurvives: stressProfit >= 0,
  };
}

/**
 * Вердикт о жизнеспособности. Считаем строго и без приукрашивания:
 * задача — не подбодрить, а уберечь от потери денег.
 */
export function buildVerdict(m: BizMetrics, a: BizAnswers): BizVerdict {
  const flags: RiskFlag[] = [];
  let score = 100;

  // 1. Юнит-экономика — фундамент. Если не сходится, остальное не важно.
  if (m.unitMargin <= 0) {
    score -= 45;
    flags.push({
      level: "critical",
      title: "Каждая продажа приносит убыток",
      text: `С одной продажи вы теряете ${fmt(Math.abs(m.unitMargin))} ₽. Чем больше продаёте — тем больше теряете. Это не масштабируется, это ускоряет потерю денег.`,
      fix: "Поднимите цену или снизьте себестоимость. Пока маржа отрицательная — запускать нельзя ни при каких условиях.",
    });
  } else if (m.marginPct < 20) {
    score -= 20;
    flags.push({
      level: "warning",
      title: "Маржинальность ниже 20%",
      text: `Вы зарабатываете ${fmt1(m.marginPct)}% с продажи. При такой марже любое подорожание сырья или скидка съедают прибыль полностью.`,
      fix: "Ищите способ поднять цену хотя бы на 15% или пересмотрите закупку. Низкая маржа прощает очень мало ошибок.",
    });
  }

  // 2. Стоимость привлечения клиента
  if (m.cac > 0 && m.ltvCac < 1) {
    score -= 25;
    flags.push({
      level: "critical",
      title: "Клиент стоит дороже, чем приносит",
      text: `Привлечение клиента обходится в ${fmt(m.cac)} ₽, а приносит он ${fmt(m.ltv)} ₽. Каждый новый клиент — минус в кассе.`,
      fix: "Либо снижайте стоимость привлечения, либо повышайте повторные покупки и средний чек.",
    });
  } else if (m.cac > 0 && m.ltvCac < 3) {
    score -= 10;
    flags.push({
      level: "warning",
      title: "Реклама окупается впритык",
      text: `Клиент приносит в ${fmt1(m.ltvCac)} раза больше, чем стоит. Здоровый ориентир — от 3. Запас на ошибки почти отсутствует.`,
      fix: "Работайте над повторными продажами: удержать клиента дешевле, чем привести нового.",
    });
  }

  // 3. Точка безубыточности и запас прочности
  if (!Number.isFinite(m.breakEvenUnits)) {
    score -= 20;
    flags.push({
      level: "critical",
      title: "Точки безубыточности не существует",
      text: "При текущей марже постоянные расходы не окупятся никогда — сколько бы вы ни продали.",
      fix: "Сначала исправьте цену и себестоимость, потом возвращайтесь к расчёту.",
    });
  } else if (m.safetyMarginPct < 0) {
    score -= 30;
    flags.push({
      level: "critical",
      title: "План продаж ниже точки безубыточности",
      text: `Для выхода в ноль нужно ${fmt(m.breakEvenUnits)} продаж в месяц, а вы планируете ${fmt(m.plannedUnits)}. Убыток ${fmt(Math.abs(m.plannedProfit))} ₽ в месяц.`,
      fix: "Либо режьте постоянные расходы, либо пересматривайте план продаж. Разрыв нужно закрыть до запуска.",
    });
  } else if (m.safetyMarginPct < 20) {
    score -= 15;
    flags.push({
      level: "warning",
      title: "Запас прочности всего " + fmt1(m.safetyMarginPct) + "%",
      text: `Падение продаж на ${fmt1(m.safetyMarginPct)}% уводит бизнес в убыток. Один слабый месяц — и вы в минусе.`,
      fix: "Безопасный ориентир — запас от 30%. Снижайте постоянные расходы, пока не выйдете на него.",
    });
  }

  // 4. Кредит — главная причина катастроф
  if (m.loanMonthly > 0) {
    if (m.debtCover < 1) {
      score -= 30;
      flags.push({
        level: "critical",
        title: "Прибыли не хватит на платёж по кредиту",
        text: `Платёж ${fmt(m.loanMonthly)} ₽ в месяц, а прибыль ${fmt(m.plannedProfit)} ₽. Разницу придётся закрывать из своего кармана — и так каждый месяц.`,
        fix: "Не берите этот кредит. Уменьшите сумму, увеличьте срок или начните без заёмных денег.",
      });
    } else if (m.debtCover < 2) {
      score -= 15;
      flags.push({
        level: "warning",
        title: "Кредит съедает больше половины прибыли",
        text: `Прибыль покрывает платёж всего в ${fmt1(m.debtCover)} раза. Безопасный ориентир — от 2.`,
        fix: "Возьмите меньшую сумму. Кредит должен ускорять рост, а не держать вас за горло.",
      });
    }

    if (!m.stressSurvives) {
      score -= 15;
      flags.push({
        level: "critical",
        title: "Кредит + падение продаж = катастрофа",
        text: `Если продажи упадут на 40% (обычное дело в первый год), убыток составит ${fmt(Math.abs(m.stressProfit))} ₽ в месяц, а платить по кредиту всё равно придётся.`,
        fix: "Это самый частый сценарий разорения. Начинайте без кредита или с суммой вдвое меньше.",
      });
    }
  }

  // 5. Подушка безопасности
  if (m.runwayMonths < 3) {
    score -= 15;
    flags.push({
      level: m.runwayMonths < 1 ? "critical" : "warning",
      title: `Подушки хватит на ${fmt1(m.runwayMonths)} мес.`,
      text: "Первые клиенты почти никогда не приходят в первый месяц. Без запаса вы закроетесь раньше, чем бизнес успеет заработать.",
      fix: "Нужен запас минимум на 6 месяцев постоянных расходов — это " + fmt(m.fixedMonthly * 6) + " ₽.",
    });
  }

  // 6. Стресс-тест без кредита
  if (m.loanMonthly === 0 && !m.stressSurvives && m.plannedProfit > 0) {
    score -= 10;
    flags.push({
      level: "warning",
      title: "Не переживёт падения продаж на 40%",
      text: `В пессимистичном сценарии убыток ${fmt(Math.abs(m.stressProfit))} ₽ в месяц. Пережить его можно только за счёт подушки.`,
      fix: "Проверьте, какие постоянные расходы можно быстро сократить в плохой месяц.",
    });
  }

  // 7. Окупаемость
  if (Number.isFinite(m.paybackMonths) && m.paybackMonths > 36) {
    score -= 10;
    flags.push({
      level: "warning",
      title: `Вложения окупятся за ${fmt(m.paybackMonths)} мес.`,
      text: "Больше трёх лет — очень долго для малого бизнеса. За это время рынок успеет измениться дважды.",
      fix: "Ищите способ запуститься дешевле: аренда вместо покупки, подряд вместо своего производства.",
    });
  }

  // 8. Проверка спроса — то, что пропускают чаще всего
  const tested = a.demand_tested || "";
  if (tested === "no") {
    score -= 25;
    flags.push({
      level: "critical",
      title: "Спрос не проверен",
      text: "Вы собираетесь вложить деньги, не убедившись, что купят. Это причина закрытия номер один — бизнес строится под товар, который никому не нужен.",
      fix: "Проверьте спрос до вложений: соберите предзаказы или продайте первым 10 клиентам вручную. Это стоит копейки и занимает неделю.",
    });
  } else if (tested === "asked") {
    score -= 12;
    flags.push({
      level: "warning",
      title: "Спрос проверен только словами",
      text: "«Да, я бы купил» — это не проверка. Люди из вежливости говорят да, а платят единицы. Значение имеет только факт оплаты.",
      fix: "Возьмите предоплату хотя бы с трёх человек. Один рубль реальных денег весит больше сотни обещаний.",
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const zone: BizVerdict["zone"] = score >= 70 ? "green" : score >= 45 ? "amber" : "red";

  const title =
    zone === "green"
      ? "Модель сходится — можно запускаться"
      : zone === "amber"
      ? "Есть шанс, но сначала закройте дыры"
      : "В таком виде запускать опасно";

  const summary =
    zone === "green"
      ? `Экономика в плюсе: прибыль ${fmt(m.plannedProfit)} ₽ в месяц, запас прочности ${fmt1(m.safetyMarginPct)}%. Это не гарантия успеха, но модель выдерживает проверку. Дальше решают исполнение и дисциплина.`
      : zone === "amber"
      ? `Модель работает только при точном попадании в план. Прибыль ${fmt(m.plannedProfit)} ₽ в месяц, но запас прочности ${fmt1(m.safetyMarginPct)}% — права на ошибку почти нет. Закройте отмеченные риски до вложения денег.`
      : "Расчёт показывает, что в текущем виде бизнес потеряет деньги. Это хорошая новость: вы увидели это на бумаге, а не после того, как вложили сбережения. Ниже — что именно нужно изменить.";

  // Если всё чисто — отмечаем это явно
  if (flags.length === 0) {
    flags.push({
      level: "ok",
      title: "Критических рисков не найдено",
      text: "Юнит-экономика сходится, запас прочности достаточный, заёмная нагрузка под контролем. Проверьте план ещё раз через месяц реальных продаж.",
    });
  }

  return { score, zone, title, summary, flags };
}
