"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { signIn, useSignedIn } from "./auth-store";

/** Shows the login screen until the user signs in, then renders the app. */
export function AuthGate({ children }: { children: ReactNode }) {
  const signedIn = useSignedIn();
  // Unknown until the browser reads storage: render nothing rather than flash the wrong screen.
  if (signedIn === null) return null;
  return signedIn ? children : <LoginScreen />;
}

function LoginScreen() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!signIn(id, password)) setError(true);
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-16">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_70%_20%,rgba(99,102,241,0.18),transparent),radial-gradient(40%_50%_at_10%_80%,rgba(14,165,233,0.14),transparent)]" />
      <ThemeToggle className="absolute top-4 right-4" />
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-surface p-8 shadow-lg" noValidate>
        <div className="flex flex-col items-center text-center">
          <Logo size={44} />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-500">CV Generator</p>
        </div>

        <label className="mt-8 block text-sm font-medium text-zinc-700" htmlFor="login-id">
          User ID
        </label>
        <input
          id="login-id"
          className="input mt-1.5"
          autoComplete="username"
          autoFocus
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            setError(false);
          }}
          aria-invalid={error}
        />

        <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          className="input mt-1.5"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          aria-invalid={error}
        />

        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            Incorrect user ID or password.
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary mt-6 w-full py-2">
          Sign in
        </button>
      </form>
    </main>
  );
}
