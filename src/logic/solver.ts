/**
 * Solver: Given 4 single-digit numbers, find all expressions that evaluate to 10.
 *
 * Algorithm:
 * 1. Generate all permutations of the 4 numbers (up to 24).
 * 2. For each permutation, try all 64 combinations of 3 operators (+, -, ×, ÷).
 * 3. For each (permutation, operators) pair, try all bracket patterns.
 * 4. Evaluate each expression; collect those that equal 10 (within floating-point tolerance).
 * 5. Deduplicate and return, preferring simpler expressions (fewer brackets).
 */

type Op = '+' | '-' | '×' | '÷';

const OPS: Op[] = ['+', '-', '×', '÷'];

/** Generate all permutations of an array. */
function permutations(arr: number[]): number[][] {
  if (arr.length <= 1) return [arr];
  const result: number[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

/** Safe evaluation of a op b. Returns null for division by zero. */
function applyOp(a: number, op: Op, b: number): number | null {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
  }
}

/**
 * All possible ways to combine 4 numbers (a, b, c, d) with 3 operators (o1, o2, o3).
 * There are 5 distinct binary tree structures for 4 operands:
 *
 * 1. ((a o1 b) o2 c) o3 d
 * 2. (a o1 (b o2 c)) o3 d
 * 3. (a o1 b) o2 (c o3 d)
 * 4. a o1 ((b o2 c) o3 d)
 * 5. a o1 (b o2 (c o3 d))
 *
 * Each returns: [result | null, expressionString]
 */
function evaluateAllTrees(
  nums: number[],
  ops: Op[],
): Array<{ value: number; expr: string }> {
  const [a, b, c, d] = nums;
  const [o1, o2, o3] = ops;
  const results: Array<{ value: number; expr: string }> = [];

  // Helper: format a number or sub-expression with parentheses if needed
  const fmt = (n: number) => String(n);

  // Tree 1: ((a o1 b) o2 c) o3 d
  {
    const r1 = applyOp(a, o1, b);
    if (r1 !== null) {
      const r2 = applyOp(r1, o2, c);
      if (r2 !== null) {
        const r3 = applyOp(r2, o3, d);
        if (r3 !== null) {
          const needP1 = needsParensLeft(o1, o2);
          const needP2 = needsParensOuter(o2, o3);
          let inner = `${fmt(a)}${o1}${fmt(b)}`;
          if (needP1) inner = `(${inner})`;
          let mid = `${inner}${o2}${fmt(c)}`;
          if (needP2) mid = `(${mid})`;
          const expr = `${mid}${o3}${fmt(d)}`;
          results.push({ value: r3, expr });
        }
      }
    }
  }

  // Tree 2: (a o1 (b o2 c)) o3 d
  {
    const r1 = applyOp(b, o2, c);
    if (r1 !== null) {
      const r2 = applyOp(a, o1, r1);
      if (r2 !== null) {
        const r3 = applyOp(r2, o3, d);
        if (r3 !== null) {
          const needP1 = needsParensRight(o2, o1);
          const needP2 = needsParensOuter(o1, o3);
          let inner = `${fmt(b)}${o2}${fmt(c)}`;
          if (needP1) inner = `(${inner})`;
          let mid = `${fmt(a)}${o1}${inner}`;
          if (needP2) mid = `(${mid})`;
          const expr = `${mid}${o3}${fmt(d)}`;
          results.push({ value: r3, expr });
        }
      }
    }
  }

  // Tree 3: (a o1 b) o2 (c o3 d)
  {
    const r1 = applyOp(a, o1, b);
    if (r1 !== null) {
      const r2 = applyOp(c, o3, d);
      if (r2 !== null) {
        const r3 = applyOp(r1, o2, r2);
        if (r3 !== null) {
          const needPL = needsParensLeft(o1, o2);
          const needPR = needsParensRight(o3, o2);
          let left = `${fmt(a)}${o1}${fmt(b)}`;
          if (needPL) left = `(${left})`;
          let right = `${fmt(c)}${o3}${fmt(d)}`;
          if (needPR) right = `(${right})`;
          const expr = `${left}${o2}${right}`;
          results.push({ value: r3, expr });
        }
      }
    }
  }

  // Tree 4: a o1 ((b o2 c) o3 d)
  {
    const r1 = applyOp(b, o2, c);
    if (r1 !== null) {
      const r2 = applyOp(r1, o3, d);
      if (r2 !== null) {
        const r3 = applyOp(a, o1, r2);
        if (r3 !== null) {
          const needP1 = needsParensLeft(o2, o3);
          let inner = `${fmt(b)}${o2}${fmt(c)}`;
          if (needP1) inner = `(${inner})`;
          let right = `${inner}${o3}${fmt(d)}`;
          const rightNeedsWrap = needsRightSubExprParens(o1, o3);
          if (rightNeedsWrap) right = `(${right})`;
          const expr = `${fmt(a)}${o1}${right}`;
          results.push({ value: r3, expr });
        }
      }
    }
  }

  // Tree 5: a o1 (b o2 (c o3 d))
  {
    const r1 = applyOp(c, o3, d);
    if (r1 !== null) {
      const r2 = applyOp(b, o2, r1);
      if (r2 !== null) {
        const r3 = applyOp(a, o1, r2);
        if (r3 !== null) {
          const needP1 = needsParensRight(o3, o2);
          let inner = `${fmt(c)}${o3}${fmt(d)}`;
          if (needP1) inner = `(${inner})`;
          let right = `${fmt(b)}${o2}${inner}`;
          const rightNeedsWrap = needsRightSubExprParens(o1, o2);
          if (rightNeedsWrap) right = `(${right})`;
          const expr = `${fmt(a)}${o1}${right}`;
          results.push({ value: r3, expr });
        }
      }
    }
  }

  return results;
}

/** Operator precedence: × and ÷ are higher than + and - */
function precedence(op: Op): number {
  return (op === '×' || op === '÷') ? 2 : 1;
}

/**
 * Does a left sub-expression (innerOp) need parentheses
 * when it's the left operand of outerOp?
 *
 * In standard math notation, left-associative means
 * a+b-c = (a+b)-c, so no parens needed for same precedence on left.
 * We only need parens when inner precedence < outer precedence.
 */
function needsParensLeft(innerOp: Op, outerOp: Op): boolean {
  return precedence(innerOp) < precedence(outerOp);
}

/**
 * Does a right sub-expression (innerOp) need parentheses
 * when it's the right operand of outerOp?
 *
 * Right side needs parens when:
 * - inner precedence < outer precedence (e.g., a×(b+c))
 * - same precedence AND outer is - or ÷ (non-commutative)
 *   e.g., a-(b+c), a-(b-c), a÷(b×c), a÷(b÷c)
 */
function needsParensRight(innerOp: Op, outerOp: Op): boolean {
  if (precedence(innerOp) < precedence(outerOp)) return true;
  if (precedence(innerOp) === precedence(outerOp)) {
    // Same precedence: needs parens if outer is - or ÷
    return outerOp === '-' || outerOp === '÷';
  }
  return false;
}

/**
 * For tree 4 and 5: does the compound right sub-expression need wrapping?
 * The outerOp connects `a` to the whole right side.
 * The right side's top-level operator is rightTopOp.
 */
function needsRightSubExprParens(outerOp: Op, rightTopOp: Op): boolean {
  return needsParensRight(rightTopOp, outerOp);
}

/**
 * For tree 1 - left-side compound in outer context.
 */
function needsParensOuter(innerTopOp: Op, outerOp: Op): boolean {
  return precedence(innerTopOp) < precedence(outerOp);
}

const EPSILON = 1e-9;

/**
 * Find all expressions using the given 4 numbers that evaluate to 10.
 * Returns array of expression strings using display characters (×, ÷).
 * Results are deduplicated and sorted by simplicity (fewer brackets first).
 */
export function solve(numbers: number[]): string[] {
  if (numbers.length !== 4) return [];

  const seen = new Set<string>();
  const results: string[] = [];

  const perms = permutations(numbers);
  // Deduplicate permutations for repeated digits
  const uniquePerms: number[][] = [];
  const permSet = new Set<string>();
  for (const p of perms) {
    const key = p.join(',');
    if (!permSet.has(key)) {
      permSet.add(key);
      uniquePerms.push(p);
    }
  }

  for (const perm of uniquePerms) {
    for (let i = 0; i < 64; i++) {
      const ops: Op[] = [
        OPS[i & 3],
        OPS[(i >> 2) & 3],
        OPS[(i >> 4) & 3],
      ];

      const trees = evaluateAllTrees(perm, ops);
      for (const { value, expr } of trees) {
        if (Math.abs(value - 10) < EPSILON && !seen.has(expr)) {
          seen.add(expr);
          results.push(expr);
        }
      }
    }
  }

  // Sort by simplicity: fewer brackets first, then shorter expressions
  results.sort((a, b) => {
    const bracketDiff = countBrackets(a) - countBrackets(b);
    if (bracketDiff !== 0) return bracketDiff;
    return a.length - b.length;
  });

  return results;
}

function countBrackets(expr: string): number {
  let count = 0;
  for (const ch of expr) {
    if (ch === '(' || ch === ')') count++;
  }
  return count;
}
