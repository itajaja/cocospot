import { Link } from "react-router-dom";
import type { Album } from "../albums";
import { usePlayer } from "../spotify/PlayerProvider";
import { PlayIcon } from "./icons";

export default function AlbumCard({ album }: { album: Album }) {
  const { playAlbum, currentAlbumId, paused } = usePlayer();
  const isCurrent = currentAlbumId === album.spotifyId;

  return (
    <Link
      to={`/album/${album.id}`}
      // Start playback inside the tap itself: iOS only unlocks audio from a
      // real user gesture, and a navigation would break the chain.
      onClick={() => void playAlbum(album.spotifyId)}
      className="group block overflow-hidden rounded-xl bg-zinc-900 transition-all duration-200 hover:scale-[1.03] hover:bg-zinc-800"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={album.coverUrl}
          alt={`${album.title} by ${album.artist}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <PlayIcon className="h-16 w-16 text-white drop-shadow-lg" />
        </div>
        {isCurrent && !paused && (
          <span className="absolute right-2 top-2 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-extrabold text-zinc-950">
            Playing
          </span>
        )}
      </div>
      <div className="p-2">
        <h2 className="truncate text-base font-bold text-white">{album.title}</h2>
        <p className="truncate text-sm text-zinc-400">{album.artist}</p>
      </div>
    </Link>
  );
}
