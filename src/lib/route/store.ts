"use client";
// The visitor's "route": the divisions they have collected anywhere on the site.
// A tiny external store (localStorage-backed) read with useSyncExternalStore.
import { useSyncExternalStore } from "react";

const KEY = "sxbp.route.v1";
const EMPTY: string[] = [];
let state: string[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    state = Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : EMPTY;
  } catch {
    state = EMPTY;
  }
}

function commit(next: string[]) {
  state = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: keep in memory */ }
  listeners.forEach((l) => l());
}

export const routeStore = {
  get: () => { load(); return state; },
  has: (slug: string) => routeStore.get().includes(slug),
  toggle: (slug: string) => {
    const cur = routeStore.get();
    commit(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
  },
  add: (slug: string) => { if (!routeStore.has(slug)) commit([...routeStore.get(), slug]); },
  set: (slugs: string[]) => commit([...new Set(slugs)]),
  clear: () => commit(EMPTY),
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
};

export function useRoute() {
  return useSyncExternalStore(routeStore.subscribe, routeStore.get, () => EMPTY);
}
