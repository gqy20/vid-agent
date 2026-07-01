/* cc-insights logo：圆环描边 + 折线（历史 → 洞察） */
export const Logo: React.FC<{p: number}> = ({p}) => (
  <svg width={132} height={132} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5eead4" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="44" fill="none" stroke="url(#lg)" strokeWidth="3"
      strokeDasharray={276} strokeDashoffset={276 * (1 - p)} opacity={0.9} />
    <polyline points="28,64 42,52 54,58 72,34" fill="none" stroke="url(#lg)"
      strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={80} strokeDashoffset={80 * (1 - p)} />
    <circle cx="72" cy="34" r={4 * p} fill="#5eead4" />
  </svg>
);
