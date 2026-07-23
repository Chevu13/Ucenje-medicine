import { cn } from '@/lib/utils';

/**
 * Brand ECG pulse line. `animated` draws the line in a loop
 * (disabled automatically for prefers-reduced-motion via globals.css).
 */
export function Ekg({
  className,
  color = '#0052FF',
  animated = false,
}: {
  className?: string;
  color?: string;
  animated?: boolean;
}) {
  return (
    <svg viewBox="0 0 200 60" fill="none" aria-hidden="true" className={cn('block', className)}>
      <path
        d="M0 34 h44 l10 -7 12 7 h16 l9 -30 9 48 7 -25 11 7 13 -7 h69"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'animate-ekg-draw' : undefined}
        style={animated ? { strokeDasharray: 600 } : undefined}
      />
    </svg>
  );
}
