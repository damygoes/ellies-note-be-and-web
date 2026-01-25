export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 5l7 7-7 7M20 12H4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.365 1.43c0 1.14-.47 2.18-1.23 3.01-.81.88-2.14 1.55-3.3 1.46-.15-1.1.38-2.23 1.1-3.06.8-.92 2.2-1.58 3.43-1.41zm4.7 17.03c-.36.83-.8 1.6-1.35 2.3-.75.98-1.36 1.66-2.43 1.68-1.03.02-1.36-.67-2.65-.67-1.29 0-1.66.65-2.7.69-1.03.04-1.81-.77-2.56-1.74-1.39-1.79-2.46-5.06-1.03-7.27.71-1.1 1.98-1.8 3.36-1.82 1.05-.02 2.04.71 2.65.71.61 0 1.77-.87 2.98-.74.51.02 1.96.21 2.89 1.58-.07.04-1.72 1-1.7 2.98.02 2.36 2.07 3.15 2.09 3.15-.02.06-.33 1.14-.85 2.25z" />
    </svg>
  );
}

export function OwlMark({ className }: { className?: string }) {
  // Simple owl-with-pen mark (SVG), meant as a friendly mascot placeholder.
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 28c0-10 6-16 14-16s14 6 14 16v10c0 8-6 14-14 14S18 46 18 38V28Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M22 25c2-4 6-6 10-6s8 2 10 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="26.5" cy="32" r="4" stroke="currentColor" strokeWidth="3" />
      <circle cx="37.5" cy="32" r="4" stroke="currentColor" strokeWidth="3" />
      <path
        d="M32 37c-2 0-4 1.5-4 3.2S30 44 32 44s4-2.1 4-3.8S34 37 32 37Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Pen */}
      <path
        d="M44 44l10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M52.5 54.5l3-3"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M40 48l4-4 6 6-4 4-8-2 2-4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
