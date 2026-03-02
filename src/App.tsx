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
            {/* Mobile: album art + Open in Spotify link */}
            <div className="lg:hidden flex-1 min-h-0 flex flex-col items-center justify-center gap-6">
              <img
                src={nowPlaying.coverUrl}
                alt={`${nowPlaying.title} by ${nowPlaying.artist}`}
                className="w-full max-w-sm rounded-xl shadow-lg"
              />
              <div className="text-center">
                <h2 className="text-xl font-extrabold text-white">{nowPlaying.title}</h2>
                <p className="text-zinc-400">{nowPlaying.artist}</p>
              </div>
              <a
                href={`https://open.spotify.com/album/${nowPlaying.spotifyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1DB954] text-white font-bold text-lg hover:bg-[#1ed760] transition-colors"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Open in Spotify
              </a>
            </div>
            {/* Desktop: Spotify embed iframe */}
            <div className="hidden lg:block rounded-xl overflow-hidden flex-1 min-h-0">
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
