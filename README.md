# CocoSpot

A music album browser with Spotify playback integration. Built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 19** with TypeScript
- **React Router v7** for client-side routing
- **Tailwind CSS v4** for styling (via PostCSS)
- **Webpack 5** with SWC for fast TypeScript compilation
- **Spotify Embed API** for album playback

## Getting Started

```sh
npm install
npm run dev
```

The dev server starts at **http://localhost:3456** with hot reload and `historyApiFallback` enabled for client-side routing.

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
  components/
    AlbumGrid.tsx     # Home page - responsive grid of album cards
    AlbumCard.tsx     # Single album tile (cover + title + artist)
    AlbumView.tsx     # Album detail page with Spotify player
```

### Configuration Files

| File                | Purpose                                      |
|---------------------|----------------------------------------------|
| `webpack.config.js` | Bundler config (entry, loaders, dev server)  |
| `tsconfig.json`     | TypeScript options (strict mode, react-jsx)  |
| `postcss.config.js` | PostCSS plugin for Tailwind v4               |
| `index.html`        | HTML template with `#root` mount point       |

## Routes

| Path          | Component   | Description                          |
|---------------|-------------|--------------------------------------|
| `/`           | `AlbumGrid` | Responsive grid of all albums        |
| `/album/:id`  | `AlbumView` | Album detail with cover and Spotify player |

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

- **No backend.** All data is static JSON bundled at build time.
- **Spotify embed** uses the `/embed/album/{spotifyId}` iframe with `theme=0` (dark mode).
- **Styling** is done entirely through Tailwind utility classes -- there is no custom CSS beyond the Tailwind import.
- **SWC** handles TypeScript/JSX compilation (faster than Babel). Configured in `webpack.config.js` under the `swc-loader` rule with automatic JSX runtime.
- **historyApiFallback** is enabled on the dev server so that direct navigation to `/album/:id` works without a 404. A production deployment needs equivalent configuration (e.g., redirect all paths to `index.html`).
