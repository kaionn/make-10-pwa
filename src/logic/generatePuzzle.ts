import { solvableCombinations } from '../data/solvableCombinations';

const shuffle = (values: number[]): number[] => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const generatePuzzle = (): number[] => {
  const pick = solvableCombinations[Math.floor(Math.random() * solvableCombinations.length)];
  return shuffle(pick);
};
