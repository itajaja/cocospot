import { Link } from "react-router-dom";

interface AlbumCardProps {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  spotifyId: string;
}

export default function AlbumCard({ id, title, artist, coverUrl, spotifyId }: AlbumCardProps) {
  const cardContent = (
    <>
      <div className="aspect-square overflow-hidden">
        <img
          src={coverUrl}
          alt={`${title} by ${artist}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2">
        <h2 className="text-base font-bold text-white truncate">{title}</h2>
        <p className="text-sm text-zinc-400 truncate">{artist}</p>
      </div>
    </>
  );

  const cardClass = "group block rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 hover:scale-[1.03] overflow-hidden";

  return (
    <>
      <a
        href={`https://open.spotify.com/album/${spotifyId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`lg:hidden ${cardClass}`}
      >
        {cardContent}
      </a>
      <Link to={`/album/${id}`} className={`hidden lg:block ${cardClass}`}>
        {cardContent}
      </Link>
    </>
  );
}
