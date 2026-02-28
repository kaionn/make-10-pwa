import type { NumberEntry } from '../hooks/useMake10';
import { generatePuzzle } from './generatePuzzle';
import { solve } from './solver';

export interface PartialPuzzle {
  numbers: NumberEntry[];
  /** Indices of the 2 "hinted" numbers -- shown with visual emphasis in NumberPad */
  hintedIndices: number[];
  solutions: string[];
}

/**
 * Generate a partial assembly puzzle for Level 2.
 *
 * Picks 4 solvable digits. Two are randomly chosen as "hinted" -- they get
 * visual emphasis in the NumberPad. All 4 numbers remain clickable; the user
 * builds a full expression just like Level 3, but the hints reduce cognitive load.
 */
export function generatePartialPuzzle(): PartialPuzzle {
  const digits = generatePuzzle();
  const solutions = solve(digits);

  // Create number entries (all available, none pre-used)
  const numbers: NumberEntry[] = digits.map((digit) => ({ digit, used: false }));

  // Pick 2 random indices to hint
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > indices.length - 3; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const hintedIndices = indices.slice(-2).sort((a, b) => a - b);

  return {
    numbers,
    hintedIndices,
    solutions,
  };
}
