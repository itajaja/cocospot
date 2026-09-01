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

Both `dev` and `build` read `SPOTIFY_CLIENT_ID` from the environment; without
it the app renders setup instructions instead of the album grid.

## Project Structure

- `src/albums.json` — album data (id, title, artist, spotifyId, coverUrl)
- `src/albums.ts` — typed accessors over the JSON
- `src/basePath.ts` — `/cocospot/` in prod, `/` in dev (shared by router, SW, redirect URI)
- `src/components/AlbumGrid.tsx` — home screen grid of album cards
- `src/components/AlbumCard.tsx` — single album tile; tapping starts the album
- `src/components/AlbumView.tsx` — album detail with cover art, player, fullscreen toggle
- `src/components/Player.tsx` — transport controls, progress, volume
- `src/components/NowPlayingBar.tsx` — mini player pinned to the grid
- `src/components/Connect.tsx` — sign-in screen / setup instructions
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
  client secret exists; the client id is public by design and is injected by
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
