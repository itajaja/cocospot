import albums from "../albums.json";
import AlbumCard from "./AlbumCard";

export default function AlbumGrid() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-extrabold text-center text-white mb-6">
        CocoSpot
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...albums].sort((a, b) => a.artist.localeCompare(b.artist)).map((album) => (
          <AlbumCard
            key={album.id}
            id={album.id}
            title={album.title}
            artist={album.artist}
            coverUrl={album.coverUrl}
            spotifyId={album.spotifyId}
          />
        ))}
      </div>
    </div>
  );
}
