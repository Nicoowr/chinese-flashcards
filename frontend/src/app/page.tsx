"use client";

import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { FlashcardsContainer } from "../components/FlashcardsContainer";
import { LoginPage } from "../components/LoginPage";
import {
  type AuthenticatedUser,
  getActiveSession,
  getCurrentUser,
  hydrateSessionFromUrl,
  signOut,
} from "../lib/supabaseClient";

const queryClient = new QueryClient();

export default function Home() {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);

  const loadCurrentUser = useCallback(async () => {
    try {
      hydrateSessionFromUrl();

      const activeSession = await getActiveSession();
      const user = await getCurrentUser(activeSession.access_token);
      setAuthenticatedUser(user);
    } catch {
      setAuthenticatedUser(null);
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const onLogout = async () => {
    await signOut();
    setAuthenticatedUser(null);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Theme>
        {isLoadingSession ? (
          <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading session...</div>
        ) : authenticatedUser ? (
          <QueryClientProvider client={queryClient}>
            <FlashcardsContainer
              onLogout={onLogout}
              userEmail={authenticatedUser.email ?? undefined}
            />
          </QueryClientProvider>
        ) : (
          <LoginPage onLoggedIn={loadCurrentUser} />
        )}
      </Theme>
    </main>
  );
}
