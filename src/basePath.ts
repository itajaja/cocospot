// GitHub Pages serves the app from /cocospot/, the dev server from /.
export const BASE_PATH = process.env.NODE_ENV === "production" ? "/cocospot/" : "/";

// React Router wants the same path without the trailing slash.
export const ROUTER_BASENAME = BASE_PATH.replace(/\/$/, "");
