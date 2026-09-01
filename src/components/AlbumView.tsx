import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { findAlbum } from "../albums";
import { usePlayer } from "../spotify/PlayerProvider";
import { useAlbumTracks } from "../spotify/useAlbumTracks";
import { FullscreenIcon, LyricsIcon, SongsIcon } from "./icons";
import Lyrics from "./Lyrics";
import Player from "./Player";
import TrackList from "./TrackList";

/** What the artwork column shows. On xl the song list has its own column. */
type Panel = "art" | "songs" | "lyrics";

const PANEL_KEY = "cocospot:panel:v1";

function readPanel(): Panel {
  try {
    const stored = window.localStorage.getItem(PANEL_KEY);
    if (stored === "art" || stored === "songs" || stored === "lyrics") return stored;
    // Carry over the preference from when lyrics were the only panel.
    return window.localStorage.getItem("cocospot:show-lyrics") === "1" ? "lyrics" : "art";
  } catch {
    return "art";
  }
}

export default function AlbumView() {
  const { id } = useParams<{ id: string }>();
  const album = findAlbum(id);
  const { currentAlbumId } = usePlayer();
  // Fetched here, not in TrackList: both the phone panel and the wide-screen
  // column render one, and they should not each ask Spotify for the list.
  const { tracks, status } = useAlbumTracks(album?.spotifyId ?? "");

  const [panel, setPanel] = useState<Panel>(readPanel);

  useEffect(() => {
    try {
      window.localStorage.setItem(PANEL_KEY, panel);
    } catch {
      // Storage disabled: the toggle just does not persist.
    }
  }, [panel]);

  const toggle = useCallback(
    (next: Panel) => setPanel((current) => (current === next ? "art" : next)),
    []
  );

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }, []);

  if (!album) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center">
        <p className="mb-4 text-xl text-zinc-400">Album not found</p>
        <Link to="/" className="font-semibold text-purple-400 hover:underline">
          Back to albums
        </Link>
      </div>
    );
  }

  const headerButton =
    "inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-semibold transition-colors sm:px-3";
  const onHeader = "bg-purple-500 text-zinc-950 hover:bg-purple-400";
  const offHeader = "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white";
  const panelSize = "h-[50dvh] min-h-72 w-full lg:h-full";

  return (
    // Definite height on large screens so the cover can size itself to fit;
    // small screens just scroll.
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-2 px-6 pb-2 pt-4 xl:max-w-7xl">
        <Link
          to="/"
          aria-label="Back to albums"
          className="inline-flex items-center gap-2 font-semibold text-zinc-400 hover:text-white"
        >
          <span className="text-2xl leading-none">&larr;</span>
          {/* Three buttons plus a label do not fit a narrow phone header. */}
          <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => toggle("songs")}
            aria-pressed={panel === "songs"}
            className={`${headerButton} xl:hidden ${panel === "songs" ? onHeader : offHeader}`}
          >
            <SongsIcon className="h-4 w-4" />
            Songs
          </button>
          <button
            onClick={() => toggle("lyrics")}
            aria-pressed={panel === "lyrics"}
            className={`${headerButton} ${panel === "lyrics" ? onHeader : offHeader}`}
          >
            <LyricsIcon className="h-4 w-4" />
            Lyrics
          </button>
          <button
            onClick={toggleFullscreen}
            className={`${headerButton} ${offHeader}`}
          >
            <FullscreenIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-8 px-6 pb-8 lg:min-h-0 lg:flex-row lg:items-stretch xl:max-w-7xl">
        <div
          className={`flex w-full items-center justify-center lg:min-h-0 lg:max-w-none lg:flex-1 ${
            panel === "art" ? "max-w-sm" : ""
          }`}
        >
          {panel === "lyrics" ? (
            <Lyrics playing={currentAlbumId === album.spotifyId} className={panelSize} />
          ) : (
            <>
              {/* The song list has its own column from xl up, so there the
                  artwork stays put and only the toggle disappears. */}
              {panel === "songs" && (
                <TrackList
                  album={album}
                  tracks={tracks}
                  status={status}
                  className={`${panelSize} xl:hidden`}
                />
              )}
              <img
                src={album.coverUrl}
                alt={`${album.title} by ${album.artist}`}
                className={`w-full rounded-2xl shadow-2xl lg:h-full lg:w-auto lg:max-w-full lg:object-contain ${
                  panel === "songs" ? "hidden xl:block" : ""
                }`}
              />
            </>
          )}
        </div>
        <div className="flex w-full items-center lg:w-[26rem] lg:shrink-0">
          <Player album={album} />
        </div>
        <div className="hidden xl:flex xl:w-[20rem] xl:shrink-0 xl:items-stretch">
          <TrackList
            album={album}
            tracks={tracks}
            status={status}
            className="h-full w-full"
          />
        </div>
      </main>
    </div>
  );
}
