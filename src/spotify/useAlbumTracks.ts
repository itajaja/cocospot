import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getAlbumTracks, type AlbumTrack } from "./api";

const CACHE_PREFIX = "cocospot:tracks:v1:";
/** Track lists are static, but an album can be replaced by another edition. */
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface CachedTracks {
  tracks: AlbumTrack[];
  at: number;
}

function readCache(albumId: string): AlbumTrack[] | null {
  if (!albumId) return null;
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${albumId}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedTracks;
    if (Date.now() - entry.at > CACHE_TTL_MS) {
      window.localStorage.removeItem(`${CACHE_PREFIX}${albumId}`);
      return null;
    }
    return entry.tracks;
  } catch {
    return null;
  }
}

function writeCache(albumId: string, tracks: AlbumTrack[]): void {
  try {
    const entry: CachedTracks = { tracks, at: Date.now() };
    window.localStorage.setItem(`${CACHE_PREFIX}${albumId}`, JSON.stringify(entry));
  } catch {
    // Out of quota or storage disabled: run without a cache.
  }
}

export type TracksStatus = "loading" | "ready" | "error";

/** The album's track list, cached so revisiting an album costs no request. */
export function useAlbumTracks(albumId: string): {
  tracks: AlbumTrack[];
  status: TracksStatus;
} {
  const { getAccessToken } = useAuth();
  const [tracks, setTracks] = useState<AlbumTrack[]>(() => readCache(albumId) ?? []);
  const [status, setStatus] = useState<TracksStatus>(() =>
    readCache(albumId) ? "ready" : "loading"
  );

  useEffect(() => {
    // AlbumView calls this before it knows whether the album slug is real.
    if (!albumId) return;

    const cached = readCache(albumId);
    if (cached) {
      setTracks(cached);
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setTracks([]);

    getAccessToken()
      .then((token) => getAlbumTracks(token, albumId))
      .then((fetched) => {
        if (cancelled) return;
        writeCache(albumId, fetched);
        setTracks(fetched);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [albumId, getAccessToken]);

  return { tracks, status };
}
