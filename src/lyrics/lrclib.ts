import { parseLrc, type LyricLine } from "./lrc";

const API_BASE = "https://lrclib.net/api";
const CACHE_PREFIX = "cocospot:lyrics:v1:";
/** Misses are cached too, so a track without lyrics is not re-fetched on replay. */
const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
/** Live and single edits share a title with the album cut; length tells them apart. */
const DURATION_TOLERANCE_S = 12;

export interface LyricsQuery {
  trackId: string | null;
  trackName: string;
  artistName: string;
  albumName: string;
  durationMs: number;
}

export interface LyricsRecord {
  /** Time-synced lines. Empty when only unsynced lyrics were found. */
  lines: LyricLine[];
  /** Unsynced fallback, shown without highlighting. */
  plain: string[] | null;
  instrumental: boolean;
}

interface LrclibTrack {
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
}

interface CachedLyrics {
  synced: string | null;
  plain: string | null;
  instrumental: boolean;
  at: number;
}

/**
 * Spotify titles carry edition noise ("Smoke on the Water - Remastered 2012")
 * that LRCLIB's catalogue usually does not.
 */
function simplifyTrackName(name: string): string {
  return name
    .replace(/\s*[-–]\s*(\d{4}\s+)?(remaster|remastered|mono|stereo|live|radio|single|album)\b.*$/i, "")
    .replace(/\s*[([](?:[^)\]]*\b(?:remaster|remastered|mono|stereo|live|version|edit|mix)\b[^)\]]*)[)\]]/gi, "")
    .replace(/\s*[([]feat\.[^)\]]*[)\]]/gi, "")
    .trim();
}

function cacheKey(query: LyricsQuery): string {
  const id =
    query.trackId ??
    `${query.trackName}|${query.artistName}|${Math.round(query.durationMs / 1000)}`;
  return `${CACHE_PREFIX}${id}`;
}

function readCache(key: string): CachedLyrics | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedLyrics;
    const isMiss = !entry.synced && !entry.plain && !entry.instrumental;
    if (isMiss && Date.now() - entry.at > MISS_TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeCache(key: string, entry: CachedLyrics): void {
  const store = () => window.localStorage.setItem(key, JSON.stringify(entry));
  try {
    store();
  } catch {
    // Out of quota: drop every cached lyric and keep this one.
    try {
      for (const existing of Object.keys(window.localStorage)) {
        if (existing.startsWith(CACHE_PREFIX)) window.localStorage.removeItem(existing);
      }
      store();
    } catch {
      // Private mode with storage disabled: run without a cache.
    }
  }
}

function toRecord(entry: CachedLyrics): LyricsRecord {
  const lines = entry.synced ? parseLrc(entry.synced) : [];
  return {
    lines,
    plain:
      lines.length === 0 && entry.plain
        ? entry.plain.split(/\r?\n/).map((line) => line.trim())
        : null,
    instrumental: entry.instrumental,
  };
}

async function request(path: string, signal?: AbortSignal): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`LRCLIB responded ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

function pickBestMatch(results: LrclibTrack[], durationMs: number): LrclibTrack | null {
  const targetS = durationMs / 1000;
  let best: LrclibTrack | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of results) {
    if (!candidate.syncedLyrics && !candidate.plainLyrics && !candidate.instrumental) {
      continue;
    }
    const gap = Math.abs((candidate.duration ?? 0) - targetS);
    if (gap > DURATION_TOLERANCE_S) continue;
    // Synced always beats unsynced; length decides between equals.
    const score = gap + (candidate.syncedLyrics ? 0 : 1000);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

async function search(
  trackName: string,
  artistName: string,
  durationMs: number,
  signal?: AbortSignal
): Promise<LrclibTrack | null> {
  const params = new URLSearchParams({ track_name: trackName, artist_name: artistName });
  const results = (await request(`/search?${params}`, signal)) as LrclibTrack[] | null;
  if (!Array.isArray(results) || results.length === 0) return null;
  return pickBestMatch(results, durationMs);
}

/**
 * Look up lyrics for the playing track, preferring the exact-match endpoint and
 * falling back to search when Spotify's title does not line up with LRCLIB's.
 * Results (including misses) are cached in localStorage.
 */
export async function fetchLyrics(
  query: LyricsQuery,
  signal?: AbortSignal
): Promise<LyricsRecord> {
  const key = cacheKey(query);
  const cached = readCache(key);
  if (cached) return toRecord(cached);

  const simplified = simplifyTrackName(query.trackName);
  const params = new URLSearchParams({
    track_name: query.trackName,
    artist_name: query.artistName,
    album_name: query.albumName,
    duration: String(Math.round(query.durationMs / 1000)),
  });

  let track = (await request(`/get?${params}`, signal)) as LrclibTrack | null;
  if (!track) {
    track = await search(query.trackName, query.artistName, query.durationMs, signal);
  }
  if (!track && simplified && simplified !== query.trackName) {
    track = await search(simplified, query.artistName, query.durationMs, signal);
  }

  const entry: CachedLyrics = {
    synced: track?.syncedLyrics?.trim() ? track.syncedLyrics : null,
    plain: track?.plainLyrics?.trim() ? track.plainLyrics : null,
    instrumental: track?.instrumental === true,
    at: Date.now(),
  };
  writeCache(key, entry);
  return toRecord(entry);
}
