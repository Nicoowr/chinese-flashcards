"use client";

import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "react-query";
import { useAuthenticatedUser } from "../components/hooks/use-authenticated-user";
import { FlashcardsContainer } from "../components/FlashcardsContainer";
import { LoginPage } from "../components/LoginPage";

const queryClient = new QueryClient();

const HomeSession = () => {
  const { isLoadingSession, authenticatedUser, loadCurrentUser, onLogout } =
    useAuthenticatedUser();

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Theme>
        {isLoadingSession ? (
          <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Loading session...
          </div>
        ) : authenticatedUser ? (
          <FlashcardsContainer
            onLogout={onLogout}
            userEmail={authenticatedUser.email ?? undefined}
          />
        ) : (
          <LoginPage onLoggedIn={loadCurrentUser} />
        )}
      </Theme>
    </main>
  );
};

const Home = () => (
  <QueryClientProvider client={queryClient}>
    <HomeSession />
  </QueryClientProvider>
);

export default Home;
