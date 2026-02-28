import type { NumberEntry } from '../hooks/useMake10';

interface NumberPadProps {
  numbers: NumberEntry[];
  onPress: (index: number) => void;
  puzzleKey?: string;
  /** Indices of "hinted" numbers (Level 2) -- shown with a visual hint ring */
  hintedIndices?: number[];
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

export function NumberPad({ numbers, onPress, puzzleKey = '', hintedIndices }: NumberPadProps) {
  const hintedSet = new Set(hintedIndices ?? []);

  return (
    <div className="grid grid-cols-4 gap-3 px-5">
      {numbers.map((entry, i) => {
        const color = BUTTON_COLORS[i % BUTTON_COLORS.length];
        const isHinted = hintedSet.has(i);

        return (
          <button
            key={`${puzzleKey}-${i}`}
            type="button"
            disabled={entry.used}
            onClick={() => onPress(i)}
            className={`flex h-[4.5rem] items-center justify-center rounded-2xl text-3xl font-bold transition-transform duration-100 active:scale-[0.92] ${
              entry.used
                ? 'bg-slate-100 text-slate-300 line-through shadow-none opacity-30 scale-90'
                : `${color.bg} ${color.active} text-white shadow-lg ${color.shadow}`
            } ${isHinted && !entry.used ? 'ring-3 ring-white ring-offset-2 ring-offset-transparent' : ''} animate-pop-in`}
            style={{
              animationDelay: `${i * 50}ms`,
            }}
          >
            {entry.digit}
          </button>
        );
      })}
    </div>
  );
}
