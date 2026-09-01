import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import { SpotifyApiError, spotifyFetch } from "./api";

const SDK_URL = "https://sdk.scdn.co/spotify-player.js";

let sdkPromise: Promise<typeof Spotify> | null = null;

function loadSdk(): Promise<typeof Spotify> {
  if (window.Spotify) return Promise.resolve(window.Spotify);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (window.Spotify) resolve(window.Spotify);
      else reject(new Error("Spotify player script loaded but did not initialise"));
    };
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () =>
      reject(new Error("Could not load the Spotify player. Check your connection."));
    document.body.appendChild(script);
  });
  return sdkPromise;
}

export interface NowPlaying {
  trackName: string;
  artistName: string;
  albumName: string;
  coverUrl: string | null;
  durationMs: number;
}

interface PlayerContextValue {
  /** True once the browser is registered as a Spotify Connect device. */
  ready: boolean;
  error: string | null;
  dismissError: () => void;
  nowPlaying: NowPlaying | null;
  /** Spotify album id loaded in the player, so views can tell if they own it. */
  currentAlbumId: string | null;
  paused: boolean;
  positionMs: number;
  volume: number;
  playAlbum: (spotifyId: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function albumIdFromUri(uri: string | null | undefined): string | null {
  if (!uri) return null;
  const match = uri.match(/^spotify:album:(.+)$/);
  return match ? match[1] : null;
}

function describeApiError(e: unknown): string {
  if (e instanceof SpotifyApiError) {
    if (e.status === 403) {
      return e.reason === "PREMIUM_REQUIRED"
        ? "Spotify Premium is required to play music here."
        : `Spotify refused playback: ${e.message}`;
    }
    if (e.status === 401) return "Spotify sign-in expired. Please connect again.";
    if (e.status === 429) return "Spotify is rate limiting us. Try again in a moment.";
    return e.message;
  }
  return e instanceof Error ? e.message : String(e);
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { status, getAccessToken, logout } = useAuth();

  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  // Position only arrives on state changes, so interpolate between them.
  const positionRef = useRef({ positionMs: 0, at: Date.now() });

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [paused, setPaused] = useState(true);
  const [positionMs, setPositionMs] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  useEffect(() => {
    if (status !== "logged-in") return;

    let cancelled = false;
    let player: Spotify.Player | null = null;

    loadSdk()
      .then((sdk) => {
        if (cancelled) return;

        player = new sdk.Player({
          name: "CocoSpot",
          volume: 0.8,
          getOAuthToken: (cb) => {
            getAccessToken()
              .then(cb)
              .catch(() => setError("Spotify sign-in expired. Please connect again."));
          },
        });

        player.addListener("ready", ({ device_id }) => {
          deviceIdRef.current = device_id;
          setReady(true);
        });
        player.addListener("not_ready", () => {
          deviceIdRef.current = null;
          setReady(false);
        });
        player.addListener("player_state_changed", (state) => {
          if (!state) {
            // Playback moved to another Spotify device.
            setNowPlaying(null);
            setCurrentAlbumId(null);
            setPaused(true);
            return;
          }
          const track = state.track_window.current_track;
          setNowPlaying({
            trackName: track.name,
            artistName: track.artists.map((a) => a.name).join(", "),
            albumName: track.album.name,
            coverUrl: track.album.images[0]?.url ?? null,
            durationMs: state.duration || track.duration_ms,
          });
          setCurrentAlbumId(
            albumIdFromUri(state.context.uri) ?? albumIdFromUri(track.album.uri)
          );
          setPaused(state.paused);
          positionRef.current = { positionMs: state.position, at: Date.now() };
          setPositionMs(state.position);
        });
        player.addListener("initialization_error", ({ message }) =>
          setError(`This browser can't play Spotify audio: ${message}`)
        );
        player.addListener("account_error", () =>
          setError("Spotify Premium is required to play music here.")
        );
        player.addListener("playback_error", ({ message }) =>
          setError(`Playback problem: ${message}`)
        );
        player.addListener("authentication_error", () => {
          logout();
          setError("Spotify sign-in expired. Please connect again.");
        });

        playerRef.current = player;
        return player.connect();
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
      player?.disconnect();
      playerRef.current = null;
      deviceIdRef.current = null;
      setReady(false);
      setNowPlaying(null);
      setCurrentAlbumId(null);
    };
  }, [status, getAccessToken, logout]);

  useEffect(() => {
    if (paused || !nowPlaying) return;
    const id = window.setInterval(() => {
      const { positionMs: base, at } = positionRef.current;
      setPositionMs(Math.min(base + (Date.now() - at), nowPlaying.durationMs));
    }, 250);
    return () => window.clearInterval(id);
  }, [paused, nowPlaying]);

  const waitForDevice = useCallback(async (timeoutMs = 15_000) => {
    const start = Date.now();
    while (!deviceIdRef.current) {
      if (Date.now() - start > timeoutMs) {
        throw new Error("The Spotify player did not start up. Try reloading.");
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return deviceIdRef.current;
  }, []);

  const playAlbum = useCallback(
    async (spotifyId: string) => {
      setError(null);
      try {
        // iOS will not produce sound unless the audio element is unlocked
        // inside the tap that started playback.
        await playerRef.current?.activateElement().catch(() => undefined);

        const body = JSON.stringify({
          context_uri: `spotify:album:${spotifyId}`,
          offset: { position: 0 },
          position_ms: 0,
        });

        const send = async () => {
          const deviceId = await waitForDevice();
          const token = await getAccessToken();
          await spotifyFetch(token, `/me/player/play?device_id=${deviceId}`, {
            method: "PUT",
            body,
          });
        };

        try {
          await send();
        } catch (e) {
          // 404 means Spotify hasn't registered the device yet -- one retry.
          if (e instanceof SpotifyApiError && e.status === 404) {
            await new Promise((resolve) => setTimeout(resolve, 750));
            await send();
          } else {
            throw e;
          }
        }
      } catch (e) {
        setError(describeApiError(e));
      }
    },
    [getAccessToken, waitForDevice]
  );

  const guard = useCallback(async (action: (p: Spotify.Player) => Promise<void>) => {
    const player = playerRef.current;
    if (!player) return;
    try {
      await action(player);
    } catch (e) {
      setError(describeApiError(e));
    }
  }, []);

  const togglePlay = useCallback(
    () =>
      guard(async (p) => {
        await p.activateElement().catch(() => undefined);
        await p.togglePlay();
      }),
    [guard]
  );
  const next = useCallback(() => guard((p) => p.nextTrack()), [guard]);
  const previous = useCallback(() => guard((p) => p.previousTrack()), [guard]);
  const seek = useCallback(
    (ms: number) =>
      guard(async (p) => {
        await p.seek(ms);
        positionRef.current = { positionMs: ms, at: Date.now() };
        setPositionMs(ms);
      }),
    [guard]
  );
  const setVolume = useCallback(
    (value: number) =>
      guard(async (p) => {
        await p.setVolume(value);
        setVolumeState(value);
      }),
    [guard]
  );
  const dismissError = useCallback(() => setError(null), []);

  return (
    <PlayerContext.Provider
      value={{
        ready,
        error,
        dismissError,
        nowPlaying,
        currentAlbumId,
        paused,
        positionMs,
        volume,
        playAlbum,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside PlayerProvider");
  return value;
}
