interface DisplayProps {
  expression: string;
  answer?: string;
}

export function Display({ expression, answer }: DisplayProps) {
  // When showing an answer, display the answer expression
  if (answer) {
    return (
      <div className="flex w-full items-center justify-center px-5 py-4">
        <div
          className="w-full rounded-2xl border-2 border-violet-200 bg-white/90 px-5 py-6 text-right text-3xl font-semibold text-slate-800 min-h-[4rem] shadow-sm backdrop-blur-sm"
          aria-live="polite"
        >
          {answer} = 10
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center px-5 py-4">
      <div
        className="w-full rounded-2xl border-2 border-violet-200 bg-white/90 px-5 py-6 text-right text-3xl font-semibold text-slate-800 min-h-[4rem] shadow-sm backdrop-blur-sm"
        aria-live="polite"
      >
        {expression ? (
          <span className="inline-flex flex-wrap justify-end">
            {Array.from(expression).map((char, i) => {
              // Trigger bounce for the last character by using expression length
              // in the key - when a new char is appended, the last span remounts
              // and replays the animation
              const isLast = i === expression.length - 1;
              return (
                <span
                  key={isLast ? `${i}-${expression.length}` : `${i}`}
                  className={isLast ? 'animate-char-bounce' : ''}
                  style={{ display: 'inline-block' }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ) : (
          <span className="text-slate-300 block text-center">
            しきを つくろう!
          </span>
        )}
      </div>
    </div>
  );
}
