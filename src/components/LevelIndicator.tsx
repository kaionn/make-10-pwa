type Level = 1 | 2 | 3;

interface LevelIndicatorProps {
  level: Level;
  score: number;
}

const LEVEL_CONFIG = {
  1: { name: 'ちょうかんたん', color: 'text-emerald-600', dotColor: 'bg-emerald-400', baseScore: 0, maxDots: 5 },
  2: { name: 'かんたん', color: 'text-sky-600', dotColor: 'bg-sky-400', baseScore: 5, maxDots: 5 },
  3: { name: 'ふつう', color: 'text-violet-600', dotColor: 'bg-violet-400', baseScore: 10, maxDots: 0 },
} as const;

export function LevelIndicator({ level, score }: LevelIndicatorProps) {
  const config = LEVEL_CONFIG[level];
  const filledDots = Math.min(score - config.baseScore, config.maxDots);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xs font-bold ${config.color}`}>
        {config.name}
      </span>
      {config.maxDots > 0 && (
        <div className="flex gap-1" aria-label={`あと ${config.maxDots - filledDots} もんで レベルアップ`}>
          {Array.from({ length: config.maxDots }, (_, i) => {
            const isFilled = i < filledDots;
            return (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  isFilled ? `${config.dotColor} animate-dot-pop` : 'bg-slate-200'
                }`}
                style={isFilled ? { animationDelay: `${i * 50}ms` } : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
