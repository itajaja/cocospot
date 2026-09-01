import { useEffect, useRef } from "react";
import type { Album } from "../albums";
import { usePlayer } from "../spotify/PlayerProvider";
import type { AlbumTrack } from "../spotify/api";
import type { TracksStatus } from "../spotify/useAlbumTracks";
import { PauseIcon, PlayIcon } from "./icons";

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}

export default function TrackList({
  album,
  tracks,
  status,
  className = "",
}: {
  album: Album;
  tracks: AlbumTrack[];
  status: TracksStatus;
  className?: string;
}) {
  const { nowPlaying, currentAlbumId, paused, playAlbum, togglePlay } = usePlayer();

  const onThisAlbum = currentAlbumId === album.spotifyId;

  // Track ids are missing only for local files, which albums never are.
  const currentIndex = onThisAlbum
    ? tracks.findIndex((track) =>
        track.id ? nowPlaying?.trackId === track.id : nowPlaying?.trackName === track.name
      )
    : -1;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (currentIndex < 0) return;
    const scroller = scrollerRef.current;
    const row = rowRefs.current[currentIndex];
    if (!scroller || !row) return;
    // Scroll the panel itself, so the page does not jump on phones.
    scroller.scrollTo({
      top: row.offsetTop - scroller.clientHeight / 2 + row.clientHeight / 2,
      behavior: "smooth",
    });
  }, [currentIndex]);

  const shell = `panel-fade relative overflow-y-auto overscroll-contain rounded-2xl bg-zinc-900/60 ${className}`;

  if (status !== "ready") {
    return (
      <div className={shell}>
        <div className="grid h-full place-items-center px-6 text-center">
          <p className="text-lg font-bold text-zinc-500">
            {status === "loading" ? "Loading songs…" : "Couldn’t load the songs"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollerRef} className={shell}>
      <ol className="space-y-1 p-2">
        {tracks.map((track, index) => {
          const isCurrent = index === currentIndex;

          return (
            <li
              key={track.id ?? `${index}-${track.name}`}
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
            >
              <button
                onClick={() =>
                  // The playing row shows a play/pause icon, so make it do that
                  // rather than restart the song.
                  isCurrent ? void togglePlay() : void playAlbum(album.spotifyId, index)
                }
                aria-current={isCurrent ? "true" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  isCurrent ? "bg-zinc-800 text-purple-400" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <span className="grid w-6 shrink-0 place-items-center text-sm font-bold tabular-nums text-zinc-500">
                  {isCurrent ? (
                    paused ? (
                      <PlayIcon className="h-4 w-4 text-purple-400" />
                    ) : (
                      <PauseIcon className="h-4 w-4 text-purple-400" />
                    )
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate font-bold ${
                    isCurrent ? "text-purple-400" : "text-white"
                  }`}
                >
                  {track.name}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-500">
                  {formatDuration(track.durationMs)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
