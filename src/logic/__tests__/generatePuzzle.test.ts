import { describe, expect, it } from 'vitest';
import { solvableCombinations } from '../../data/solvableCombinations';
import { generatePuzzle } from '../generatePuzzle';

const sortTuple = (values: number[]): [number, number, number, number] => {
  const sorted = [...values].sort((a, b) => a - b);
  return [sorted[0], sorted[1], sorted[2], sorted[3]];
};

describe('generatePuzzle', () => {
  it('returns four numbers', () => {
    const puzzle = generatePuzzle();
    expect(puzzle).toHaveLength(4);
  });

  it('returns a solvable combination', () => {
    const puzzle = generatePuzzle();
    const tuple = sortTuple(puzzle);
    const exists = solvableCombinations.some(
      (combo) =>
        combo[0] === tuple[0] &&
        combo[1] === tuple[1] &&
        combo[2] === tuple[2] &&
        combo[3] === tuple[3]
    );
    expect(exists).toBe(true);
  });

  it('generates different results over multiple calls', () => {
    const first = generatePuzzle().join(',');
    let different = false;
    for (let i = 0; i < 10; i += 1) {
      if (generatePuzzle().join(',') !== first) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });
});
