import { useCallback, useEffect, useState } from 'react';
import { generatePuzzle } from '../logic/generatePuzzle';
import { validateExpression } from '../logic/validator';
import { evaluate } from '../logic/parser';
import { solve } from '../logic/solver';
import { generateFillInBlank } from '../logic/generateFillInBlank';
import type { FillInBlankPuzzle } from '../logic/generateFillInBlank';
import { generatePartialPuzzle } from '../logic/generatePartialPuzzle';
import type { PartialPuzzle } from '../logic/generatePartialPuzzle';

export type Feedback = 'correct' | 'incorrect' | 'answer' | null;

export type CelebrationVariant = 'confetti' | 'starburst' | 'sparkle';

export type Level = 1 | 2 | 3;

const CORRECT_MESSAGES = [
  'すごい! せいかい!',
  'やったね! てんさい!',
  'かんぺき!',
  'おみごと!',
  'ばっちり!',
];

const CELEBRATION_VARIANTS: CelebrationVariant[] = ['confetti', 'starburst', 'sparkle'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getLevel(score: number): Level {
  if (score < 5) return 1;
  if (score < 10) return 2;
  return 3;
}

export interface NumberEntry {
  digit: number;
  used: boolean;
}

export interface Make10State {
  expression: string;
  numbers: NumberEntry[];
  score: number;
  feedback: Feedback;
  solutions: string[];
  showGiveUpConfirm: boolean;
  celebrationVariant: CelebrationVariant;
  correctMessage: string;
  // v3: difficulty system
  level: Level;
  showLevelUp: boolean;
  newLevel: 2 | 3 | null;
  fillInBlankPuzzle: FillInBlankPuzzle | null;
  partialPuzzle: PartialPuzzle | null;
  wrongChoiceIndex: number | null;
  wrongChoiceKey: number;
}

const STORAGE_KEY = 'make10-score';

const loadScore = (): number => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
};

const saveScore = (score: number): void => {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    // localStorage unavailable -- silently ignore
  }
};

const createLevel3Puzzle = (): { numbers: NumberEntry[]; solutions: string[] } => {
  const digits = generatePuzzle();
  const solutions = solve(digits);
  return {
    numbers: digits.map((digit) => ({ digit, used: false })),
    solutions,
  };
};

const markUsedNumbers = (expression: string, numbers: NumberEntry[]): NumberEntry[] => {
  const used = new Array(numbers.length).fill(false);
  for (const ch of expression) {
    if (ch >= '0' && ch <= '9') {
      const d = Number(ch);
      const idx = numbers.findIndex((n, i) => n.digit === d && !used[i]);
      if (idx !== -1) used[idx] = true;
    }
  }
  return numbers.map((n, i) => ({ ...n, used: used[i] }));
};

function createInitialState(): Make10State {
  const score = loadScore();
  const level = getLevel(score);

  const base: Omit<Make10State, 'expression' | 'numbers' | 'solutions' | 'fillInBlankPuzzle' | 'partialPuzzle'> = {
    score,
    feedback: null,
    showGiveUpConfirm: false,
    celebrationVariant: 'confetti',
    correctMessage: CORRECT_MESSAGES[0],
    level,
    showLevelUp: false,
    newLevel: null,
    wrongChoiceIndex: null,
    wrongChoiceKey: 0,
  };

  if (level === 1) {
    const puzzle = generateFillInBlank();
    return {
      ...base,
      expression: '',
      numbers: puzzle.numbers.map((digit) => ({ digit, used: false })),
      solutions: puzzle.solutions,
      fillInBlankPuzzle: puzzle,
      partialPuzzle: null,
    };
  }

  if (level === 2) {
    const puzzle = generatePartialPuzzle();
    return {
      ...base,
      expression: '',
      numbers: puzzle.numbers,
      solutions: puzzle.solutions,
      fillInBlankPuzzle: null,
      partialPuzzle: puzzle,
    };
  }

  // Level 3
  const puzzle = createLevel3Puzzle();
  return {
    ...base,
    expression: '',
    numbers: puzzle.numbers,
    solutions: puzzle.solutions,
    fillInBlankPuzzle: null,
    partialPuzzle: null,
  };
}

