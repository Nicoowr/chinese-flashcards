export type AuthenticatedUser = {
  id: string;
  email?: string;
};

type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};

const STORAGE_KEY = "supabase.auth.session";

const getSupabaseCredentials = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable"
    );
  }

  return { url, anonKey };
};

const getHeaders = () => {
  const { anonKey } = getSupabaseCredentials();
  return {
    apikey: anonKey,
    "Content-Type": "application/json",
  };
};

export const getStoredSession = (): AuthSession | null => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

export const storeSession = (session: AuthSession) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

export const signInWithPassword = async (email: string, password: string) => {
  const { url } = getSupabaseCredentials();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Login failed");
  }

  const data = (await response.json()) as AuthSession;
  storeSession(data);
  return data;
};

export const startGoogleOAuthLogin = () => {
  const { url, anonKey } = getSupabaseCredentials();
  const redirectTo = encodeURIComponent(window.location.origin);
  window.location.href = `${url}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}&apikey=${anonKey}`;
};

export const hydrateSessionFromUrl = () => {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    return false;
  }

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const expiresIn = params.get("expires_in");

  if (!accessToken || !refreshToken) {
    return false;
  }

  storeSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresIn ? Date.now() + Number(expiresIn) * 1000 : undefined,
  });

  window.history.replaceState({}, document.title, window.location.pathname);
  return true;
};

export const refreshSession = async (refreshToken: string) => {
  const { url } = getSupabaseCredentials();
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Unable to refresh session");
  }

  const data = (await response.json()) as AuthSession;
  storeSession(data);
  return data;
};

export const getCurrentUser = async (accessToken: string) => {
  const { url, anonKey } = getSupabaseCredentials();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch current user");
  }

  return (await response.json()) as AuthenticatedUser;
};

export const signOut = async () => {
  const session = getStoredSession();
  if (!session) {
    clearSession();
    return;
  }

  const { url, anonKey } = getSupabaseCredentials();
  await fetch(`${url}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  clearSession();
};
