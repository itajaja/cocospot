import { useAuth } from "../spotify/AuthProvider";
import { SpotifyIcon } from "./icons";

export default function Connect() {
  const { error, login } = useAuth();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-5xl font-extrabold text-white">CocoSpot</h1>
      <p className="text-lg text-zinc-400">
        Connect a Spotify Premium account once, and the music plays right here.
      </p>
      <button
        onClick={login}
        className="inline-flex items-center gap-3 rounded-full bg-purple-500 px-7 py-4 text-xl font-extrabold text-zinc-950 transition-colors hover:bg-purple-400"
      >
        <SpotifyIcon className="h-7 w-7" />
        Connect Spotify
      </button>
      {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
    </div>
  );
}
