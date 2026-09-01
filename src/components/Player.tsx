import { useState } from "react";
import type { Album } from "../albums";
import { usePlayer } from "../spotify/PlayerProvider";
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon, VolumeIcon } from "./icons";

function formatTime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Player({ album }: { album: Album }) {
  const {
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
  } = usePlayer();

  // Someone may have started a different album from the grid; only show
  // transport state when the player is actually on this album.
  const isCurrent = currentAlbumId === album.spotifyId;
  const track = isCurrent ? nowPlaying : null;
  const duration = track?.durationMs ?? 0;
  const [scrub, setScrub] = useState<number | null>(null);

  const shownPosition = scrub ?? positionMs;
  const fill = (fraction: number) => ({
    background: `linear-gradient(to right, var(--color-purple-500) ${
      Math.max(0, Math.min(1, fraction)) * 100
    }%, var(--color-zinc-700) 0)`,
  });

  const commitScrub = () => {
    if (scrub === null) return;
    void seek(scrub);
    setScrub(null);
  };

  const onMainButton = () => {
    if (isCurrent) void togglePlay();
    else void playAlbum(album.spotifyId);
  };

  const roundButton =
    "grid place-items-center rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="text-center lg:text-left">
        <p className="text-2xl font-extrabold text-white leading-tight">
          {track ? track.trackName : album.title}
        </p>
        <p className="text-lg text-zinc-400 truncate">
          {track ? track.artistName : album.artist}
        </p>
      </div>

      <div>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={1000}
          value={shownPosition}
          disabled={!track}
          onChange={(e) => setScrub(Number(e.target.value))}
          onPointerUp={commitScrub}
          onKeyUp={commitScrub}
          aria-label="Seek"
          style={fill(duration ? shownPosition / duration : 0)}
          className="h-2 w-full cursor-pointer disabled:cursor-default disabled:opacity-50"
        />
        <div className="flex justify-between text-sm font-semibold text-zinc-500 tabular-nums">
          <span>{formatTime(shownPosition)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => void previous()}
          disabled={!track}
          aria-label="Previous track"
          className={`${roundButton} h-14 w-14 bg-zinc-800 hover:bg-zinc-700`}
        >
          <PreviousIcon className="h-7 w-7" />
        </button>

        <button
          onClick={onMainButton}
          disabled={!ready}
          aria-label={isCurrent && !paused ? "Pause" : "Play"}
          className={`${roundButton} h-24 w-24 bg-purple-500 hover:bg-purple-400 text-zinc-950 shadow-lg shadow-purple-500/20`}
        >
          {isCurrent && !paused ? (
            <PauseIcon className="h-11 w-11" />
          ) : (
            <PlayIcon className="h-11 w-11 translate-x-0.5" />
          )}
        </button>

        <button
          onClick={() => void next()}
          disabled={!track}
          aria-label="Next track"
          className={`${roundButton} h-14 w-14 bg-zinc-800 hover:bg-zinc-700`}
        >
          <NextIcon className="h-7 w-7" />
        </button>
      </div>

      <div className="flex items-center gap-3 text-zinc-500">
        <VolumeIcon className="h-5 w-5 shrink-0" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={volume}
          onChange={(e) => void setVolume(Number(e.target.value))}
          aria-label="Volume"
          style={fill(volume)}
          className="h-2 w-full cursor-pointer"
        />
      </div>

      {!ready && !error && (
        <p className="text-center text-sm font-semibold text-zinc-500">
          Waking up the player&hellip;
        </p>
      )}

      {error && (
        <button
          onClick={dismissError}
          className="rounded-lg bg-red-950 px-3 py-2 text-left text-sm font-semibold text-red-300"
        >
          {error}
        </button>
      )}
    </div>
  );
}
