import { useCallback } from 'react';
import { OPERATOR_LABELS } from '../logic/generateFillInBlank';

interface ChoiceButtonsProps {
  choices: string[];
  blankType: 'operator' | 'number';
  onSelect: (index: number) => void;
  puzzleKey: string;
  /** Index of the wrong choice to shake. A unique key per wrong attempt (e.g. timestamp) */
  wrongChoiceKey: string | null;
  wrongChoiceIdx: number | null;
}

const BUTTON_COLORS = [
  {
    bg: 'bg-rose-400',
    shadow: 'shadow-rose-300/50',
    active: 'active:bg-rose-500',
  },
  {
    bg: 'bg-sky-400',
    shadow: 'shadow-sky-300/50',
    active: 'active:bg-sky-500',
  },
  {
    bg: 'bg-emerald-400',
    shadow: 'shadow-emerald-300/50',
    active: 'active:bg-emerald-500',
  },
  {
    bg: 'bg-amber-400',
    shadow: 'shadow-amber-300/50',
    active: 'active:bg-amber-500',
  },
] as const;

export function ChoiceButtons({
  choices,
  blankType,
  onSelect,
  puzzleKey,
  wrongChoiceKey,
  wrongChoiceIdx,
}: ChoiceButtonsProps) {
  const getAriaLabel = useCallback((choice: string): string => {
    if (blankType === 'operator') {
      return OPERATOR_LABELS[choice] || choice;
    }
    return choice;
  }, [blankType]);

  return (
    <div className="grid grid-cols-2 gap-3 px-10">
      {choices.map((choice, i) => {
        const color = BUTTON_COLORS[i % BUTTON_COLORS.length];
        const isWrong = wrongChoiceIdx === i && wrongChoiceKey !== null;

        // Use wrongChoiceKey in the React key to force remount and retrigger
        // the shake animation each time a wrong choice is made.
        const buttonKey = isWrong
          ? `${puzzleKey}-choice-${i}-wrong-${wrongChoiceKey}`
          : `${puzzleKey}-choice-${i}`;

        return (
          <button
            key={buttonKey}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={getAriaLabel(choice)}
            className={`flex h-20 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-lg transition-transform duration-100 active:scale-[0.92] ${
              isWrong ? 'bg-red-300 animate-choice-shake' : `${color.bg} ${color.active}`
            } ${color.shadow} animate-pop-in`}
            style={{
              animationDelay: isWrong ? undefined : `${i * 50}ms`,
            }}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}
