import { Routes, Route, useLocation, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import AlbumGrid from "./components/AlbumGrid";
import AlbumView from "./components/AlbumView";
import albums from "./albums.json";

export default function App() {
  const location = useLocation();
  const albumMatch = location.pathname.match(/^\/album\/(.+)$/);
  const currentAlbumId = albumMatch?.[1] ?? null;
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentAlbumId) {
      setNowPlayingId(currentAlbumId);
    }
  }, [currentAlbumId]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const nowPlaying = nowPlayingId
    ? albums.find((a) => a.id === nowPlayingId)
    : null;

  return (
    <div className={currentAlbumId ? "h-screen bg-zinc-950 text-white overflow-hidden flex flex-col" : "min-h-screen bg-zinc-950 text-white"}>
      {currentAlbumId && (
        <div className="shrink-0 max-w-7xl w-full mx-auto px-6 pt-4 pb-2 flex items-center justify-between">
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
      )}
      <div className={currentAlbumId ? "flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 flex gap-6" : ""}>
        <div className={currentAlbumId ? "hidden lg:block w-2/3 h-full overflow-hidden" : ""}>
          <Routes>
            <Route path="/" element={<AlbumGrid />} />
            <Route path="/album/:id" element={<AlbumView />} />
          </Routes>
        </div>
        {nowPlaying && (
          <div
            className={
              currentAlbumId
                ? "w-full lg:w-1/3 h-full pb-4 flex flex-col"
                : "fixed -left-[9999px] w-[800px]"
            }
          >
            <div className="rounded-xl overflow-hidden flex-1 min-h-0">
              <iframe
                key={nowPlaying.spotifyId}
                src={`https://open.spotify.com/embed/album/${nowPlaying.spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="100%"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`${nowPlaying.title} Spotify Player`}
                className="border-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
