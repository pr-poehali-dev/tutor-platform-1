import React from "react";

/**
 * Парсит математический текст и превращает запись степеней в верхние индексы.
 *
 * Поддерживаемые формы:
 *   x^2, a^10, 2^n         → x², a¹⁰, 2ⁿ (через <sup>)
 *   x^{n+1}, (a+b)^{2}     → с фигурными скобками
 *   x_1, a_{n+1}           → нижние индексы (через <sub>)
 *   sqrt(9), √(9)          → √9
 *   *                       → ·   (умножение, только между числами/буквами)
 *
 * Возвращает массив React-узлов (строки и элементы <sup>/<sub>).
 */
export function formatMath(input: string): React.ReactNode[] {
  if (!input) return [];

  let text = input;

  // Нормализуем юникод-надстрочные цифры (²³⁰¹⁴⁵⁶⁷⁸⁹⁺⁻) к виду ^N,
  // чтобы дальше один и тот же рендер через <sup> применялся ко всем формам.
  const SUP_MAP: Record<string, string> = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "⁺": "+", "⁻": "-", "⁼": "=", "⁽": "(", "⁾": ")",
    "ⁿ": "n", "ⁱ": "i",
  };
  text = text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ]+/g, (m) => {
    const conv = Array.from(m).map((ch) => SUP_MAP[ch] ?? ch).join("");
    return `^{${conv}}`;
  });

  // Аналогично — юникод-нижние индексы к виду _N
  const SUB_MAP: Record<string, string> = {
    "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
    "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
    "₊": "+", "₋": "-", "₌": "=", "₍": "(", "₎": ")",
  };
  text = text.replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]+/g, (m) => {
    const conv = Array.from(m).map((ch) => SUB_MAP[ch] ?? ch).join("");
    return `_{${conv}}`;
  });

  // Заменяем sqrt(...) на √...  (визуально привычнее в школьной программе)
  text = text.replace(/sqrt\s*\(([^()]+)\)/gi, "√($1)");

  // Заменяем явные звёздочки умножения "число*число" / "буква*буква" на "·"
  text = text.replace(/(\w)\s*\*\s*(\w)/g, "$1·$2");

  // Регекс ловит:
  //   1) base^{exp}     (фигурные скобки, exp до 12 символов без вложенных {})
  //   2) base^exp       (exp — число, буква, или одиночный знак минуса с числом)
  //   3) base_{exp}     (нижний индекс с фигурными скобками)
  //   4) base_exp       (нижний индекс — короткий)
  const re =
    /(\^\{([^{}]{1,12})\}|\^(-?\d+(?:\.\d+)?|[a-zA-Zа-яА-Я])|_\{([^{}]{1,12})\}|_(-?\d+(?:\.\d+)?|[a-zA-Zа-яА-Я]))/g;

  const out: React.ReactNode[] = [];
  let lastIdx = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const start = match.index;
    if (start > lastIdx) {
      out.push(text.slice(lastIdx, start));
    }
    const supBraced = match[2];
    const supShort = match[3];
    const subBraced = match[4];
    const subShort = match[5];

    if (supBraced !== undefined) {
      out.push(<sup key={`s${key++}`} className="text-[0.7em] -top-0.5 relative">{supBraced}</sup>);
    } else if (supShort !== undefined) {
      out.push(<sup key={`s${key++}`} className="text-[0.7em] -top-0.5 relative">{supShort}</sup>);
    } else if (subBraced !== undefined) {
      out.push(<sub key={`b${key++}`} className="text-[0.7em] relative">{subBraced}</sub>);
    } else if (subShort !== undefined) {
      out.push(<sub key={`b${key++}`} className="text-[0.7em] relative">{subShort}</sub>);
    }

    lastIdx = re.lastIndex;
  }

  if (lastIdx < text.length) {
    out.push(text.slice(lastIdx));
  }

  return out;
}

/**
 * Готовый React-компонент: рендерит текст с математическим форматированием.
 * Сохраняет переносы строк (whitespace-pre-line поведение можно задать через className родителя).
 */
export function MathText({ children, className }: { children: string; className?: string }) {
  return <span className={className}>{formatMath(children)}</span>;
}

export default MathText;