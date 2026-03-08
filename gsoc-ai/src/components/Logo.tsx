interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>

      {/* Background - Command console shape */}
      <rect x="4" y="8" width="56" height="48" rx="6" fill="url(#bgGrad)" />
      
      {/* Screen/bezel */}
      <rect x="8" y="12" width="48" height="32" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="0.5" />
      
      {/* Data streams - OSINT gathering */}
      <g opacity="0.7">
        <rect x="12" y="16" width="8" height="2" rx="1" fill="#475569" />
        <rect x="12" y="20" width="12" height="2" rx="1" fill="#475569" />
        <rect x="12" y="24" width="6" height="2" rx="1" fill="#475569" />
        
        <rect x="12" y="30" width="10" height="2" rx="1" fill="#475569" />
        <rect x="12" y="34" width="14" height="2" rx="1" fill="#475569" />
        <rect x="12" y="38" width="8" height="2" rx="1" fill="#475569" />
      </g>

      {/* AI Brain - Neural network nodes */}
      <g>
        {/* Central AI node */}
        <circle cx="44" cy="28" r="5" fill="url(#aiGrad)" />
        
        {/* Neural connections */}
        <line x1="39" y1="28" x2="36" y2="24" stroke="#38BDF8" strokeWidth="1" opacity="0.6" />
        <line x1="39" y1="28" x2="36" y2="32" stroke="#38BDF8" strokeWidth="1" opacity="0.6" />
        <line x1="49" y1="28" x2="52" y2="24" stroke="#818CF8" strokeWidth="1" opacity="0.6" />
        <line x1="49" y1="28" x2="52" y2="32" stroke="#818CF8" strokeWidth="1" opacity="0.6" />
        
        {/* Connected nodes */}
        <circle cx="34" cy="22" r="2.5" fill="#38BDF8" />
        <circle cx="34" cy="34" r="2.5" fill="#38BDF8" />
        <circle cx="54" cy="22" r="2.5" fill="#818CF8" />
        <circle cx="54" cy="34" r="2.5" fill="#818CF8" />
      </g>

      {/* Intelligence beam - Glowing search/analysis */}
      <g>
        <ellipse cx="32" cy="28" rx="3" ry="2" fill="#F472B6" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="32" cy="28" rx="2" ry="1.5" fill="#A855F7" />
      </g>

      {/* Console base */}
      <rect x="10" y="48" width="44" height="4" rx="2" fill="#334155" />
      <circle cx="32" cy="50" r="1.5" fill="#22C55E">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Status indicators */}
      <circle cx="20" cy="50" r="1" fill="#EF4444" />
      <circle cx="44" cy="50" r="1" fill="#F59E0B" />
    </svg>
  );
}
