import { Link } from "react-router-dom";
import { findAlbumBySpotifyId } from "../albums";
import { usePlayer } from "../spotify/PlayerProvider";
import { NextIcon, PauseIcon, PlayIcon } from "./icons";

export default function NowPlayingBar() {
  const { nowPlaying, currentAlbumId, paused, togglePlay, next } = usePlayer();

  if (!nowPlaying) return null;

  const album = currentAlbumId ? findAlbumBySpotifyId(currentAlbumId) : undefined;
  const cover = album?.coverUrl ?? nowPlaying.coverUrl;

  const details = (
    <>
      {cover && (
        <img
          src={cover}
          alt=""
          className="h-14 w-14 rounded-lg object-cover shrink-0"
        />
      )}
      <div className="min-w-0 text-left">
        <p className="truncate font-bold text-white">{nowPlaying.trackName}</p>
        <p className="truncate text-sm text-zinc-400">{nowPlaying.artistName}</p>
      </div>
    </>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        {album ? (
          <Link to={`/album/${album.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            {details}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">{details}</div>
        )}

        <button
          onClick={() => void togglePlay()}
          aria-label={paused ? "Play" : "Pause"}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-purple-500 text-zinc-950 transition-colors hover:bg-purple-400"
        >
          {paused ? (
            <PlayIcon className="h-7 w-7 translate-x-0.5" />
          ) : (
            <PauseIcon className="h-7 w-7" />
          )}
        </button>
        <button
          onClick={() => void next()}
          aria-label="Next track"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-zinc-800 text-white transition-colors hover:bg-zinc-700"
        >
          <NextIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
