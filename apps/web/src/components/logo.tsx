type Tone = "light" | "dark";

/** The AppAmora mark: an upward "A" path with the red dot at its center. */
export function LogoMark({ size = 32, tone = "light" }: { size?: number; tone?: Tone }) {
  const tile = tone === "light" ? "#0E1116" : "#F6F5F1";
  const stroke = tone === "light" ? "#F6F5F1" : "#0E1116";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill={tile} />
      <path d="M9 23 L16 8 L23 23" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="19" r="2.6" fill="#D7381F" />
    </svg>
  );
}

/** Mark + lowercase wordmark. `tone="dark"` is for dark backgrounds. */
export function Logo({ tone = "light", size = 32 }: { tone?: Tone; size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} tone={tone} />
      <span
        className={`font-display text-[22px] font-bold tracking-[-0.02em] ${tone === "light" ? "text-ink" : "text-paper"}`}
      >
        appamora
      </span>
    </span>
  );
}
