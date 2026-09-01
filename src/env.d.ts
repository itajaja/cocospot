// Values injected by webpack's DefinePlugin at build time.
declare const process: {
  env: {
    NODE_ENV: string;
    SPOTIFY_CLIENT_ID: string;
  };
};
