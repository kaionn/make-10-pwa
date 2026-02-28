import type { ExpressionToken } from '../logic/generateFillInBlank';
import type { Level } from '../hooks/useMake10';

interface DisplayProps {
  expression: string;
  answer?: string;
  level: Level;
  fillInBlankTokens?: ExpressionToken[];
}

function BlankSlot() {
  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-dashed border-amber-400 bg-amber-100 animate-blank-pulse"
      aria-label="えらんでね"
    >
      <span className="text-amber-300 text-lg">?</span>
    </span>
  );
}

function FillInBlankDisplay({ tokens }: { tokens: ExpressionToken[] }) {
  return (
    <div className="flex w-full items-center justify-center px-5 py-4">
      <div
        className="w-full rounded-2xl border-2 border-violet-200 bg-white/90 px-5 py-6 text-center text-[1.625rem] font-semibold text-slate-800 min-h-[4rem] shadow-sm backdrop-blur-sm"
        aria-live="polite"
      >
        <span className="inline-flex flex-wrap items-center justify-center gap-0.5">
          {tokens.map((token, i) => {
            if (token.isBlank) {
              return <BlankSlot key={i} />;
            }
            return (
              <span key={i} className="inline-block">
                {token.value}
              </span>
            );
          })}
          <span className="inline-block ml-1 text-slate-400">= 10</span>
        </span>
      </div>
    </div>
  );
}

export function Display({ expression, answer, level, fillInBlankTokens }: DisplayProps) {
  // Level 1: fill-in-the-blank display
  if (level === 1 && fillInBlankTokens) {
    return <FillInBlankDisplay tokens={fillInBlankTokens} />;
  }

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

  // Level 2 placeholder is different
  const placeholder = level === 2
    ? 'のこりの すうじを いれよう!'
    : 'しきを つくろう!';

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
              // in the key -- when a new char is appended, the last span remounts
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
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}