export function useMake10() {
  const [state, setState] = useState<Make10State>(createInitialState);

  useEffect(() => {
    saveScore(state.score);
  }, [state.score]);

  const appendToExpression = useCallback((char: string) => {
    setState((prev) => {
      if (prev.feedback) return prev;
      if (prev.showGiveUpConfirm) return prev;

      // In level 2, prevent editing past pre-filled numbers
      const next = prev.expression + char;
      return {
        ...prev,
        expression: next,
        numbers: markUsedNumbers(next, prev.numbers.map((n) => ({ ...n, used: false }))),
      };
    });
  }, []);

  const appendDigit = useCallback((index: number) => {
    setState((prev) => {
      if (prev.feedback) return prev;
      if (prev.showGiveUpConfirm) return prev;
      if (prev.numbers[index].used) return prev;

      const digit = prev.numbers[index].digit;
      const next = prev.expression + String(digit);
      return {
        ...prev,
        expression: next,
        numbers: markUsedNumbers(next, prev.numbers.map((n) => ({ ...n, used: false }))),
      };
    });
  }, []);

  const appendOperator = useCallback((op: string) => {
    appendToExpression(op);
  }, [appendToExpression]);

  const appendBracket = useCallback((bracket: '(' | ')') => {
    appendToExpression(bracket);
  }, [appendToExpression]);

  const backspace = useCallback(() => {
    setState((prev) => {
      if (prev.feedback) return prev;
      if (prev.showGiveUpConfirm) return prev;

      const next = prev.expression.slice(0, -1);
      return {
        ...prev,
        expression: next,
        numbers: markUsedNumbers(next, prev.numbers.map((n) => ({ ...n, used: false }))),
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((prev) => {
      if (prev.feedback) return prev;
      if (prev.showGiveUpConfirm) return prev;
      return { ...prev, expression: '', numbers: prev.numbers.map((n) => ({ ...n, used: false })) };
    });
  }, []);

  const judge = useCallback(() => {
    setState((prev) => {
      if (prev.feedback) return prev;
      if (prev.showGiveUpConfirm) return prev;

      const givenNumbers = prev.numbers.map((n) => n.digit);
      const validation = validateExpression(prev.expression, givenNumbers);
      if (!validation.valid) {
        return { ...prev, feedback: 'incorrect' as const };
      }

      try {
        const result = evaluate(prev.expression);
        const isCorrect = Math.abs(result - 10) < 1e-9;
        const newScore = isCorrect ? prev.score + 1 : prev.score;

        return {
          ...prev,
          feedback: isCorrect ? ('correct' as const) : ('incorrect' as const),
          score: newScore,
          celebrationVariant: isCorrect ? pickRandom(CELEBRATION_VARIANTS) : prev.celebrationVariant,
          correctMessage: isCorrect ? pickRandom(CORRECT_MESSAGES) : prev.correctMessage,
        };
      } catch {
        return { ...prev, feedback: 'incorrect' as const };
      }
    });
  }, []);

  /**
   * Level 1: handle choice selection for fill-in-the-blank.
   */
  const selectChoice = useCallback((choiceIndex: number) => {
    setState((prev) => {
      if (prev.feedback) return prev;
      if (!prev.fillInBlankPuzzle) return prev;

      const puzzle = prev.fillInBlankPuzzle;
      const selectedChoice = puzzle.choices[choiceIndex];
      const isCorrect = selectedChoice === puzzle.correctAnswer;

      if (isCorrect) {
        const newScore = prev.score + 1;
        return {
          ...prev,
          feedback: 'correct' as const,
          score: newScore,
          celebrationVariant: pickRandom(CELEBRATION_VARIANTS),
          correctMessage: pickRandom(CORRECT_MESSAGES),
          wrongChoiceIndex: null,
        };
      }

      // Wrong answer: shake the button, allow retry
      return {
        ...prev,
        wrongChoiceIndex: choiceIndex,
        wrongChoiceKey: prev.wrongChoiceKey + 1,
      };
    });
  }, []);

  const generateNextPuzzle = useCallback((level: Level): Partial<Make10State> => {
    if (level === 1) {
      const puzzle = generateFillInBlank();
      return {
        expression: '',
        numbers: puzzle.numbers.map((digit) => ({ digit, used: false })),
        solutions: puzzle.solutions,
        fillInBlankPuzzle: puzzle,
        partialPuzzle: null,
        feedback: null,
        showGiveUpConfirm: false,
        wrongChoiceIndex: null,
      };
    }

    if (level === 2) {
      const puzzle = generatePartialPuzzle();
      return {
        expression: '',
        numbers: puzzle.numbers,
        solutions: puzzle.solutions,
        fillInBlankPuzzle: null,
        partialPuzzle: puzzle,
        feedback: null,
        showGiveUpConfirm: false,
        wrongChoiceIndex: null,
      };
    }

    // Level 3
    const puzzle = createLevel3Puzzle();
    return {
      expression: '',
      numbers: puzzle.numbers,
      solutions: puzzle.solutions,
      fillInBlankPuzzle: null,
      partialPuzzle: null,
      feedback: null,
      showGiveUpConfirm: false,
      wrongChoiceIndex: null,
    };
  }, []);

  const dismissFeedback = useCallback(() => {
    setState((prev) => {
      if (prev.feedback === 'correct' || prev.feedback === 'answer') {
        // Check for level-up
        const oldLevel = prev.level;
        const newLevel = getLevel(prev.score);

        if (newLevel > oldLevel) {
          // Show level-up overlay before advancing
          return {
            ...prev,
            feedback: null,
            showLevelUp: true,
            newLevel: newLevel as 2 | 3,
            level: newLevel,
          };
        }

        // No level-up: advance to next puzzle
        const nextPuzzleState = generateNextPuzzle(newLevel);
        return {
          ...prev,
          ...nextPuzzleState,
          level: newLevel,
        };
      }

      // Incorrect: dismiss and allow retry
      return { ...prev, feedback: null };
    });
  }, [generateNextPuzzle]);

  const dismissLevelUp = useCallback(() => {
    setState((prev) => {
      const nextPuzzleState = generateNextPuzzle(prev.level);
      return {
        ...prev,
        ...nextPuzzleState,
        showLevelUp: false,
        newLevel: null,
      };
    });
  }, [generateNextPuzzle]);

  // Give up flow
  const requestGiveUp = useCallback(() => {
    setState((prev) => {
      if (prev.feedback) return prev;
      return { ...prev, showGiveUpConfirm: true };
    });
  }, []);

  const cancelGiveUp = useCallback(() => {
    setState((prev) => ({ ...prev, showGiveUpConfirm: false }));
  }, []);

  const confirmGiveUp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showGiveUpConfirm: false,
      feedback: 'answer' as const,
    }));
  }, []);

  return {
    ...state,
    appendDigit,
    appendOperator,
    appendBracket,
    backspace,
    clear,
    judge,
    selectChoice,
    dismissFeedback,
    dismissLevelUp,
    requestGiveUp,
    cancelGiveUp,
    confirmGiveUp,
  };
}
