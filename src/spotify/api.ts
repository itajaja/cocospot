import { API_BASE } from "./config";

export class SpotifyApiError extends Error {
  status: number;
  reason?: string;

  constructor(message: string, status: number, reason?: string) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.reason = reason;
  }
}

export async function spotifyFetch(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as { error?: { message?: string; reason?: string } }) : null;

  if (!res.ok) {
    throw new SpotifyApiError(
      data?.error?.message ?? `Spotify API error ${res.status}`,
      res.status,
      data?.error?.reason
    );
  }
  return data;
}

export interface AlbumTrack {
  id: string | null;
  name: string;
  durationMs: number;
  artistNames: string;
}

interface TracksPage {
  items: {
    id: string | null;
    name: string;
    duration_ms: number;
    artists: { name: string }[];
  }[];
  next: string | null;
}

/**
 * Every track on an album, in playback order. The index of a track here is the
 * `offset.position` that starts the album on it.
 */
export async function getAlbumTracks(
  token: string,
  albumId: string
): Promise<AlbumTrack[]> {
  const tracks: AlbumTrack[] = [];
  // The default page size is 20, and a few albums here run longer than that.
  let path: string | null = `/albums/${albumId}/tracks?limit=50`;

  while (path) {
    const page = (await spotifyFetch(token, path)) as TracksPage;
    for (const item of page.items) {
      tracks.push({
        id: item.id,
        name: item.name,
        durationMs: item.duration_ms,
        artistNames: item.artists.map((artist) => artist.name).join(", "),
      });
    }
    path = page.next ? page.next.replace(API_BASE, "") : null;
  }
  return tracks;
}
