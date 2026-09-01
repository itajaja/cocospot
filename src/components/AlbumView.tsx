import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { findAlbum } from "../albums";
import { FullscreenIcon } from "./icons";
import Player from "./Player";

export default function AlbumView() {
  const { id } = useParams<{ id: string }>();
  const album = findAlbum(id);

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

  return (
    // Definite height on large screens so the cover can size itself to fit;
    // small screens just scroll.
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 pb-2 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-semibold text-zinc-400 hover:text-white"
        >
          <span className="text-2xl leading-none">&larr;</span>
          Back
        </Link>
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 font-semibold text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          <FullscreenIcon className="h-4 w-4" />
          Fullscreen
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-8 px-6 pb-8 lg:min-h-0 lg:flex-row lg:items-stretch">
        <div className="flex w-full max-w-sm items-center justify-center lg:min-h-0 lg:max-w-none lg:flex-1">
          <img
            src={album.coverUrl}
            alt={`${album.title} by ${album.artist}`}
            className="w-full rounded-2xl shadow-2xl lg:h-full lg:w-auto lg:max-w-full lg:object-contain"
          />
        </div>
        <div className="flex w-full items-center lg:w-[26rem] lg:shrink-0">
          <Player album={album} />
        </div>
      </main>
    </div>
  );
}
