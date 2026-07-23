'use client';

import { useEffect, useState } from 'react';

function diffParts(target: number) {
  const now = Date.now();
  const d = Math.max(0, target - now);
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d % 86_400_000) / 3_600_000),
    minutes: Math.floor((d % 3_600_000) / 60_000),
    done: d <= 0,
  };
}

/** Accessible countdown to a date (used for challenges). */
export function Countdown({ targetIso, label }: { targetIso: string; label: string }) {
  const target = new Date(targetIso).getTime();
  const [parts, setParts] = useState(() => diffParts(target));

  useEffect(() => {
    const id = setInterval(() => setParts(diffParts(target)), 30_000);
    return () => clearInterval(id);
  }, [target]);

  if (parts.done) return null;

  const cells = [
    { value: parts.days, unit: 'dana' },
    { value: parts.hours, unit: 'sati' },
    { value: parts.minutes, unit: 'min' },
  ];

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-brand-200">{label}</p>
      <div className="flex gap-3" role="timer" aria-label={`${label}: ${parts.days} dana, ${parts.hours} sati`}>
        {cells.map((c) => (
          <div key={c.unit} className="min-w-16 rounded-xl bg-white/10 px-3 py-2 text-center">
            <div className="text-2xl font-extrabold text-white">{c.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-200">{c.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
