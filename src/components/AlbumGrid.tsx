import { albums } from "../albums";
import { useAuth } from "../spotify/AuthProvider";
import AlbumCard from "./AlbumCard";
import NowPlayingBar from "./NowPlayingBar";

export default function AlbumGrid() {
  const { logout } = useAuth();
  const sorted = [...albums].sort((a, b) => a.artist.localeCompare(b.artist));

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 pb-28">
        <h1 className="mb-6 text-center text-4xl font-extrabold text-white">CocoSpot</h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <button
            onClick={logout}
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-400"
          >
            Disconnect Spotify
          </button>
        </div>
      </div>
      <NowPlayingBar />
    </>
  );
}
