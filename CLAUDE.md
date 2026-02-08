# CocoSpot

Kid-friendly album-driven Spotify player. No backend, no auth. Albums defined in a JSON file, music plays via Spotify embed iframe.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- Webpack + SWC (not Vite — esbuild is unavailable on this machine)
- React Router v7

## Commands

- `npm run dev` — start dev server (port 3456)
- `npm run build` — production build to `dist/`

## Project Structure

- `src/albums.json` — album data (id, title, artist, spotifyId, coverUrl)
- `src/components/AlbumGrid.tsx` — home screen grid of album cards
- `src/components/AlbumCard.tsx` — single album tile
- `src/components/AlbumView.tsx` — album detail with cover art, Spotify embed, fullscreen toggle
- `src/App.tsx` — routing (`/` grid, `/album/:id` detail)

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

## Spotify Embed Notes

- Full playback requires user to be logged into Spotify Premium in the same browser
- Third-party cookies must be allowed for `spotify.com` — otherwise the embed falls back to 30-second previews
- The `allow="encrypted-media"` attribute on the iframe is required
