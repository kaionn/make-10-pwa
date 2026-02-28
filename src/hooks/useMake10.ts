import { useCallback, useEffect, useState } from 'react';
import { generatePuzzle } from '../logic/generatePuzzle';
import { validateExpression } from '../logic/validator';
import { evaluate } from '../logic/parser';
import { solve } from '../logic/solver';

export type Feedback = 'correct' | 'incorrect' | 'answer' | null;

export type CelebrationVariant = 'confetti' | 'starburst' | 'sparkle';

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
    // localStorage unavailable — silently ignore
  }
};

const createPuzzle = (): { numbers: NumberEntry[]; solutions: string[] } => {
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

export function useMake10() {
  const [state, setState] = useState<Make10State>(() => {
    const puzzle = createPuzzle();
    return {
      expression: '',
      numbers: puzzle.numbers,
      score: loadScore(),
      feedback: null,
      solutions: puzzle.solutions,
      showGiveUpConfirm: false,
      celebrationVariant: 'confetti',
      correctMessage: CORRECT_MESSAGES[0],
    };
  });

  useEffect(() => {
    saveScore(state.score);
  }, [state.score]);

  const appendToExpression = useCallback((char: string) => {
    setState((prev) => {
      if (prev.feedback) return prev;
      if (prev.showGiveUpConfirm) return prev;
      const next = prev.expression + char;
      return { ...prev, expression: next, numbers: markUsedNumbers(next, prev.numbers.map((n) => ({ ...n, used: false }))) };
    });
  }, []);

  const appendDigit = useCallback((index: number) => {
    setState((prev) => {
      if (prev.feedback) return prev;
      if (prev.showGiveUpConfirm) return prev;
      if (prev.numbers[index].used) return prev;
      const digit = prev.numbers[index].digit;
      const next = prev.expression + String(digit);
      return { ...prev, expression: next, numbers: markUsedNumbers(next, prev.numbers.map((n) => ({ ...n, used: false }))) };
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
      return { ...prev, expression: next, numbers: markUsedNumbers(next, prev.numbers.map((n) => ({ ...n, used: false }))) };
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
        return {
          ...prev,
          feedback: isCorrect ? ('correct' as const) : ('incorrect' as const),
          score: isCorrect ? prev.score + 1 : prev.score,
          celebrationVariant: isCorrect ? pickRandom(CELEBRATION_VARIANTS) : prev.celebrationVariant,
          correctMessage: isCorrect ? pickRandom(CORRECT_MESSAGES) : prev.correctMessage,
        };
      } catch {
        return { ...prev, feedback: 'incorrect' as const };
      }
    });
  }, []);

  const nextPuzzle = useCallback(() => {
    const puzzle = createPuzzle();
    setState((prev) => ({
      ...prev,
      expression: '',
      numbers: puzzle.numbers,
      solutions: puzzle.solutions,
      feedback: null,
      showGiveUpConfirm: false,
    }));
  }, []);

  const dismissFeedback = useCallback(() => {
    if (state.feedback === 'correct' || state.feedback === 'answer') {
      nextPuzzle();
    } else {
      setState((prev) => ({ ...prev, feedback: null }));
    }
  }, [state.feedback, nextPuzzle]);

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
    dismissFeedback,
    requestGiveUp,
    cancelGiveUp,
    confirmGiveUp,
  };
}
