import { generatePuzzle } from './generatePuzzle';
import { solve } from './solver';

export interface ExpressionToken {
  type: 'number' | 'operator' | 'paren';
  value: string;
  isBlank: boolean;
}

export interface BlankInfo {
  index: number;
  type: 'operator' | 'number';
  correctAnswer: string;
  choices: string[];
}

export interface FillInBlankPuzzle {
  numbers: number[];
  tokens: ExpressionToken[];
  blanks: BlankInfo[];
  solutions: string[];
  // Backward-compatible aliases (derived from blanks[0])
  blankIndex: number;
  blankType: 'operator' | 'number';
  choices: string[];
  correctAnswer: string;
}

const OPERATORS = new Set(['+', '-', '×', '÷']);

const OPERATOR_LABELS: Record<string, string> = {
  '+': 'たす',
  '-': 'ひく',
  '×': 'かける',
  '÷': 'わる',
};

export { OPERATOR_LABELS };

/**
 * Tokenize an expression string into typed tokens.
 */
function tokenize(expr: string): ExpressionToken[] {
  const tokens: ExpressionToken[] = [];
  for (const ch of expr) {
    if (ch >= '0' && ch <= '9') {
      tokens.push({ type: 'number', value: ch, isBlank: false });
    } else if (OPERATORS.has(ch)) {
      tokens.push({ type: 'operator', value: ch, isBlank: false });
    } else if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch, isBlank: false });
    }
  }
  return tokens;
}

/**
 * Shuffle an array in-place using Fisher-Yates.
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate dummy number choices for a blank number position.
 */
function generateNumberChoices(correctDigit: string, puzzleNumbers: number[]): string[] {
  const correct = Number(correctDigit);
  const candidates = new Set<number>();

  // Add digits from the puzzle that differ from the correct answer
  for (const n of puzzleNumbers) {
    if (n !== correct) {
      candidates.add(n);
    }
  }

  // Add nearby digits if we need more
  for (let d = 0; d <= 9 && candidates.size < 3; d++) {
    if (d !== correct) {
      candidates.add(d);
    }
  }

  // Pick 2-3 distractors
  const distractors = shuffle([...candidates]).slice(0, 3);
  const choices = [correctDigit, ...distractors.map(String)];
  return shuffle(choices);
}

/**
 * Generate operator choices (always all 4 operators).
 */
function generateOperatorChoices(correctOp: string): string[] {
  const allOps = ['+', '-', '×', '÷'];
  return shuffle(allOps.filter((op) => allOps.includes(op) || op === correctOp));
}

/**
 * Find blankable positions in the token array.
 * Returns indices of number and operator tokens (excluding parentheses).
 */
function findBlankablePositions(tokens: ExpressionToken[]): number[] {
  const positions: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'number' || tokens[i].type === 'operator') {
      positions.push(i);
    }
  }
  return positions;
}

/**
 * Check if two positions are adjacent in the token array.
 */
function areAdjacent(a: number, b: number): boolean {
  return Math.abs(a - b) === 1;
}

/**
 * Generate a fill-in-the-blank puzzle for Level 1.
 *
 * Selects the simplest solution (fewest brackets), tokenizes it,
 * blanks out TWO positions, and generates choices for each.
 */
export function generateFillInBlank(): FillInBlankPuzzle {
  const digits = generatePuzzle();
  const solutions = solve(digits);

  // Pick the simplest expression (first in sorted results = fewest brackets)
  const expr = solutions[0];

  const tokens = tokenize(expr);
  const blankablePositions = findBlankablePositions(tokens);

  // Pick 2 random positions to blank out
  let pos1: number = blankablePositions[0];
  let pos2: number = blankablePositions.length >= 2 ? blankablePositions[1] : blankablePositions[0];

  if (blankablePositions.length >= 2) {
    // Try to pick non-adjacent positions first
    const shuffledPositions = shuffle(blankablePositions);
    let found = false;

    for (let i = 0; i < shuffledPositions.length && !found; i++) {
      for (let j = i + 1; j < shuffledPositions.length && !found; j++) {
        if (!areAdjacent(shuffledPositions[i], shuffledPositions[j])) {
          pos1 = Math.min(shuffledPositions[i], shuffledPositions[j]);
          pos2 = Math.max(shuffledPositions[i], shuffledPositions[j]);
          found = true;
        }
      }
    }

    // If all blankable positions are adjacent, just pick any 2
    if (!found) {
      const picked = shuffle(blankablePositions).slice(0, 2).sort((a, b) => a - b);
      pos1 = picked[0];
      pos2 = picked[1];
    }
  }

  // Mark the tokens as blank
  const resultTokens = tokens.map((t, i) =>
    (i === pos1 || i === pos2) ? { ...t, isBlank: true } : t
  );

  // Build BlankInfo for each blank (sorted left to right)
  const blankPositions = [pos1, pos2];
  const blanks: BlankInfo[] = blankPositions.map((pos) => {
    const token = tokens[pos];
    const blankType = token.type === 'operator' ? 'operator' as const : 'number' as const;
    const correctAnswer = token.value;

    let choices: string[];
    if (blankType === 'operator') {
      choices = generateOperatorChoices(correctAnswer);
    } else {
      choices = generateNumberChoices(correctAnswer, digits);
    }

    return {
      index: pos,
      type: blankType,
      correctAnswer,
      choices,
    };
  });

  return {
    numbers: digits,
    tokens: resultTokens,
    blanks,
    solutions,
    // Backward-compatible aliases from first blank
    blankIndex: blanks[0].index,
    blankType: blanks[0].type,
    choices: blanks[0].choices,
    correctAnswer: blanks[0].correctAnswer,
  };
}
