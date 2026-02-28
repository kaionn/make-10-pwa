interface ControlPadProps {
  onBackspace: () => void;
  onClear: () => void;
  onJudge: () => void;
  disabled: boolean;
  onGiveUp?: () => void;
  allNumbersUsed?: boolean;
}

export function ControlPad({ onBackspace, onClear, onJudge, disabled, onGiveUp, allNumbersUsed }: ControlPadProps) {
  return (
    <div className="grid grid-cols-4 gap-3 px-5">
      <button
        type="button"
        onClick={onGiveUp}
        disabled={disabled}
        aria-label="こたえを みる"
        className="flex h-[4.5rem] flex-col items-center justify-center rounded-2xl bg-violet-100 text-sm font-bold text-violet-500 shadow-sm transition-transform duration-100 active:scale-[0.92] disabled:opacity-40 disabled:shadow-none"
      >
        <span>こたえを</span>
        <span>みる</span>
      </button>
      <button
        type="button"
        onClick={onBackspace}
        disabled={disabled}
        className="flex h-[4.5rem] items-center justify-center rounded-2xl bg-slate-200 text-xl font-bold text-slate-600 shadow-sm transition-transform duration-100 active:scale-[0.92] active:bg-slate-300 disabled:opacity-40 disabled:shadow-none"
      >
        ⌫
      </button>
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="flex h-[4.5rem] items-center justify-center rounded-2xl bg-red-100 text-lg font-bold text-red-500 shadow-sm transition-transform duration-100 active:scale-[0.92] active:bg-red-200 disabled:opacity-40 disabled:shadow-none"
      >
        C
      </button>
      <button
        type="button"
        onClick={onJudge}
        disabled={disabled}
        className={`flex h-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 text-2xl font-extrabold text-white shadow-lg shadow-orange-400/40 transition-transform duration-100 active:scale-[0.92] disabled:opacity-40 disabled:shadow-none ${
          allNumbersUsed && !disabled ? 'animate-pulse-glow' : ''
        }`}
      >
        =
      </button>
    </div>
  );
}
