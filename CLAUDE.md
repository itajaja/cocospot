# CocoSpot

Kid-friendly album-driven Spotify player. No backend. Albums are defined in a JSON file; audio plays through the Spotify Web Playback SDK inside a custom player (no Spotify embed iframe).

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- Webpack + SWC (not Vite — esbuild is unavailable on this machine)
- React Router v7

## Commands

- `npm run dev` — start dev server (http://127.0.0.1:3456)
- `npm run build` — production build to `dist/`
- `npm run typecheck` — `tsc --noEmit`

The Spotify client id is committed in `src/spotify/config.ts`; setting
`SPOTIFY_CLIENT_ID` in the environment overrides it for a build.

## Project Structure

- `src/albums.json` — album data (id, title, artist, spotifyId, coverUrl)
- `src/albums.ts` — typed accessors over the JSON
- `src/basePath.ts` — `/cocospot/` in prod, `/` in dev (shared by router, SW, redirect URI)
- `src/components/AlbumGrid.tsx` — home screen grid of album cards
- `src/components/AlbumCard.tsx` — single album tile; tapping starts the album
- `src/components/AlbumView.tsx` — album detail with cover art, player, fullscreen toggle
- `src/components/Player.tsx` — transport controls, progress, volume
- `src/components/Lyrics.tsx` — follow-along lyrics panel, toggled from `AlbumView`
- `src/lyrics/` — LRC parsing, the LRCLIB client with its cache, and the sync hook
- `src/components/NowPlayingBar.tsx` — mini player pinned to the grid
- `src/components/Connect.tsx` — sign-in screen
- `src/spotify/` — auth (PKCE), Web API wrapper, and the Web Playback SDK provider
- `src/App.tsx` — auth gating + routing (`/` grid, `/album/:id` detail)

## Adding Albums

Add entries to `src/albums.json`. Each album needs:
- `id`: URL-friendly slug
- `title`: display name
- `artist`: artist name
- `spotifyId`: Spotify album ID (from `open.spotify.com/album/{ID}`)
- `coverUrl`: album art URL (`https://i.scdn.co/image/ab67616d0000b273{hash}`)

To find cover URLs, use the Spotify oEmbed API:
```
curl -s "https://open.spotify.com/oembed?url=https://open.spotify.com/album/{ALBUM_ID}" | python3 -c "import sys,json; print(json.load(sys.stdin)['thumbnail_url'])"
```
Then replace `ab67616d00001e02` with `ab67616d0000b273` for the 640x640 version.

## Lyrics

- Spotify's Web API has **no lyrics endpoint**; the in-app lyrics come from an
  internal endpoint that needs the `sp_dc` web cookie. Lyrics here come from
  [LRCLIB](https://lrclib.net) instead: keyless, CORS-enabled, line-level LRC.
- Lookup is `/api/get` with track, artist, album and duration, falling back to
  `/api/search` (retried with edition noise like "- Remastered 2012" stripped).
  Candidates are scored by duration, since single edits and live versions share
  a title with the album cut.
- Results are cached in `localStorage` under `cocospot:lyrics:v1:{trackId}`.
  Misses are cached too, with a one-week retry window, and `public/sw.js` skips
  `lrclib.net` so the service worker cannot pin a miss for longer than that.
- Highlighting reads `getPositionMs()` from `PlayerProvider` on an animation
  frame and re-renders only when the line changes. The interpolated clock is
  resynced against `player.getCurrentState()` every 5s, because wall-clock drift
  shows up in lyrics long before it would show up in a progress bar.
- Tracks with only unsynced lyrics render without highlighting; instrumentals
  (flagged, or uploaded as a single blank timed line) say so.

## GitHub Pages Deployment

- `npm run deploy` — builds and deploys `dist/` to `gh-pages` branch
- Served at `https://giacomotag.io/cocospot/`
- The app runs under a subpath (`/cocospot/`), so all path references must be conditional on build mode:
  - **Webpack `publicPath`**: `/cocospot/` in prod, `/` in dev (via `argv.mode` in webpack config function)
  - **React Router `basename`**: must match (`process.env.NODE_ENV`)
  - **`index.html` asset paths** (manifest, icons): use `templateParameters` in HtmlWebpackPlugin — do NOT use `htmlWebpackPlugin.options.publicPath` in templates, it resolves to `"auto"` instead of the configured value
  - **`manifest.json`** (`start_url`, icon `src`): static files in `public/` are copied as-is by CopyPublicPlugin, so the plugin rewrites manifest paths at copy time
  - **Service worker registration path**: also needs the base path prefix

## Spotify Playback Notes

- Auth is **Authorization Code with PKCE**, run entirely in the browser. No
  client secret exists; the client id is public by design, committed as the
  default in `src/spotify/config.ts`, and overridable at build time via
  webpack's `DefinePlugin` from `SPOTIFY_CLIENT_ID`.
- Redirect URIs must be registered on the Spotify app *exactly*:
  `https://giacomotag.io/cocospot/` and `http://127.0.0.1:3456/`. Spotify no
  longer accepts the hostname `localhost` for loopback, which is why the dev
  server binds to `127.0.0.1`.
- Scopes: `streaming`, `user-read-email`, `user-read-private`,
  `user-read-playback-state`, `user-modify-playback-state`.
- Tokens are kept in `localStorage` and refreshed ~60s before expiry;
  concurrent refreshes are collapsed because the SDK and the API layer both
  ask for tokens.
- **Premium is required.** A free account surfaces as an `account_error` from
  the SDK, shown in the player as a plain message.
- Development Mode apps created after February 2026 allow only **5 users**,
  each added by email under User Management in the dashboard.
- The SDK is loaded from `https://sdk.scdn.co/spotify-player.js` and must
  never be cached — `public/sw.js` skips it along with all `spotify.com`
  requests.
- Playback starts with `PUT /me/player/play?device_id=...` using a
  `spotify:album:{spotifyId}` context. Everything after that (pause, skip,
  seek, volume) is a local SDK call, so there is no polling.
- On iOS, `player.activateElement()` must run inside the user gesture, so
  `AlbumCard` starts playback in its `onClick` rather than in an effect after
  navigation.
