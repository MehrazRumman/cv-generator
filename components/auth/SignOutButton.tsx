"use client";

import { signOut } from "./auth-store";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button type="button" className={`btn btn-ghost text-zinc-500 ${className ?? ""}`} onClick={signOut}>
      Sign out
    </button>
  );
}
