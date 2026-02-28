type NewLevel = 2 | 3;

interface LevelUpOverlayProps {
  newLevel: NewLevel;
  onDismiss: () => void;
}

const LEVEL_CONFIG = {
  2: {
    name: 'かんたん',
    color: 'text-sky-500',
    message: 'つぎは じぶんで しきを つくろう!',
  },
  3: {
    name: 'ふつう',
    color: 'text-violet-500',
    message: 'もう なんでも とけるね!',
  },
} as const;

// Pre-computed sparkle positions (deterministic)
const SPARKLE_PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const left = ((i * 41 + 17) % 100);
  const top = ((i * 59 + 11) % 100);
  const size = 4 + (i % 4);
  const delay = (i * 100) % 1200;
  const colors = ['bg-white', 'bg-amber-200', 'bg-pink-200', 'bg-sky-200'];
  const color = colors[i % colors.length];
  return { left, top, size, color, delay };
});

export function LevelUpOverlay({ newLevel, onDismiss }: LevelUpOverlayProps) {
  const config = LEVEL_CONFIG[newLevel];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="レベルアップ"
    >
      {/* Sparkle particles */}
      <div className="levelup-sparkle-container" aria-hidden="true">
        {SPARKLE_PARTICLES.map((s, i) => (
          <div
            key={i}
            className={`levelup-sparkle-particle ${s.color}`}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}ms`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 px-12 py-10 shadow-2xl shadow-purple-500/50 animate-level-up-pop">
        <span className="text-5xl" aria-hidden="true">✨</span>
        <span className="text-3xl font-extrabold text-white">
          レベルアップ!
        </span>

        {/* Level name badge */}
        <div className="rounded-2xl bg-white px-8 py-4 shadow-lg" aria-live="assertive">
          <span className={`text-4xl font-extrabold ${config.color}`}>
            {config.name}
          </span>
        </div>

        <span className="text-lg font-bold text-white/90">
          {config.message}
        </span>

        <span className="text-sm text-white/70">
          タップで つぎのもんだいへ
        </span>
      </div>
    </div>
  );
}
