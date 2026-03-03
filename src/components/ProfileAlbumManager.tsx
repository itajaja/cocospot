import { useState } from "react";
import albums from "../albums.json";
import { useProfiles } from "../ProfileContext";

export default function ProfileAlbumManager() {
  const {
    profiles,
    selectedProfileId,
    isAllProfile,
    addAlbumToProfile,
    removeAlbumFromProfile,
  } = useProfiles();
  const [isOpen, setIsOpen] = useState(false);

  if (isAllProfile) return null;

  const profile = profiles.find((p) => p.id === selectedProfileId);
  if (!profile) return null;

  const sortedAlbums = [...albums].sort((a, b) =>
    a.artist.localeCompare(b.artist)
  );

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white text-sm font-semibold transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Manage Albums
        <span className="text-xs text-zinc-500">
          ({profile.albumIds.length}/{albums.length})
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sortedAlbums.map((album) => {
              const isIncluded = profile.albumIds.includes(album.id);
              return (
                <button
                  key={album.id}
                  onClick={() =>
                    isIncluded
                      ? removeAlbumFromProfile(profile.id, album.id)
                      : addAlbumToProfile(profile.id, album.id)
                  }
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                    isIncluded
                      ? "bg-purple-500/20 text-purple-200"
                      : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs ${
                      isIncluded
                        ? "bg-purple-500 border-purple-500 text-white"
                        : "border-zinc-600"
                    }`}
                  >
                    {isIncluded && "✓"}
                  </span>
                  <img
                    src={album.coverUrl}
                    alt=""
                    className="w-6 h-6 rounded flex-shrink-0"
                  />
                  <span className="truncate">
                    {album.artist} — {album.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
