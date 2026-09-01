import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { findAlbum } from "../albums";
import { usePlayer } from "../spotify/PlayerProvider";
import { FullscreenIcon, LyricsIcon } from "./icons";
import Lyrics from "./Lyrics";
import Player from "./Player";

const LYRICS_PREFERENCE_KEY = "cocospot:show-lyrics";

function readLyricsPreference(): boolean {
  try {
    return window.localStorage.getItem(LYRICS_PREFERENCE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function AlbumView() {
  const { id } = useParams<{ id: string }>();
  const album = findAlbum(id);
  const { currentAlbumId } = usePlayer();

  const [showLyrics, setShowLyrics] = useState(readLyricsPreference);

  useEffect(() => {
    try {
      window.localStorage.setItem(LYRICS_PREFERENCE_KEY, showLyrics ? "1" : "0");
    } catch {
      // Storage disabled: the toggle just does not persist.
    }
  }, [showLyrics]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }, []);

  if (!album) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center">
        <p className="mb-4 text-xl text-zinc-400">Album not found</p>
        <Link to="/" className="font-semibold text-purple-400 hover:underline">
          Back to albums
        </Link>
      </div>
    );
  }

  const headerButton =
    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-colors";

  return (
    // Definite height on large screens so the cover can size itself to fit;
    // small screens just scroll.
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-2 px-6 pb-2 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-semibold text-zinc-400 hover:text-white"
        >
          <span className="text-2xl leading-none">&larr;</span>
          Back
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLyrics((shown) => !shown)}
            aria-pressed={showLyrics}
            className={`${headerButton} ${
              showLyrics
                ? "bg-purple-500 text-zinc-950 hover:bg-purple-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <LyricsIcon className="h-4 w-4" />
            Lyrics
          </button>
          <button
            onClick={toggleFullscreen}
            className={`${headerButton} bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white`}
          >
            <FullscreenIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-8 px-6 pb-8 lg:min-h-0 lg:flex-row lg:items-stretch">
        <div
          className={`flex w-full items-center justify-center lg:min-h-0 lg:max-w-none lg:flex-1 ${
            showLyrics ? "" : "max-w-sm"
          }`}
        >
          {showLyrics ? (
            <Lyrics
              playing={currentAlbumId === album.spotifyId}
              className="h-[50dvh] min-h-72 w-full lg:h-full"
            />
          ) : (
            <img
              src={album.coverUrl}
              alt={`${album.title} by ${album.artist}`}
              className="w-full rounded-2xl shadow-2xl lg:h-full lg:w-auto lg:max-w-full lg:object-contain"
            />
          )}
        </div>
        <div className="flex w-full items-center lg:w-[26rem] lg:shrink-0">
          <Player album={album} />
        </div>
      </main>
    </div>
  );
}
