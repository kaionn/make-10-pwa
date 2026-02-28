import type { Feedback, CelebrationVariant } from '../hooks/useMake10';

interface FeedbackOverlayProps {
  feedback: Feedback;
  onDismiss: () => void;
  answer?: string;
  celebrationVariant?: CelebrationVariant;
  correctMessage?: string;
}

// Pre-computed starburst positions (deterministic)
const STARBURST_STARS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * 2 * Math.PI;
  const distance = 120 + (i * 7) % 60;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const size = 12 + (i * 3) % 8;
  const colors = ['bg-amber-400', 'bg-rose-400', 'bg-sky-400', 'bg-emerald-400'];
  const color = colors[i % colors.length];
  return { x, y, size, color, delay: i * 30 };
});

// Pre-computed sparkle positions (deterministic)
const SPARKLE_PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const left = ((i * 37 + 13) % 100);
  const top = ((i * 53 + 7) % 100);
  const size = 4 + (i % 5);
  const delay = (i * 41) % 600;
  const colors = ['bg-white', 'bg-amber-200', 'bg-sky-200'];
  const color = colors[i % colors.length];
  return { left, top, size, color, delay };
});

function StarburstEffect() {
  return (
    <div className="starburst-container" aria-hidden="true">
      {STARBURST_STARS.map((star, i) => (
        <div
          key={i}
          className={`starburst-star ${star.color}`}
          style={{
            '--burst-x': `${star.x}px`,
            '--burst-y': `${star.y}px`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function SparkleEffect() {
  return (
    <div className="sparkle-container" aria-hidden="true">
      {SPARKLE_PARTICLES.map((s, i) => (
        <div
          key={i}
          className={`sparkle-particle ${s.color}`}
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
  );
}

export function FeedbackOverlay({
  feedback,
  onDismiss,
  answer,
  celebrationVariant = 'confetti',
  correctMessage = 'すごい! せいかい!',
}: FeedbackOverlayProps) {
  if (!feedback) return null;

  const isCorrect = feedback === 'correct';
  const isAnswer = feedback === 'answer';

  // Answer reveal overlay
  if (isAnswer) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onDismiss}
      >
        <div
          className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 px-12 py-10 shadow-2xl shadow-indigo-500/40 animate-pop"
          aria-live="polite"
        >
          <span className="text-7xl" aria-hidden="true">📖</span>
          <span className="text-2xl font-bold text-white">
            こうやって とくんだね!
          </span>
          {answer && (
            <div className="rounded-xl bg-white/90 px-6 py-3">
              <span className="text-3xl font-bold text-slate-800" role="text">
                {answer} = 10
              </span>
            </div>
          )}
          <span className="text-sm text-white/80">
            タップで つぎのもんだいへ
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onDismiss}
    >
      {isCorrect && (
        <>
          {(celebrationVariant === 'confetti' || celebrationVariant === 'starburst') && (
            <div className="confetti" aria-hidden="true">
              <span className="confetti-layer-2" />
              <span className="confetti-layer-3" />
            </div>
          )}
          {celebrationVariant === 'starburst' && <StarburstEffect />}
          {celebrationVariant === 'sparkle' && <SparkleEffect />}
        </>
      )}
      <div
        className={`flex flex-col items-center gap-4 rounded-3xl px-16 py-10 shadow-2xl animate-pop ${
          isCorrect
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/40'
            : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/40'
        }`}
      >
        <span className="text-7xl">{isCorrect ? '🎉' : '💪'}</span>
        <span className="text-4xl font-bold text-white">
          {isCorrect ? correctMessage : 'おしい! もういっかい!'}
        </span>
        <span className="text-sm text-white/80">
          {isCorrect ? 'タップで つぎのもんだいへ' : 'タップで もどる'}
        </span>
      </div>
    </div>
  );
}
