interface OperatorPadProps {
  onOperator: (op: string) => void;
  onBracket: (bracket: '(' | ')') => void;
}

const operators = ['+', '-', '×', '÷'] as const;

export function OperatorPad({ onOperator, onBracket }: OperatorPadProps) {
  return (
    <div className="grid grid-cols-6 gap-2 px-5">
      {operators.map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => onOperator(op)}
          className="flex h-14 items-center justify-center rounded-2xl bg-violet-400 text-xl font-bold text-white shadow-md shadow-violet-300/30 transition-transform duration-100 active:scale-[0.92] active:bg-violet-500"
        >
          {op}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onBracket('(')}
        className="flex h-14 items-center justify-center rounded-2xl bg-slate-200 text-xl font-bold text-slate-500 shadow-sm transition-transform duration-100 active:scale-[0.92] active:bg-slate-300"
      >
        (
      </button>
      <button
        type="button"
        onClick={() => onBracket(')')}
        className="flex h-14 items-center justify-center rounded-2xl bg-slate-200 text-xl font-bold text-slate-500 shadow-sm transition-transform duration-100 active:scale-[0.92] active:bg-slate-300"
      >
        )
      </button>
    </div>
  );
}
