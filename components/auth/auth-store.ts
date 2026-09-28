"use client";

import { useSyncExternalStore } from "react";

/*
 * Client-only sign-in. There is no backend, so the credentials ship in the JS bundle: this keeps
 * casual visitors out but is not real security.
 */
const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "admin12345";
const AUTH_STORAGE_KEY = "cv-generator:auth";

const listeners = new Set<() => void>();

function readSignedIn(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setSignedIn(value: boolean) {
  try {
    if (value) localStorage.setItem(AUTH_STORAGE_KEY, "1");
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    /* storage unavailable: nothing to persist */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs in sync when one signs in or out.
  const onStorage = (e: StorageEvent) => {
    if (e.key === AUTH_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** true / false in the browser; null during server rendering, when the answer isn't known yet. */
export function useSignedIn(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, readSignedIn, () => null);
}

/** Returns whether the credentials matched (and signs in if they did). */
export function signIn(id: string, password: string): boolean {
  const ok = id.trim() === ADMIN_ID && password === ADMIN_PASSWORD;
  if (ok) setSignedIn(true);
  return ok;
}

export function signOut() {
  setSignedIn(false);
}
