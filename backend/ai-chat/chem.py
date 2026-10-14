"""
Проверка и расстановка коэффициентов в уравнениях химических реакций.

ИИ-модель пишет уравнения «на глаз» и регулярно ошибается в коэффициентах.
Здесь каждое уравнение в тексте разбирается на вещества, по закону сохранения
массы составляется система уравнений по каждому элементу, и коэффициенты
находятся точно (метод Гаусса на дробях). Если уравнение не уравнено —
коэффициенты исправляются. Если однозначно уравнять нельзя (неверные продукты,
общие формулы вида CnH2n+2) — текст не трогаем.
"""
import re
from fractions import Fraction
from math import gcd

ELEMENTS = set("""H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr
Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os
Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm""".split())

SUB = str.maketrans('0123456789', '₀₁₂₃₄₅₆₇₈₉')
UNSUB = str.maketrans('₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹', '01234567890123456789')

ARROW = r'(?:-{1,2}>|→|⟶|⇄|⇌|↔|\s=\s)'
COND = r'(?:\s*[\(\[][^()\[\]\n]{1,25}[\)\]])?'
COEF = r'(?:\d+(?:[.,]\d+)?(?:/\d+)?\s*)?'
STATE = r'(?:\s*\((?:г|ж|тв|р-р|aq|s|l|g)\))?[↑↓]?'
SPECIES = COEF + r'[A-Z\(\[][A-Za-z0-9₀-₉\(\)\[\]·\-–=≡]*(?:\*\d+[A-Za-z0-9₀-₉\(\)]+)?' + STATE
SIDE = SPECIES + r'(?:\s*\+\s*' + SPECIES + r')*'
ION_RE = re.compile(r'[⁺⁻]|(?<=[A-Za-z0-9)])[0-9]?[+-](?=\s+(?:\+|→|->|=)|\s*$|,)|\^[0-9]*[+-]|ион')
EQUATION = re.compile(r'(?<![\w])(' + SIDE + r')\s*(' + ARROW + COND + r')\s*(' + SIDE + r')')


def _parse_formula(text: str):
    """'Ca(OH)2' -> {'Ca':1,'O':2,'H':2}. None, если это не формула."""
    s = text.translate(UNSUB)
    s = re.sub(r'[\-–=≡]', '', s)
    s = s.replace('[', '(').replace(']', ')')
    parts = re.split(r'[·\*]', s)
    total = {}
    for part in parts:
        m = re.match(r'^(\d*)(.*)$', part)
        mult = int(m.group(1)) if m.group(1) else 1
        counts = _parse_group(m.group(2))
        if counts is None or not counts:
            return None
        for el, n in counts.items():
            total[el] = total.get(el, 0) + n * mult
    return total


def _parse_group(s: str):
    stack = [{}]
    i = 0
    while i < len(s):
        ch = s[i]
        if ch == '(':
            stack.append({})
            i += 1
        elif ch == ')':
            if len(stack) == 1:
                return None
            i += 1
            m = re.match(r'\d+', s[i:])
            n = int(m.group(0)) if m else 1
            i += len(m.group(0)) if m else 0
            grp = stack.pop()
            for el, c in grp.items():
                stack[-1][el] = stack[-1].get(el, 0) + c * n
        else:
            m = re.match(r'([A-Z][a-z]?)(\d*)', s[i:])
            if not m or m.group(1) not in ELEMENTS:
                return None
            n = int(m.group(2)) if m.group(2) else 1
            stack[-1][m.group(1)] = stack[-1].get(m.group(1), 0) + n
            i += len(m.group(0))
    if len(stack) != 1:
        return None
    return stack[0]


def _split_species(side: str):
    """'2CH4 + O2' -> [(Fraction(2), 'CH4', state), ...]"""
    out = []
    for raw in re.split(r'\s+\+\s+|\s*\+\s*(?=\d*[A-Z\(\[])', side.strip()):
        raw = raw.strip()
        m = re.match(r'^(\d+(?:[.,]\d+)?(?:/\d+)?)?\s*(.+?)(\s*\((?:г|ж|тв|р-р|aq|s|l|g)\))?([↑↓]?)$', raw)
        if not m:
            return None
        coef_txt, formula, state, arrow = m.groups()
        coef = Fraction(1)
        if coef_txt:
            coef = Fraction(coef_txt.replace(',', '.')) if '/' not in coef_txt else Fraction(coef_txt)
        out.append((coef, formula.strip(), (state or '') + (arrow or '')))
    return out


