import { BASE_PATH } from "../basePath";

// The CocoSpot Spotify app. A PKCE client id is a public identifier, not a
// secret -- it ships in the bundle by design and there is no client secret
// anywhere in this flow. Set SPOTIFY_CLIENT_ID at build time to point a build
// at a different Spotify app.
const DEFAULT_CLIENT_ID = "04300d0084fd4bb0b52b359a65117da5";

export const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || DEFAULT_CLIENT_ID;

// Must match a redirect URI registered on the Spotify app, exactly.
// Production: https://giacomotag.io/cocospot/   Dev: http://127.0.0.1:3456/
export const REDIRECT_URI = `${window.location.origin}${BASE_PATH}`;

export const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

export const ACCOUNTS_BASE = "https://accounts.spotify.com";
export const API_BASE = "https://api.spotify.com/v1";
