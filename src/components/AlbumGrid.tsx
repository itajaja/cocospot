import albums from "../albums.json";
import AlbumCard from "./AlbumCard";
import ProfileList from "./ProfileList";
import ProfileAlbumManager from "./ProfileAlbumManager";
import { useProfiles, ALL_PROFILE_ID } from "../ProfileContext";

export default function AlbumGrid() {
  const { profiles, selectedProfileId, isAllProfile, allAlbumIds } =
    useProfiles();

  let visibleAlbums = [...albums];

  if (isAllProfile) {
    // ALL profile: show the union of all albums across profiles.
    // If no profiles exist yet, show everything.
    if (profiles.length > 0 && allAlbumIds.length > 0) {
      visibleAlbums = visibleAlbums.filter((a) => allAlbumIds.includes(a.id));
    }
  } else {
    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (profile) {
      visibleAlbums = visibleAlbums.filter((a) =>
        profile.albumIds.includes(a.id)
      );
    }
  }

  visibleAlbums.sort((a, b) => a.artist.localeCompare(b.artist));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-extrabold text-center text-white mb-6">
        CocoSpot
      </h1>
      <ProfileList />
      <ProfileAlbumManager />
      {visibleAlbums.length === 0 ? (
        <div className="text-center text-zinc-500 py-16">
          <p className="text-lg">No albums in this profile yet.</p>
          {!isAllProfile && (
            <p className="text-sm mt-1">
              Use "Manage Albums" above to add some.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleAlbums.map((album) => (
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
      )}
    </div>
  );
}
