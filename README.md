# CocoSpot

A kid-friendly album browser that plays Spotify audio in its own player -- no Spotify embed, no backend. Built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 19** with TypeScript
- **React Router v7** for client-side routing
- **Tailwind CSS v4** for styling (via PostCSS)
- **Webpack 5** with SWC for fast TypeScript compilation
- **Spotify Web Playback SDK** for audio, driven by a custom player UI
- **Authorization Code with PKCE** for auth, entirely in the browser

## Getting Started

```sh
npm install
npm run dev
```

The dev server starts at **http://127.0.0.1:3456** with hot reload and `historyApiFallback` enabled for client-side routing.

To create a production build:

```sh
npm run build
```

Output goes to `dist/` with content-hashed bundles.

## Project Structure

```
src/
  main.tsx            # App entry point, renders BrowserRouter
  App.tsx             # Route definitions
  index.css           # Tailwind import
  albums.json         # Album data
  albums.ts           # Typed accessors over albums.json
  basePath.ts         # /cocospot/ in production, / in development
  components/
    AlbumGrid.tsx     # Home page - responsive grid of album cards
    AlbumCard.tsx     # Single album tile; tapping it starts the album
    AlbumView.tsx     # Album detail page with the full player
    Player.tsx        # Transport controls, progress, volume
    Lyrics.tsx        # Follow-along lyrics panel (tap a line to jump)
    NowPlayingBar.tsx # Persistent mini player on the grid
    Connect.tsx       # Sign-in screen and setup instructions
    icons.tsx         # Inline SVG icons
  lyrics/
    lrc.ts            # LRC parser and active-line lookup
    lrclib.ts         # LRCLIB client + localStorage cache
    useSyncedLyrics.ts# Fetches lyrics and follows playback
  spotify/
    config.ts         # Client id, redirect URI, scopes
    pkce.ts           # Code verifier / S256 challenge helpers
    auth.ts           # Authorize redirect, token exchange, refresh, storage
    api.ts            # Thin Web API fetch wrapper
    AuthProvider.tsx  # Auth state + access token vending
    PlayerProvider.tsx# Web Playback SDK lifecycle and transport state
    sdk.d.ts          # Typings for the SDK global
```

### Configuration Files

| File                | Purpose                                      |
|---------------------|----------------------------------------------|
| `webpack.config.js` | Bundler config (entry, loaders, dev server)  |
| `tsconfig.json`     | TypeScript options (strict mode, react-jsx)  |
| `postcss.config.js` | PostCSS plugin for Tailwind v4               |
| `index.html`        | HTML template with `#root` mount point       |

## Spotify Setup

The client id of the CocoSpot Spotify app is committed in
`src/spotify/config.ts`, so nothing needs configuring to build or run. A PKCE
client id is a public identifier, not a secret -- it ships in the bundle by
design, and no client secret is used anywhere in this flow.

The Spotify app it points at must have, in
[the dashboard](https://developer.spotify.com/dashboard):

- Both redirect URIs registered **exactly**:
  - `https://giacomotag.io/cocospot/` (production)
  - `http://127.0.0.1:3456/` (development -- Spotify does not accept the
    hostname `localhost`)
- **Web API** and **Web Playback SDK** ticked under "Which API/SDKs are you
  planning to use".
- Every listener added by email under **User Management**.

To build against a different Spotify app, set `SPOTIFY_CLIENT_ID` in the
environment (`SPOTIFY_CLIENT_ID=... npm run dev`), or as a repository variable
of that name for the deploy workflow. It overrides the committed default.

### Requirements and limits

- **Spotify Premium is required** to stream. Mobile-only Premium plans are
  excluded by Spotify.
- Development Mode apps created after February 2026 are limited to **5
  users**, and the app owner must have Premium.
- On iOS, audio only starts from a real user gesture, which is why tapping an
  album card starts playback in the tap itself rather than after navigating.

## Routes

| Path          | Component   | Description                          |
|---------------|-------------|--------------------------------------|
| `/`           | `AlbumGrid` | Responsive grid of all albums        |
| `/album/:id`  | `AlbumView` | Album detail with cover and full player |

## Adding an Album

Albums are stored in `src/albums.json` as a flat array. To add one, append an entry:

```json
{
  "id": "holy-diver",
  "title": "Holy Diver",
  "artist": "Dio",
  "spotifyId": "2ivNJLSx8Rbvnsvcn01Yt3",
  "coverUrl": "https://i.scdn.co/image/ab67616d0000b2732457ab409ae106f8ae1dff89"
}
```

### Field Reference

| Field       | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| `id`        | URL slug used in routing (`/album/:id`). Lowercase, hyphen-separated.       |
| `title`     | Album display name.                                                         |
| `artist`    | Artist or band name.                                                        |
| `spotifyId` | Spotify album ID. Found in any Spotify album URL: `open.spotify.com/album/{spotifyId}` |
| `coverUrl`  | Album cover from Spotify CDN. Use the `ab67616d0000b273` prefix for 640x640 images. |

### Finding Spotify Info

1. Open the album on [Spotify](https://open.spotify.com).
2. The album ID is the last segment of the URL: `https://open.spotify.com/album/2ivNJLSx8Rbvnsvcn01Yt3`
3. For the cover URL, replace the ID in this template:
   `https://i.scdn.co/image/ab67616d0000b273{hash}` -- the hash can be found by inspecting the album page's cover image `src`.

## Architecture Notes

- **No backend.** All data is static JSON bundled at build time, and the PKCE
  auth flow runs entirely in the browser -- there is no server to exchange or
  store tokens.
- **Playback** registers the browser itself as a Spotify Connect device named
  "CocoSpot" via the Web Playback SDK. Starting an album is one Web API call
  (`PUT /me/player/play` with a `spotify:album:` context); play/pause, skip,
  seek and volume are all local SDK calls.
- **Track metadata** (title, artist, artwork, duration) comes from the SDK's
  `player_state_changed` events, so no Web API metadata endpoints are used and
  `albums.json` stays the only content source.
- **Lyrics** come from [LRCLIB](https://lrclib.net), not Spotify -- the Web API
  has no lyrics endpoint. It is keyless and CORS-enabled, so the fetch happens
  in the browser like everything else, and results (including misses) are cached
  in `localStorage`. Highlighting runs off `getPositionMs()`, a ref read of the
  interpolated playback clock, so following along costs one re-render per line
  rather than one per frame.
- **Tokens** live in `localStorage` and refresh silently, so the sign-in
  happens once rather than every visit.
- **Styling** is done through Tailwind utility classes; `index.css` holds only
  what utilities cannot express (range-slider thumbs, the lyrics fade mask).
- **SWC** handles TypeScript/JSX compilation (faster than Babel). Configured in `webpack.config.js` under the `swc-loader` rule with automatic JSX runtime.
- **historyApiFallback** is enabled on the dev server so that direct navigation to `/album/:id` works without a 404. A production deployment needs equivalent configuration (e.g., redirect all paths to `index.html`).
