// Minimal typings for the Spotify Web Playback SDK global, which is loaded
// from https://sdk.scdn.co/spotify-player.js at runtime.
declare namespace Spotify {
  interface Image {
    url: string;
    height?: number | null;
    width?: number | null;
  }

  interface Artist {
    name: string;
    uri: string;
  }

  interface Album {
    name: string;
    uri: string;
    images: Image[];
  }

  interface Track {
    id: string | null;
    uri: string;
    name: string;
    duration_ms: number;
    artists: Artist[];
    album: Album;
  }

  interface PlaybackState {
    paused: boolean;
    position: number;
    duration: number;
    context: { uri: string | null };
    track_window: { current_track: Track };
  }

  interface PlayerError {
    message: string;
  }

  type ErrorEvent =
    | "initialization_error"
    | "authentication_error"
    | "account_error"
    | "playback_error";

  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    activateElement(): Promise<void>;
    getCurrentState(): Promise<PlaybackState | null>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    addListener(
      event: "ready" | "not_ready",
      cb: (device: { device_id: string }) => void
    ): boolean;
    addListener(
      event: "player_state_changed",
      cb: (state: PlaybackState | null) => void
    ): boolean;
    addListener(event: ErrorEvent, cb: (error: PlayerError) => void): boolean;
    removeListener(event: string): boolean;
  }

  interface PlayerInit {
    name: string;
    getOAuthToken(cb: (token: string) => void): void;
    volume?: number;
  }

  const Player: { new (init: PlayerInit): Player };
}

interface Window {
  Spotify?: typeof Spotify;
  onSpotifyWebPlaybackSDKReady?: () => void;
}
