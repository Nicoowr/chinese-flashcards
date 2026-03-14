"use client";

import { FormEvent, useState } from "react";
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,hsl(230_25%_7%),hsl(230_30%_12%))] pointer-events-none" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-xl shadow-cyan-950/20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use your email/password or Google account.</p>

        <form className="mt-6 space-y-4" onSubmit={onPasswordLogin}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

          <button
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in with email"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-white/10" />
          <span>OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onGoogleLogin}
          disabled={isSubmitting}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};
