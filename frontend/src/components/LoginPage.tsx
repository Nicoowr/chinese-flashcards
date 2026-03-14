"use client";

import { FormEvent, useState } from "react";
import { Body, Box, Button, HStack, VStack } from "../design-system/components";
import { signInWithPassword, startGoogleOAuthLogin } from "../lib/supabaseClient";

type LoginPageProps = {
  onLoggedIn: () => Promise<void>;
};

export const LoginPage = ({ onLoggedIn }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onPasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithPassword(email.trim(), password);
      await onLoggedIn();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleLogin = () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    startGoogleOAuthLogin();
  };

  return (
    <VStack
      className="min-h-screen bg-background p-4 relative"
      alignItems="center"
      justifyContent="center"
    >
      <Box className="absolute inset-0 bg-[linear-gradient(to_bottom_right,hsl(230_25%_7%),hsl(230_30%_12%))] pointer-events-none" />
      <VStack className="relative w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-xl shadow-cyan-950/20" gap={24}>
        <VStack gap={4}>
          <Body as="h1" className="text-2xl font-semibold tracking-tight text-foreground">
            Sign in
          </Body>
          <Body as="p" className="text-sm text-muted-foreground">
            Use your email/password or Google account.
          </Body>
        </VStack>

        <VStack as="form" gap={16} onSubmit={onPasswordLogin}>
          <VStack gap={4}>
            <Body as="label" className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </Body>
            <input
              id="email"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </VStack>

          <VStack gap={4}>
            <Body as="label" className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </Body>
            <input
              id="password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </VStack>

          {errorMessage ? <Body as="p" className="text-sm text-red-400">{errorMessage}</Body> : null}

          <Button
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in with email"}
          </Button>
        </VStack>

        <HStack className="text-xs text-muted-foreground" alignItems="center" gap={12}>
          <Box className="h-px flex-1 bg-white/10" />
          <Body>OR</Body>
          <Box className="h-px flex-1 bg-white/10" />
        </HStack>

        <Button
          variant="outline"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onGoogleLogin}
          disabled={isSubmitting}
        >
          Continue with Google
        </Button>
      </VStack>
    </VStack>
  );
};
