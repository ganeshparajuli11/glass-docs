type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="9"
        y="7"
        width="18"
        height="23"
        rx="5"
        fill="currentColor"
        opacity="0.34"
      />
      <path
        d="M17 6.5h10a4.5 4.5 0 0 1 4.5 4.5v14.2a4.5 4.5 0 0 1-4.5 4.5H17a4.5 4.5 0 0 1-4.5-4.5V11A4.5 4.5 0 0 1 17 6.5Z"
        fill="currentColor"
      />
      <path
        d="M25.4 6.5v6.2h6.1"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 17.5h8.8M18 21.5h8.8M18 25.5h6.1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.95"
      />
      <circle cx="29.2" cy="28.2" r="3.1" fill="currentColor" opacity="0.18" />
      <path
        d="M29.2 24.5v7.4M25.5 28.2h7.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}