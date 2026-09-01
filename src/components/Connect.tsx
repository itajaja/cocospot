import { useAuth } from "../spotify/AuthProvider";
import { REDIRECT_URI } from "../spotify/config";
import { SpotifyIcon } from "./icons";

export default function Connect() {
  const { status, error, login } = useAuth();

  if (status === "unconfigured") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-6 text-zinc-300">
        <h1 className="text-3xl font-extrabold text-white">CocoSpot needs setting up</h1>
        <p>
          No Spotify client id was built into this app. Create an app at{" "}
          <a
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-purple-400 hover:underline"
          >
            developer.spotify.com/dashboard
          </a>
          , add <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm">{REDIRECT_URI}</code>{" "}
          as a redirect URI, then rebuild with{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm">SPOTIFY_CLIENT_ID</code> set.
        </p>
        <p className="text-sm text-zinc-500">See the README for the full walkthrough.</p>
      </div>
    );
  }

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
