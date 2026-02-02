import { useParams, Link } from "react-router-dom";
import { useCallback } from "react";
import albums from "../albums.json";

export default function AlbumView() {
  const { id } = useParams<{ id: string }>();
  const album = albums.find((a) => a.id === id);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  if (!album) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-xl text-zinc-400 mb-4">Album not found</p>
        <Link to="/" className="text-purple-400 font-semibold hover:underline">
          Back to albums
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 font-semibold hover:text-white"
        >
          <span className="text-2xl leading-none">&larr;</span>
          Back
        </Link>
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 font-semibold hover:bg-zinc-700 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          Fullscreen
        </button>
      </div>

      <div className="rounded-xl bg-zinc-900 overflow-hidden">
        <img
          src={album.coverUrl}
          alt={`${album.title} by ${album.artist}`}
          className="w-full aspect-square object-cover"
        />
        <div className="p-5">
          <h1 className="text-2xl font-extrabold text-white">{album.title}</h1>
          <p className="text-lg text-zinc-400 mb-4">{album.artist}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl overflow-hidden">
        <iframe
          src={`https://open.spotify.com/embed/album/${album.spotifyId}?utm_source=generator&theme=0`}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`${album.title} Spotify Player`}
          className="border-0"
        />
      </div>
    </div>
  );
}
