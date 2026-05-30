// Упрощённый шахматный движок для детской Игротеки.
// Фигуры белые (w, игрок, снизу) и чёрные (b, Ксюша, сверху).
// Поддержаны все базовые ходы фигур, шах, мат и пат.
// Для простоты НЕ реализованы: рокировка, взятие на проходе, выбор фигуры
// при превращении (пешка всегда становится ферзём).

export type Color = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export interface Piece {
  type: PieceType;
  color: Color;
}
export type Square = Piece | null;
export type Board = Square[][]; // [row 0..7 сверху][col 0..7]

export interface Move {
  fr: number;
  fc: number;
  tr: number;
  tc: number;
  promo?: boolean;
}

export const PIECE_GLYPH: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

export const PIECE_NAME: Record<PieceType, string> = {
  p: "пешка",
  n: "конь",
  b: "слон",
  r: "ладья",
  q: "ферзь",
  k: "король",
};

export function initBoard(): Board {
  const empty = (): Square => null;
  const b: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, empty));
  const back: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: back[c], color: "b" };
    b[1][c] = { type: "p", color: "b" };
    b[6][c] = { type: "p", color: "w" };
    b[7][c] = { type: back[c], color: "w" };
  }
  return b;
}

function inside(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function cloneBoard(b: Board): Board {
  return b.map((row) => row.map((s) => (s ? { ...s } : null)));
}

// Псевдо-легальные ходы (без проверки на собственный шах)
function pseudoMoves(b: Board, r: number, c: number): Move[] {
  const p = b[r][c];
  if (!p) return [];
  const moves: Move[] = [];
  const add = (tr: number, tc: number) => {
    if (!inside(tr, tc)) return false;
    const t = b[tr][tc];
    if (t && t.color === p.color) return false;
    moves.push({ fr: r, fc: c, tr, tc });
    return !t; // продолжать скольжение только если пусто
  };

  const slide = (dirs: number[][]) => {
    for (const [dr, dc] of dirs) {
      let tr = r + dr, tc = c + dc;
      while (inside(tr, tc)) {
        const t = b[tr][tc];
        if (t && t.color === p.color) break;
        moves.push({ fr: r, fc: c, tr, tc });
        if (t) break;
        tr += dr; tc += dc;
      }
    }
  };

  switch (p.type) {
    case "p": {
      const dir = p.color === "w" ? -1 : 1;
      const startRow = p.color === "w" ? 6 : 1;
      // вперёд
      if (inside(r + dir, c) && !b[r + dir][c]) {
        moves.push({ fr: r, fc: c, tr: r + dir, tc: c });
        if (r === startRow && !b[r + 2 * dir][c]) {
          moves.push({ fr: r, fc: c, tr: r + 2 * dir, tc: c });
        }
      }
      // взятия
      for (const dc of [-1, 1]) {
        const tr = r + dir, tc = c + dc;
        if (inside(tr, tc) && b[tr][tc] && b[tr][tc]!.color !== p.color) {
          moves.push({ fr: r, fc: c, tr, tc });
        }
      }
      break;
    }
    case "n": {
      const deltas = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dr, dc] of deltas) add(r + dr, c + dc);
      break;
    }
    case "b":
      slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
      break;
    case "r":
      slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
      break;
    case "q":
      slide([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
      break;
    case "k": {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr || dc) add(r + dr, c + dc);
        }
      }
      break;
    }
  }
  return moves;
}

function findKing(b: Board, color: Color): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const s = b[r][c];
      if (s && s.type === "k" && s.color === color) return [r, c];
    }
  }
  return null;
}

export function isAttacked(b: Board, r: number, c: number, by: Color): boolean {
  for (let rr = 0; rr < 8; rr++) {
    for (let cc = 0; cc < 8; cc++) {
      const s = b[rr][cc];
      if (s && s.color === by) {
        // пешка атакует по диагонали (особый случай — pseudoMoves для пешки
        // включает только взятия при наличии фигуры, поэтому проверяем явно)
        if (s.type === "p") {
          const dir = by === "w" ? -1 : 1;
          if (rr + dir === r && (cc - 1 === c || cc + 1 === c)) return true;
          continue;
        }
        for (const m of pseudoMoves(b, rr, cc)) {
          if (m.tr === r && m.tc === c) return true;
        }
      }
    }
  }
  return false;
}