def _nullspace_vector(matrix, n):
    """Единственный (с точностью до множителя) ненулевой вектор ядра или None."""
    rows = [list(map(Fraction, r)) for r in matrix]
    pivots = []
    r = 0
    for c in range(n):
        piv = next((i for i in range(r, len(rows)) if rows[i][c] != 0), None)
        if piv is None:
            continue
        rows[r], rows[piv] = rows[piv], rows[r]
        pv = rows[r][c]
        rows[r] = [x / pv for x in rows[r]]
        for i in range(len(rows)):
            if i != r and rows[i][c] != 0:
                f = rows[i][c]
                rows[i] = [a - f * b for a, b in zip(rows[i], rows[r])]
        pivots.append(c)
        r += 1
        if r == len(rows):
            break
    free = [c for c in range(n) if c not in pivots]
    if len(free) != 1:
        return None
    fc = free[0]
    vec = [Fraction(0)] * n
    vec[fc] = Fraction(1)
    for i, pc in enumerate(pivots):
        vec[pc] = -rows[i][fc]
    return vec


def _to_integers(vec):
    den = 1
    for v in vec:
        den = den * v.denominator // gcd(den, v.denominator)
    ints = [int(v * den) for v in vec]
    g = 0
    for x in ints:
        g = gcd(g, abs(x))
    return [x // g for x in ints] if g else ints


def check_equation(left: str, right: str):
    """Возвращает dict: status = ok | fixed | unknown, coefs (новые), species."""
    ls, rs = _split_species(left), _split_species(right)
    if not ls or not rs:
        return {'status': 'unknown'}
    species = ls + rs
    comps = [_parse_formula(f) for _, f, _ in species]
    if any(c is None for c in comps):
        return {'status': 'unknown'}
    elements = sorted({e for c in comps for e in c})
    nl = len(ls)
    matrix = [[(c.get(e, 0) if i < nl else -c.get(e, 0)) for i, c in enumerate(comps)] for e in elements]
    given = [k for k, _, _ in species]
    balanced = all(sum(row[i] * given[i] for i in range(len(species))) == 0 for row in matrix)
    if balanced:
        return {'status': 'ok', 'species': species, 'coefs': given}
    vec = _nullspace_vector(matrix, len(species))
    if not vec:
        return {'status': 'unknown'}
    ints = _to_integers(vec)
    if all(x < 0 for x in ints):
        ints = [-x for x in ints]
    if any(x <= 0 for x in ints):
        return {'status': 'unknown'}
    return {'status': 'fixed', 'species': species, 'coefs': ints}


def pretty_formula(f: str) -> str:
    """CH4 -> CH₄ (цифры после элемента или скобки — нижние индексы)."""
    return re.sub(r'(?<=[A-Za-z\)\]])(\d+)', lambda m: m.group(1).translate(SUB), f.translate(UNSUB))


def _side_text(items, coefs, pretty):
    parts = []
    for (_, f, st), k in zip(items, coefs):
        k = Fraction(k)
        ktxt = '' if k == 1 else (str(k.numerator) if k.denominator == 1 else f'{k.numerator}/{k.denominator}')
        parts.append(f"{ktxt}{pretty_formula(f) if pretty else f}{st}")
    return ' + '.join(parts)


# Строки, где уравнение намеренно без коэффициентов (схема, «уравняйте…») — только оформляем.
SCHEME_RE = re.compile(r'схем|не\s*уравн|без\s*коэффициент|уравняй|уравняйте|расставь|расставьте|'
                       r'дано|исходн|ошибк|неверн|неправильн', re.I)


FORMULA_TOKEN = re.compile(r'(?<![\w₀-₉])((?:\d)?(?:[A-Z][a-z]?\d*|\((?:[A-Z][a-z]?\d*)+\)\d+)+)(?![\w₀-₉])')


def pretty_standalone(text: str) -> str:
    """Отдельные формулы в тексте (CO2, H2SO4, C2H5Cl) — с нижними индексами."""
    def repl(m):
        tok = m.group(1)
        if not re.search(r'[A-Z][a-z]?\d|\)\d', tok) or re.match(r'^\d', tok):
            return tok
        if _parse_formula(tok) is None:
            return tok
        return pretty_formula(tok)
    return FORMULA_TOKEN.sub(repl, text)


def strip_latex(text: str) -> str:
    """Модель иногда оборачивает уравнения в LaTeX: \\[ … \\], $…$, \\ce{…}, \\rightarrow."""
    t = re.sub(r'^\s*\\[\[\]]\s*$\n?', '', text, flags=re.M)
    t = re.sub(r'\\[\[\]\(\)]', '', t)
    t = re.sub(r'\\ce\{([^{}]*)\}', r'\1', t)
    t = re.sub(r'\$\$?([^$\n]+?)\$\$?', r'\1', t)
    t = t.replace('\\rightarrow', '→').replace('\\to', '→').replace('\\longrightarrow', '→')
    t = re.sub(r'\\text\{([^{}]*)\}', r'\1', t)
    t = re.sub(r'_\{?(\d+)\}?', r'\1', t)
    return t


# Частые терминологические ошибки ИИ в химии.
TERM_FIXES = [
    (re.compile(r'([Ии])зоморфиз(ир[уо]|аци)'), lambda m: m.group(1) + 'зомериз' + ('у' if m.group(2).startswith('иру') else 'о' if m.group(2).startswith('иро') else 'аци')),
]


def fix_terms(text: str) -> str:
    for rx, rp in TERM_FIXES:
        text = rx.sub(rp, text)
    return text


def fix_text(text: str, pretty: bool = True, balance: bool = True):
    """Проверяет все уравнения в тексте. Возвращает (новый_текст, статистика)."""
    stats = {'checked': 0, 'fixed': 0, 'unknown': 0, 'fixes': []}
    if not text:
        return text, stats
    text = fix_terms(strip_latex(text))
    if not re.search(ARROW, text):
        return (pretty_standalone(text) if pretty else text), stats

    def repl(m):
        left, arrow, right = m.group(1), m.group(2), m.group(3)
        res = check_equation(left, right)
        if res['status'] == 'fixed' and not cur_balance[0]:
            res = {'status': 'ok', 'species': res['species'], 'coefs': [k for k, _, _ in res['species']]}
        if res['status'] == 'unknown':
            stats['unknown'] += 1
            return m.group(0)
        stats['checked'] += 1
        species = res['species']
        nl = len(_split_species(left))
        arrow_out = arrow if arrow.strip() != '=' else ' = '
        arrow_out = arrow_out.replace('-->', '→').replace('->', '→')
        new = (_side_text(species[:nl], res['coefs'][:nl], pretty) + ' ' + arrow_out.strip() + ' '
               + _side_text(species[nl:], res['coefs'][nl:], pretty))
        if res['status'] == 'fixed':
            stats['fixed'] += 1
            stats['fixes'].append({'was': m.group(0).strip(), 'now': new})
        return new

    lines = []
    cur_balance = [balance]
    for line in text.split('\n'):
        cur_balance[0] = balance and not SCHEME_RE.search(line)
        # Ионные уравнения и общие формулы (CnH2n+2) не трогаем: заряды и индексы-переменные
        # модуль баланса не учитывает и мог бы их испортить.
        if ION_RE.search(line) or re.search(r'C[nmx]H', line):
            if re.search(ARROW, line):
                stats['unknown'] += 1
            lines.append(line)
        else:
            lines.append(EQUATION.sub(repl, line))
    out = '\n'.join(lines)
    if pretty:
        out = pretty_standalone(out)
    return out, stats


def fix_obj(obj, pretty: bool = False, balance: bool = True):
    """Рекурсивно проверяет все строки в структуре урока (dict/list)."""
    total = {'checked': 0, 'fixed': 0, 'unknown': 0, 'fixes': []}

    def walk(x):
        if isinstance(x, str):
            t, st = fix_text(x, pretty, balance)
            for k in ('checked', 'fixed', 'unknown'):
                total[k] += st[k]
            total['fixes'] += st['fixes']
            return t
        if isinstance(x, list):
            return [walk(i) for i in x]
        if isinstance(x, dict):
            return {k: (walk(v) if not str(k).startswith('_') else v) for k, v in x.items()}
        return x

    return walk(obj), total


CHEM_RULES = (
    "ЗАПИСЬ ХИМИЧЕСКИХ РЕАКЦИЙ (обязательно):\n"
    "• Каждое уравнение пиши в одну строку латиницей: реагенты, стрелка «→», продукты, вещества через « + ». "
    "Пример: CH4 + 2O2 → CO2 + 2H2O. Условия — в скобках сразу после стрелки: CH4 + Cl2 →(hν) CH3Cl + HCl.\n"
    "• ВСЕГДА расставляй коэффициенты. Перед ответом проверь баланс по каждому элементу: "
    "число атомов слева = числу атомов справа. Для горения органики сначала уравняй C, потом H, последним O.\n"
    "• Индексы — обычными цифрами после символа (H2SO4), коэффициенты — перед формулой без пробела (2H2O).\n"
    "• Органику можно писать сокращённой структурной формулой: CH3–CH2–CH3. Реакции, идущие ступенчато "
    "(галогенирование), пиши по ступеням.\n"
    "• Пиши только реакции, которые реально идут при названных условиях, и называй условия "
    "(свет hν, t°, катализатор Ni/Pt, H2SO4(конц.)). Если реакция не идёт — так и скажи.\n"
    "• Не используй LaTeX: никаких \\[ \\], $, \\ce{}. Уравнение — обычной строкой текста. "
    "Общую формулу (CnH2n+2) можно упомянуть, но реакции всегда показывай на конкретных веществах.\n"
    "• Если просят свойства класса веществ — перечисли ВСЕ типичные реакции этого класса из школьной программы и ЕГЭ "
    "(по кодификатору ФИПИ), каждую с конкретным уравнением и условиями, а также чего этот класс НЕ делает "
    "(качественные отличия от соседних классов). Пример для алканов: горение, галогенирование на свету, нитрование "
    "по Коновалову, дегидрирование, крекинг, изомеризация, разложение метана; не обесцвечивают бромную воду и KMnO4."
)


# Обязательный набор реакций алканов — уточнён репетитором по химии Юлией Быковой:
# изомеризация полностью структурными формулами, циклизация для C5 и длиннее.
ALKANE_RULES = (
    "АЛКАНЫ — ОБЯЗАТЕЛЬНЫЕ РЕАКЦИИ (каждую — полным уравнением с условиями):\n"
    "• Горение: CH4 + 2O2 → CO2 + 2H2O; неполное горение: 2CH4 + 3O2 → 2CO + 4H2O.\n"
    "• Галогенирование на свету (радикальное замещение): CH4 + Cl2 →(hν) CH3Cl + HCl; "
    "у гомологов водород замещается легче у третичного, затем вторичного атома C: "
    "CH3–CH2–CH3 + Br2 →(hν) CH3–CHBr–CH3 + HBr.\n"
    "• Нитрование по Коновалову: CH3–CH3 + HNO3 →(t°) CH3–CH2–NO2 + H2O.\n"
    "• ИЗОМЕРИЗАЦИЯ — писать ПОЛНОСТЬЮ сокращёнными структурными формулами и называть вещества: "
    "CH3–CH2–CH2–CH3 →(AlCl3, t°) CH3–CH(CH3)–CH3 — из бутана получается 2-метилпропан (изобутан). "
    "Не ограничивайся словами «превращаются в разветвлённые изомеры».\n"
    "• Дегидрирование зависит от длины цепи: "
    "от этана до бутана получаются алкены: CH3–CH3 →(Ni, t°) CH2=CH2 + H2; CH3–CH2–CH3 →(Ni, t°) CH2=CH–CH3 + H2; "
    "бутан на Cr2O3 даёт бутадиен-1,3: CH3–CH2–CH2–CH3 →(Cr2O3, t°) CH2=CH–CH=CH2 + 2H2.\n"
    "• ЦИКЛИЗАЦИЯ (дегидроциклизация) — обязательно: при цепи из 5 и более атомов C молекула замыкается в цикл: "
    "C5H12 →(Pt, t°) C5H10 + H2 (пентан → циклопентан); C6H14 →(Pt, t°) C6H12 + H2 (гексан → циклогексан). Название продукта пиши ПОСЛЕ уравнения, а не внутри него. "
    "С 6 и более атомами C в цепи цикл далее превращается в арен (ароматизация): "
    "C6H14 →(Pt, t°) C6H6 + 4H2 (бензол); C7H16 →(Pt, t°) C6H5–CH3 + 4H2 (толуол).\n"
    "• Крекинг: C8H18 →(t°) C4H10 + C4H8. Разложение метана: CH4 →(1000 °C) C + 2H2; "
    "2CH4 →(1500 °C) C2H2 + 3H2. Конверсия: CH4 + H2O →(Ni, t°) CO + 3H2.\n"
    "• Чего алканы НЕ делают: не обесцвечивают бромную воду и раствор KMnO4, не вступают в присоединение.\n"
    "ОБЯЗАТЕЛЬНО покажи сравнение по длине цепи двумя уравнениями подряд: "
    "пропан (3 атома C) — дегидрирование в алкен: CH3–CH2–CH3 →(Ni, t°) CH2=CH–CH3 + H2; "
    "гексан (6 атомов C) — замыкание в цикл: CH3–CH2–CH2–CH2–CH2–CH3 →(Pt, t°) C6H12 + H2 (циклогексан). "
    "Ароматизацию (C6H14 → C6H6 + 4H2) давай ДОПОЛНИТЕЛЬНО, а не вместо замыкания в циклоалкан."
)


def is_alkane_topic(*texts) -> bool:
    blob = ' '.join(t or '' for t in texts).lower()
    return bool(re.search(r'алкан|предельн\w* углеводород|насыщенн\w* углеводород|парафин|метан|этан\b|пропан|бутан', blob))


def is_chemistry(*texts) -> bool:
    blob = ' '.join(t or '' for t in texts).lower()
    return bool(re.search(r'хими|реакци|уравнени[ея] реакц|алкан|алкен|алкин|арен|спирт|кислот|оксид|соль|солей|'
                          r'окислительно|электролиз|гидролиз|валентн|моль|chemistry', blob))