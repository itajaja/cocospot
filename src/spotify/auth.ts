import { ACCOUNTS_BASE, CLIENT_ID, REDIRECT_URI, SCOPES } from "./config";
import { codeChallenge, randomString } from "./pkce";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds at which accessToken stops working. */
  expiresAt: number;
}

const TOKEN_KEY = "cocospot.spotify.tokens";
const VERIFIER_KEY = "cocospot.spotify.verifier";
const STATE_KEY = "cocospot.spotify.state";
const RETURN_KEY = "cocospot.spotify.return";

// localStorage rather than sessionStorage: an installed PWA can hand the
// authorize step to a separate browser context and lose the session store.
function stash(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing with storage disabled -- login simply won't persist.
  }
}

function unstash(key: string): string | null {
  try {
    const value = localStorage.getItem(key);
    localStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
}

export function loadTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Tokens>;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.expiresAt) {
      return null;
    }
    return parsed as Tokens;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: Tokens) {
  stash(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

async function requestTokens(
  body: Record<string, string>,
  previousRefreshToken?: string
): Promise<Tokens> {
  const res = await fetch(`${ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const data = (await res.json()) as TokenResponse & {
    error?: string;
    error_description?: string;
  };
  if (!res.ok) {
    throw new Error(
      data.error_description ?? data.error ?? `Spotify token request failed (${res.status})`
    );
  }
  return {
    accessToken: data.access_token,
    // Spotify rotates refresh tokens on PKCE refreshes, but does not always
    // return a new one -- keep the old one when it doesn't.
    refreshToken: data.refresh_token ?? previousRefreshToken ?? "",
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/** Sends the browser to Spotify's consent screen. Never returns. */
export async function beginLogin(returnPath: string): Promise<void> {
  const verifier = randomString(96);
  const state = randomString(16);
  stash(VERIFIER_KEY, verifier);
  stash(STATE_KEY, state);
  stash(RETURN_KEY, returnPath);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: await codeChallenge(verifier),
    state,
    scope: SCOPES,
  });
  window.location.assign(`${ACCOUNTS_BASE}/authorize?${params}`);
}

export interface RedirectResult {
  tokens?: Tokens;
  returnPath: string | null;
  error?: string;
}

let redirectPromise: Promise<RedirectResult | null> | null = null;

/**
 * Completes the PKCE exchange if the current URL is an auth redirect.
 * Returns null when there is nothing to complete.
 *
 * The result is memoised: an authorization code is single-use, and React's
 * StrictMode runs the effect that calls this twice.
 */
export function consumeRedirect(): Promise<RedirectResult | null> {
  redirectPromise ??= exchangeRedirect();
  return redirectPromise;
}

async function exchangeRedirect(): Promise<RedirectResult | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const error = params.get("error");
  if (!code && !error) return null;

  const expectedState = unstash(STATE_KEY);
  const verifier = unstash(VERIFIER_KEY);
  const returnPath = unstash(RETURN_KEY);

  // Strip the auth parameters so a reload doesn't replay a spent code.
  window.history.replaceState({}, "", window.location.pathname);

  if (error) {
    return { returnPath, error: error === "access_denied" ? "Spotify login was cancelled." : error };
  }
  if (!verifier || params.get("state") !== expectedState) {
    return { returnPath, error: "Login could not be verified. Please try again." };
  }

  try {
    const tokens = await requestTokens({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code: code!,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    });
    return { tokens, returnPath };
  } catch (e) {
    return { returnPath, error: e instanceof Error ? e.message : String(e) };
  }
}

export function refreshTokens(tokens: Tokens): Promise<Tokens> {
  return requestTokens(
    {
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    },
    tokens.refreshToken
  );
}