export function inCheck(b: Board, color: Color): boolean {
  const k = findKing(b, color);
  if (!k) return false;
  return isAttacked(b, k[0], k[1], color === "w" ? "b" : "w");
}

export function applyMove(b: Board, m: Move): Board {
  const nb = cloneBoard(b);
  const piece = nb[m.fr][m.fc];
  nb[m.tr][m.tc] = piece;
  nb[m.fr][m.fc] = null;
  // превращение пешки в ферзя
  if (piece && piece.type === "p" && (m.tr === 0 || m.tr === 7)) {
    nb[m.tr][m.tc] = { type: "q", color: piece.color };
  }
  return nb;
}

// Легальные ходы конкретной фигуры (с учётом собственного шаха)
export function legalMovesFrom(b: Board, r: number, c: number): Move[] {
  const p = b[r][c];
  if (!p) return [];
  return pseudoMoves(b, r, c).filter((m) => {
    const nb = applyMove(b, m);
    return !inCheck(nb, p.color);
  });
}

export function allLegalMoves(b: Board, color: Color): Move[] {
  const res: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const s = b[r][c];
      if (s && s.color === color) res.push(...legalMovesFrom(b, r, c));
    }
  }
  return res;
}

export type GameStatus = "playing" | "checkmate" | "stalemate";

export function getStatus(b: Board, toMove: Color): GameStatus {
  const moves = allLegalMoves(b, toMove);
  if (moves.length > 0) return "playing";
  return inCheck(b, toMove) ? "checkmate" : "stalemate";
}

const VALUE: Record<PieceType, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

// Простой ИИ для Ксюши: выбирает ход с наибольшей выгодой на 1 полуход вперёд
// (берёт ценную фигуру, избегает явных потерь). Достаточно для детской партии.
export function pickKsushaMove(b: Board, level = 1): Move | null {
  const moves = allLegalMoves(b, "b");
  if (moves.length === 0) return null;

  // На низком уровне Ксюша часто ходит наугад (поддаётся малышу),
  // с ростом уровня всё чаще выбирает лучший ход.
  // level 1 → ~60% случайных ходов, level 5+ → почти всегда лучший.
  const randomChance = Math.max(0, 0.7 - (level - 1) * 0.15);
  if (Math.random() < randomChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Чем выше уровень, тем строже Ксюша избегает потерь и точнее считает.
  const captureWeight = 10;
  const dangerWeight = 4 + level * 2; // выше уровень → сильнее бережёт фигуры
  const noise = Math.max(0.05, 1.5 - level * 0.25); // меньше случайности с уровнем

  let best: Move | null = null;
  let bestScore = -Infinity;

  for (const m of moves) {
    let score = 0;
    const target = b[m.tr][m.tc];
    if (target) score += VALUE[target.type] * captureWeight;

    const nb = applyMove(b, m);

    // мат сопернику — максимальный приоритет
    if (getStatus(nb, "w") === "checkmate") score += 1000;
    // шах — небольшой бонус
    if (inCheck(nb, "w")) score += 2;

    // штраф, если после хода наша фигура под боем (может быть взята)
    if (isAttacked(nb, m.tr, m.tc, "w")) {
      const moved = nb[m.tr][m.tc];
      if (moved) score -= VALUE[moved.type] * dangerWeight;
    }

    // на высоких уровнях — лёгкое стремление к центру доски
    if (level >= 3) {
      const centerBonus = 3 - (Math.abs(m.tr - 3.5) + Math.abs(m.tc - 3.5));
      score += centerBonus * 0.2;
    }

    score += Math.random() * noise;

    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}