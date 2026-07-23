export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Učitavanje">
      <svg viewBox="0 0 200 60" className="h-10 w-32" aria-hidden="true">
        <path
          d="M0 34 h44 l10 -7 12 7 h16 l9 -30 9 48 7 -25 11 7 13 -7 h69"
          stroke="#0052FF"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-ekg-draw"
          style={{ strokeDasharray: 600 }}
        />
      </svg>
      <span className="sr-only">Učitavanje…</span>
    </div>
  );
}
