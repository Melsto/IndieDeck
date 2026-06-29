"use client";

import * as React from "react";


const STORAGE_KEY = "gc_likes_v1";

function readFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr.filter(Boolean));
  } catch {
    return new Set();
  }
}

function writeToStorage(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

// Context surface (no LikeButton here)
export type LikesContextValue = {
  likedIds: Set<string>;
  like: (id: string) => void;
  unlike: (id: string) => void;
  toggle: (id: string) => void;
  isLiked: (id: string) => boolean;
  clear: () => void;
};

const LikesContext = React.createContext<LikesContextValue | null>(null);

// Deterministic reducer with synchronous persistence
function reducer(
  state: Set<string>,
  action:
    | { type: "like"; id: string }
    | { type: "unlike"; id: string }
    | { type: "toggle"; id: string }
    | { type: "clear" }
    | { type: "reset"; next: Set<string> }
): Set<string> {
  switch (action.type) {
    case "like": {
      const next = new Set(state);
      next.add(action.id);
      try { console.log('[Likes] Added', action.id, 'Liked IDs:', Array.from(next)); } catch {}
      writeToStorage(next);
      return next;
    }
    case "unlike": {
      const next = new Set(state);
      next.delete(action.id);
      writeToStorage(next);
      return next;
    }
    case "toggle": {
      const wasLiked = state.has(action.id);
      const next = new Set(state);
      if (wasLiked) {
        next.delete(action.id);
      } else {
        next.add(action.id);
        try { console.log('[Likes] Added', action.id, 'Liked IDs:', Array.from(next)); } catch {}
      }
      writeToStorage(next);
      return next;
    }
    case "clear": {
      const next = new Set<string>();
      writeToStorage(next);
      return next;
    }
    case "reset": {
      const next = new Set(action.next);
      writeToStorage(next);
      return next;
    }
    default:
      return state;
  }
}

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const [likedIds, dispatch] = React.useReducer(reducer, undefined, () => readFromStorage());

  // Cross-tab sync
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        dispatch({ type: "reset", next: readFromStorage() });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const like = React.useCallback((id: string) => { if (id) dispatch({ type: "like", id }); }, []);
  const unlike = React.useCallback((id: string) => { if (id) dispatch({ type: "unlike", id }); }, []);
  const toggle = React.useCallback((id: string) => { if (id) dispatch({ type: "toggle", id }); }, []);
  const isLiked = React.useCallback((id: string) => likedIds.has(id), [likedIds]);
  const clear = React.useCallback(() => dispatch({ type: "clear" }), []);

  const value = React.useMemo<LikesContextValue>(
    () => ({ likedIds, like, unlike, toggle, isLiked, clear }),
    [likedIds, like, unlike, toggle, isLiked, clear]
  );

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes(): LikesContextValue {
  const ctx = React.useContext(LikesContext);
  if (!ctx) throw new Error("useLikes must be used inside <LikesProvider>");
  return ctx;
}

// Hook: given a list of games (with stable id), return a map id->liked?
export function useLikeMap<T extends { id?: string }>(games: T[]) {
  const { likedIds } = useLikes();
  return React.useMemo(() => {
    const map = new Map<string, boolean>();
    for (const g of games) {
      if (!g?.id) continue;
      map.set(String(g.id), likedIds.has(String(g.id)));
    }
    return map;
  }, [games, likedIds]);
}

// Back-compat helper: filter a list of games by liked ids (ID-only)
export function useLikedGames<T extends { id?: string }>(games: T[]) {
  const { likedIds } = useLikes();
  return React.useMemo(() => {
    return games.filter((g) => !!g?.id && likedIds.has(String(g.id!)));
  }, [games, likedIds]);
}

// ---------------------------------------------------------------------------
// Reusable Like Button (ID-only) — drop anywhere in the app
// ---------------------------------------------------------------------------
export function LikeButton({
  id,
  size = 18,
  circle = true,
  className,
  style,
  onToggle,
  title,
}: {
  id: string;
  size?: number;              // icon size in px
  circle?: boolean;           // show as round button background
  className?: string;
  style?: React.CSSProperties;
  onToggle?: (liked: boolean) => void; // callback after toggle
  title?: string;
}) {
  const { toggle, isLiked } = useLikes();
  const liked = isLiked(id);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(id);
    onToggle?.(!liked);
  };

  const baseBtn: React.CSSProperties = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: circle ? 8 : 6,
    lineHeight: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: circle ? 999 : 8,
    pointerEvents: "auto",
    transition: "all 0.2s ease",
    ...(circle
      ? {
          background: liked ? "#ff5a7a" : "rgba(255,255,255,0.06)",
          border: liked ? "1px solid #ff5a7a" : "1px solid rgba(255,255,255,0.28)",
          width: size + 18,
          height: size + 18,
        }
      : {}),
  };

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      title={title ?? (liked ? "Unlike" : "Like")}
      onClick={handleClick}
      className={className}
      style={{ ...baseBtn, ...style }}
      data-nodrag
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={liked ? "#ffffff" : "none"}
        stroke={liked ? "#ffffff" : "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}