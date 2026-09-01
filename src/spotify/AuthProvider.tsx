import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  beginLogin,
  clearTokens,
  consumeRedirect,
  loadTokens,
  refreshTokens,
  saveTokens,
  type Tokens,
} from "./auth";
import { CLIENT_ID } from "./config";

type AuthStatus = "loading" | "unconfigured" | "logged-out" | "logged-in";

interface AuthContextValue {
  status: AuthStatus;
  error: string | null;
  login: () => void;
  logout: () => void;
  /** Returns a valid access token, refreshing it first if it is about to expire. */
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Refresh a little early so a token never expires mid-request.
const REFRESH_MARGIN_MS = 60_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<AuthStatus>(
    CLIENT_ID ? "loading" : "unconfigured"
  );
  const [error, setError] = useState<string | null>(null);
  const tokensRef = useRef<Tokens | null>(null);
  const refreshRef = useRef<Promise<Tokens> | null>(null);

  const setTokens = useCallback((tokens: Tokens | null) => {
    tokensRef.current = tokens;
    if (tokens) {
      saveTokens(tokens);
      setStatus("logged-in");
    } else {
      clearTokens();
      setStatus("logged-out");
    }
  }, []);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    (async () => {
      const redirect = await consumeRedirect();
      if (cancelled) return;

      if (redirect) {
        if (redirect.error) {
          setError(redirect.error);
          setStatus("logged-out");
          return;
        }
        setTokens(redirect.tokens ?? null);
        if (redirect.returnPath && redirect.returnPath !== "/") {
          navigate(redirect.returnPath, { replace: true });
        }
        return;
      }

      const stored = loadTokens();
      if (!stored) {
        setStatus("logged-out");
        return;
      }
      if (stored.expiresAt > Date.now() + REFRESH_MARGIN_MS) {
        setTokens(stored);
        return;
      }
      try {
        const fresh = await refreshTokens(stored);
        if (!cancelled) setTokens(fresh);
      } catch {
        // The refresh token was revoked or expired -- start over.
        if (!cancelled) setTokens(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, setTokens]);

  const getAccessToken = useCallback(async () => {
    const current = tokensRef.current;
    if (!current) throw new Error("Not signed in to Spotify");
    if (current.expiresAt > Date.now() + REFRESH_MARGIN_MS) {
      return current.accessToken;
    }
    // Collapse concurrent refreshes -- the SDK and the API layer both ask.
    if (!refreshRef.current) {
      refreshRef.current = refreshTokens(current).finally(() => {
        refreshRef.current = null;
      });
    }
    try {
      const fresh = await refreshRef.current;
      setTokens(fresh);
      return fresh.accessToken;
    } catch (e) {
      setTokens(null);
      throw e;
    }
  }, [setTokens]);

  const login = useCallback(() => {
    setError(null);
    // Router-relative path, so it survives the /cocospot/ basename round-trip.
    void beginLogin(location.pathname);
  }, [location.pathname]);

  const logout = useCallback(() => {
    setTokens(null);
  }, [setTokens]);

  return (
    <AuthContext.Provider value={{ status, error, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
