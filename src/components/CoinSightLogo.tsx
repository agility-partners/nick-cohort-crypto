export default function CoinSightLogo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CoinSight logo"
    >
      <defs>
        {/* Main green gradient */}
        <linearGradient id="cs-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>

        {/* Darker gradient for the coin / iris */}
        <linearGradient id="cs-iris" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Subtle inner shadow for depth */}
        <radialGradient id="cs-shine" cx="38%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.30" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Glow filter */}
        <filter id="cs-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background circle ── */}
      <circle cx="32" cy="32" r="30" fill="#0d1a14" />
      <circle cx="32" cy="32" r="30" stroke="url(#cs-grad)" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />

      {/* ── Eye shape (two arcs forming an almond) ── */}
      <g filter="url(#cs-glow)">
        {/* Upper lid */}
        <path
          d="M10 32 Q 22 16, 32 16 Q 42 16, 54 32"
          stroke="url(#cs-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Lower lid */}
        <path
          d="M10 32 Q 22 48, 32 48 Q 42 48, 54 32"
          stroke="url(#cs-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ── Iris — the coin ── */}
      <circle cx="32" cy="32" r="10.5" fill="url(#cs-iris)" />
      <circle cx="32" cy="32" r="10.5" fill="url(#cs-shine)" />

      {/* Coin rim (double ring like a real coin edge) */}
      <circle cx="32" cy="32" r="10.5" stroke="#4ade80" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
      <circle cx="32" cy="32" r="8.2" stroke="#4ade80" strokeWidth="0.6" strokeOpacity="0.35" fill="none" />

      {/* Dollar sign in the coin */}
      <text
        x="32"
        y="36.5"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="#4ade80"
        opacity="0.9"
      >
        $
      </text>

      {/* ── Pupil (small dark center dot) ── */}
      <circle cx="32" cy="32" r="3" fill="#0d1a14" opacity="0.5" />

      {/* Highlight / light reflection on coin */}
      <circle cx="28.5" cy="28.5" r="2" fill="white" opacity="0.15" />
    </svg>
  );
}
