export interface LyricLine {
  startMs: number;
  /** Empty for the blank lines LRC uses to mark instrumental gaps. */
  text: string;
}

// [mm:ss], [mm:ss.x], [mm:ss.xx] and [mm:ss.xxx] are all in the wild.
const TIMESTAMP = /\[(\d+):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
// Enhanced LRC puts per-word stamps inside the line; we sync per line only.
const WORD_TIMESTAMP = /<\d+:\d{1,2}(?:[.:]\d{1,3})?>/g;

function toMs(minutes: string, seconds: string, fraction?: string): number {
  const scale = fraction ? [100, 10, 1][fraction.length - 1] : 0;
  return (
    Number(minutes) * 60_000 + Number(seconds) * 1000 + Number(fraction ?? 0) * scale
  );
}

/**
 * Parse an LRC file into time-ordered lines. Metadata tags ([ar:], [by:], ...)
 * do not match the timestamp shape, so they drop out on their own.
 */
export function parseLrc(source: string): LyricLine[] {
  const lines: LyricLine[] = [];

  for (const raw of source.split(/\r?\n/)) {
    TIMESTAMP.lastIndex = 0;
    const stamps: number[] = [];
    let textStart = 0;
    let match: RegExpExecArray | null;

    // One line can carry several stamps ("[00:12.00][01:30.00]chorus"), but
    // only while they run unbroken from the start of the line.
    while ((match = TIMESTAMP.exec(raw)) !== null && match.index === textStart) {
      stamps.push(toMs(match[1], match[2], match[3]));
      textStart = TIMESTAMP.lastIndex;
    }
    if (stamps.length === 0) continue;

    const text = raw.slice(textStart).replace(WORD_TIMESTAMP, "").trim();
    for (const startMs of stamps) lines.push({ startMs, text });
  }

  return lines.sort((a, b) => a.startMs - b.startMs);
}

/** Index of the line that should be highlighted, or -1 before the first one. */
export function activeLineIndex(lines: LyricLine[], positionMs: number): number {
  let low = 0;
  let high = lines.length - 1;
  let found = -1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (lines[mid].startMs <= positionMs) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return found;
}
