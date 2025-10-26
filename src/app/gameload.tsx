"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ---------- Types matching your UI layer ----------
export type Game = {
  id: string;
  title: string;
  developer: string;
  genre: string[];
  description: string;
  ageRating: string;
  publisher: string;
  images: URL[];
  links: Record<string, string>;
  videoUrl?: string; // optional video URL (camelCase)
};

// Row type expected from Supabase table `games`
// Columns: id(text), name(text), images(_text), description(text), publisher(text),
// developer(text), age_rating(text), genre(text), links(jsonb)
export type GameRow = {
  id: string;
  name: string;
  images: string[] | null;
  description: string;
  publisher: string;
  developer: string;
  age_rating: string;
  genre: string; // stored as a single string in your schema
  links: Record<string, string> | null;
  videourl: string[] | string | null; // may be array (e.g. ["URL"]) or string
};

// ---------- Supabase client (public) ----------
// Put these in .env.local as NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// Example:
// NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[GameLoad] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local"
  );
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");

// ---------- Cache (per session) ----------
let CATALOG_CACHE: Game[] | null = null;

function normalizeVideoUrl(raw: string[] | string | null): string | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw[0] ? String(raw[0]) : undefined;
  let s = String(raw).trim();
  // If Supabase returned a JSON-stringified array like "[\"https://...\"]"
  if (s.startsWith("[")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr[0]) s = String(arr[0]);
    } catch {
      // fall through with original string
    }
  }
  // Strip accidental surrounding quotes
  s = s.replace(/^"(.*)"$/, "$1");
  return s || undefined;
}

function mapRowToGame(row: GameRow): Game {
  const imageUrls: URL[] = (row.images ?? [])
    .map((s) => (s ? String(s).trim() : ""))
    .filter(Boolean)
    .map((s) => { try { return new URL(s); } catch { return null; } })
    .filter((u): u is URL => !!u);

  return {
    id: row.id,
    title: row.name,
    developer: row.developer ?? "",
    genre: [row.genre].filter(Boolean),
    description: row.description ?? "",
    ageRating: row.age_rating ?? "",
    publisher: row.publisher ?? "",
    images: imageUrls,
    links: row.links ?? {},
    videoUrl: normalizeVideoUrl(row.videourl),
  };
}

async function fetchGamesFromSupabase(table = "games"): Promise<Game[]> {
  const { data, error } = await supabase
    .from(table)
    .select("id,name,images,description,publisher,developer,age_rating,genre,links,videourl");

  if (error) {
    throw new Error(`[GameLoad] Supabase error: ${error.message}`);
  }
  return (data ?? []).map(mapRowToGame);
}

// ---------- React hook API ----------
export function useGameStore() {
  const [catalog, setCatalog] = useState<Game[]>(() => CATALOG_CACHE ?? []);
  const [loading, setLoading] = useState<boolean>(!CATALOG_CACHE);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const games = await fetchGamesFromSupabase("games");
      CATALOG_CACHE = games;
      setCatalog(games);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!CATALOG_CACHE) {
      void load();
    }
  }, []);

  return { catalog, loading, error, reload: load };
}

// ---------- Optional component wrapper ----------
// Usage example:
// const { catalog, loading, error } = useGameStore();
// if (loading) return <div>Loading…</div>
// if (error) return <div>Error: {error}</div>
// return <Deck items={catalog} ... />

export default function GameLoadDebug() {
  const { catalog, loading, error, reload } = useGameStore();

  return (
    <div style={{ padding: 16 }}>
      <h3>Games (Supabase)</h3>
      {loading && <p>Loading…</p>}
      {error && (
        <p style={{ color: "crimson" }}>
          {error} <button onClick={reload}>Retry</button>
        </p>
      )}
      {!loading && !error && (
        <ul>
          {catalog.map((g) => (
            <li key={g.title}>
              <strong>{g.title}</strong> — {g.developer}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}