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
