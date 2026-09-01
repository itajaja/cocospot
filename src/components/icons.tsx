interface IconProps {
  className?: string;
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

export function PauseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="6" y="4" width="4.5" height="16" rx="1.5" />
      <rect x="13.5" y="4" width="4.5" height="16" rx="1.5" />
    </svg>
  );
}

export function NextIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5 5.5v13a1 1 0 0 0 1.55.83L16 13.2v5.3a1 1 0 0 0 2 0v-13a1 1 0 0 0-2 0v5.3L6.55 4.67A1 1 0 0 0 5 5.5Z" />
    </svg>
  );
}

export function PreviousIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 5.5v13a1 1 0 0 1-1.55.83L8 13.2v5.3a1 1 0 0 1-2 0v-13a1 1 0 0 1 2 0v5.3l9.45-6.13A1 1 0 0 1 19 5.5Z" />
    </svg>
  );
}

export function VolumeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11 4.5 6.5 8H3.8a.8.8 0 0 0-.8.8v6.4c0 .44.36.8.8.8h2.7L11 19.5a.75.75 0 0 0 1.25-.56V5.06A.75.75 0 0 0 11 4.5Zm4.4 3.2a1 1 0 0 0-.3 1.98A3.2 3.2 0 0 1 17 12a3.2 3.2 0 0 1-1.9 2.32 1 1 0 1 0 .8 1.83A5.2 5.2 0 0 0 19 12a5.2 5.2 0 0 0-3.1-4.15 1 1 0 0 0-.5-.15Z" />
    </svg>
  );
}

export function FullscreenIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export function LyricsIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h10M3 11h7M3 16h9" />
      <path d="M20 4.5v7.7" />
      <circle cx="18" cy="12.5" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpotifyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.32a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.57-1.04 8.5-.59 11.66 1.34.35.22.46.68.25 1.03Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.99-8.15-2.56-11.97-1.4a.94.94 0 1 1-.54-1.8c4.36-1.32 9.78-.68 13.49 1.6.44.27.58.85.31 1.29Zm.13-3.4C15.23 8.35 8.9 8.14 5.2 9.26a1.12 1.12 0 1 1-.65-2.15C8.8 5.82 15.79 6.07 20.2 8.69a1.12 1.12 0 1 1-1.14 1.93Z" />
    </svg>
  );
}
