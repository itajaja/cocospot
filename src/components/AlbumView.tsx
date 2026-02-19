import { useParams, Link } from "react-router-dom";
import albums from "../albums.json";

export default function AlbumView() {
  const { id } = useParams<{ id: string }>();
  const album = albums.find((a) => a.id === id);

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
    <div className="pb-4">
      <div className="rounded-xl bg-zinc-900 overflow-hidden">
        <img
          src={album.coverUrl}
          alt={`${album.title} by ${album.artist}`}
          className="w-full"
        />
        <div className="p-5">
          <h1 className="text-2xl font-extrabold text-white">{album.title}</h1>
          <p className="text-lg text-zinc-400">{album.artist}</p>
        </div>
      </div>
    </div>
  );
}
