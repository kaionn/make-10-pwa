import { LevelIndicator } from './LevelIndicator';

type Level = 1 | 2 | 3;

interface HeaderProps {
  score: number;
  level: Level;
}

export function Header({ score, level }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between px-5 py-4">
      <h1 className="text-2xl font-bold text-slate-800">Make 10</h1>
      <LevelIndicator level={level} score={score} />
      <div
        key={score}
        className="animate-score-bounce rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-1.5 text-sm font-bold text-orange-900 shadow-md shadow-amber-300/40"
      >
        <span className="inline-block">⭐</span>{' '}
        {score}
      </div>
    </header>
  );
}
