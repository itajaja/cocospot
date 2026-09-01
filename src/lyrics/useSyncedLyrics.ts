import { useEffect, useState } from "react";
import { usePlayer } from "../spotify/PlayerProvider";
import { activeLineIndex, type LyricLine } from "./lrc";
import { fetchLyrics } from "./lrclib";

export type LyricsStatus =
  | "idle"
  | "loading"
  | "synced"
  | "unsynced"
  | "instrumental"
  | "unavailable"
  | "error";

export interface SyncedLyrics {
  status: LyricsStatus;
  lines: LyricLine[];
  /** Unsynced lyrics, set only when no timed version exists. */
  plain: string[] | null;
  /** Index into `lines`, or -1 before the first line starts. */
  activeIndex: number;
}

const EMPTY: LyricLine[] = [];

/**
 * Fetch the playing track's lyrics and follow along with playback.
 *
 * The highlight runs off `getPositionMs` on an animation frame rather than the
 * provider's 250ms `positionMs`, and only re-renders when the line changes.
 */
export function useSyncedLyrics(enabled: boolean): SyncedLyrics {
  const { nowPlaying, paused, positionMs, getPositionMs } = usePlayer();
  const [status, setStatus] = useState<LyricsStatus>("idle");
  const [lines, setLines] = useState<LyricLine[]>(EMPTY);
  const [plain, setPlain] = useState<string[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // `nowPlaying` is a fresh object on every state change (including pausing),
  // so depend on the fields that actually identify the track.
  const trackId = nowPlaying?.trackId ?? null;
  const trackName = nowPlaying?.trackName ?? null;
  const artistName = nowPlaying?.artistName ?? null;
  const albumName = nowPlaying?.albumName ?? null;
  const durationMs = nowPlaying?.durationMs ?? 0;

  useEffect(() => {
    if (!enabled || !trackName || !artistName) {
      setStatus("idle");
      setLines(EMPTY);
      setPlain(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setStatus("loading");
    setLines(EMPTY);
    setPlain(null);
    setActiveIndex(-1);

    fetchLyrics(
      { trackId, trackName, artistName, albumName: albumName ?? "", durationMs },
      controller.signal
    )
      .then((record) => {
        if (cancelled) return;
        // Instrumentals are often uploaded as a single empty timed line
        // rather than with the instrumental flag set.
        const hasWords = record.lines.some((line) => line.text.length > 0);
        setLines(hasWords ? record.lines : EMPTY);
        setPlain(record.plain);
        if (hasWords) setStatus("synced");
        else if (record.instrumental || record.lines.length > 0) {
          setStatus("instrumental");
        } else if (record.plain) setStatus("unsynced");
        else setStatus("unavailable");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, trackId, trackName, artistName, albumName, durationMs]);

  // While playing, the position ref is the source of truth; while paused, a
  // seek only shows up through `positionMs`.
  const pausedPosition = paused ? positionMs : -1;

  useEffect(() => {
    if (!enabled || lines.length === 0) return;

    const sync = () => {
      const next = activeLineIndex(lines, getPositionMs());
      setActiveIndex((prev) => (prev === next ? prev : next));
    };

    sync();
    if (paused) return;

    let frame = requestAnimationFrame(function tick() {
      sync();
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [enabled, lines, paused, pausedPosition, getPositionMs]);

  return { status, lines, plain, activeIndex };
}
