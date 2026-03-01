import { useState, useEffect, useRef } from 'react';
import { AmbientBackground } from './AmbientBackground';

interface TitleScreenProps {
  score: number;
  onStart: () => void;
}

/**
 * Floating decoration items (numbers and operators) for the title screen.
 * Each item floats gently using existing ambient-float keyframes.
 */
const DECORATIONS = [
  { char: '3', top: '12%', left: '10%', size: 'text-2xl', opacity: 0.08, animation: 'ambient-float-1', duration: '18s', delay: '0s' },
  { char: '+', top: '20%', left: '82%', size: 'text-3xl', opacity: 0.07, animation: 'ambient-float-2', duration: '22s', delay: '-3s' },
  { char: '7', top: '35%', left: '5%', size: 'text-xl', opacity: 0.06, animation: 'ambient-float-3', duration: '20s', delay: '-5s' },
  { char: '×', top: '68%', left: '88%', size: 'text-2xl', opacity: 0.09, animation: 'ambient-float-1', duration: '19s', delay: '-7s' },
  { char: '2', top: '75%', left: '12%', size: 'text-3xl', opacity: 0.07, animation: 'ambient-float-2', duration: '23s', delay: '-2s' },
  { char: '-', top: '82%', left: '75%', size: 'text-xl', opacity: 0.08, animation: 'ambient-float-3', duration: '17s', delay: '-8s' },
  { char: '5', top: '55%', left: '92%', size: 'text-2xl', opacity: 0.06, animation: 'ambient-float-1', duration: '21s', delay: '-4s' },
  { char: '÷', top: '45%', left: '90%', size: 'text-xl', opacity: 0.07, animation: 'ambient-float-2', duration: '24s', delay: '-6s' },
  { char: '8', top: '88%', left: '45%', size: 'text-2xl', opacity: 0.08, animation: 'ambient-float-3', duration: '16s', delay: '-1s' },
  { char: '1', top: '8%', left: '60%', size: 'text-xl', opacity: 0.06, animation: 'ambient-float-1', duration: '25s', delay: '-9s' },
  { char: '0', top: '62%', left: '20%', size: 'text-3xl', opacity: 0.07, animation: 'ambient-float-2', duration: '20s', delay: '-3s' },
  { char: '4', top: '30%', left: '70%', size: 'text-xl', opacity: 0.09, animation: 'ambient-float-3', duration: '18s', delay: '-5s' },
];

export function TitleScreen({ score, onStart }: TitleScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus the start button on mount
  useEffect(() => {
    startButtonRef.current?.focus();
  }, []);

  const handleStartClick = () => {
    setIsFadingOut(true);
  };

  const handleTransitionEnd = () => {
    if (isFadingOut) {
      onStart();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-pink-100 to-indigo-100 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transition: 'opacity 300ms ease-out' }}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* Shared ambient background */}
      <AmbientBackground />

      {/* Floating number/operator decorations (S10) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {DECORATIONS.map((deco, i) => (
          <span
            key={i}
            className={`absolute ${deco.size} font-bold text-slate-800 select-none`}
            style={{
              top: deco.top,
              left: deco.left,
              opacity: deco.opacity,
              animation: `${deco.animation} ${deco.duration} ease-in-out infinite`,
              animationDelay: deco.delay,
              willChange: 'transform',
            }}
          >
            {deco.char}
          </span>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex max-w-[428px] flex-col items-center px-6">
        {/* Title */}
        <h1
          className="animate-title-pop-in bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-5xl font-extrabold text-transparent"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          Make 10
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-center text-lg font-semibold text-slate-600">
          4つの すうじで 10を つくろう!
        </p>

        {/* Start button */}
        <button
          ref={startButtonRef}
          type="button"
          onClick={handleStartClick}
          className="animate-start-pulse mt-8 w-[200px] rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 text-2xl font-bold text-white shadow-lg shadow-orange-400/40 transition-transform duration-100 active:scale-95"
          aria-label="ゲームを はじめる"
        >
          スタート
        </button>

        {/* Continue play display (S11) */}
        {score > 0 && (
          <p className="mt-3 text-sm font-semibold text-amber-600">
            ⭐ {score} から つづける!
          </p>
        )}
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-slate-400">
        Make 10 Puzzle
      </p>
    </div>
  );
}
