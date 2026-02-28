/**
 * AmbientBackground: floating decorative shapes behind the main content.
 * Pure CSS animation, no JS runtime cost.
 */

interface Shape {
  type: 'circle' | 'star' | 'triangle';
  size: number;
  color: string;
  opacity: number;
  top: string;
  left: string;
  animationName: string;
  duration: string;
  delay: string;
}

const SHAPES: Shape[] = [
  { type: 'circle', size: 40, color: '#fda4af', opacity: 0.08, top: '10%', left: '8%', animationName: 'ambient-float-1', duration: '20s', delay: '0s' },
  { type: 'star', size: 24, color: '#7dd3fc', opacity: 0.10, top: '25%', left: '80%', animationName: 'ambient-float-2', duration: '18s', delay: '-3s' },
  { type: 'circle', size: 52, color: '#fde68a', opacity: 0.06, top: '60%', left: '15%', animationName: 'ambient-float-3', duration: '22s', delay: '-7s' },
  { type: 'triangle', size: 32, color: '#c4b5fd', opacity: 0.10, top: '40%', left: '70%', animationName: 'ambient-float-1', duration: '25s', delay: '-5s' },
  { type: 'circle', size: 20, color: '#6ee7b7', opacity: 0.12, top: '75%', left: '50%', animationName: 'ambient-float-2', duration: '17s', delay: '-10s' },
  { type: 'star', size: 44, color: '#fbcfe8', opacity: 0.07, top: '15%', left: '45%', animationName: 'ambient-float-3', duration: '23s', delay: '-2s' },
  { type: 'circle', size: 28, color: '#c7d2fe', opacity: 0.09, top: '85%', left: '25%', animationName: 'ambient-float-1', duration: '19s', delay: '-8s' },
  { type: 'triangle', size: 36, color: '#99f6e4', opacity: 0.08, top: '50%', left: '90%', animationName: 'ambient-float-2', duration: '21s', delay: '-4s' },
];

const STAR_CLIP = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
const TRIANGLE_CLIP = 'polygon(50% 0%, 0% 100%, 100% 100%)';

export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {SHAPES.map((shape, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: shape.top,
            left: shape.left,
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            opacity: shape.opacity,
            borderRadius: shape.type === 'circle' ? '50%' : undefined,
            clipPath: shape.type === 'star' ? STAR_CLIP : shape.type === 'triangle' ? TRIANGLE_CLIP : undefined,
            animation: `${shape.animationName} ${shape.duration} ease-in-out infinite`,
            animationDelay: shape.delay,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
