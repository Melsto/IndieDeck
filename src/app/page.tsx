"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import GameCard from "./gamecard";
import TabBar from "./tabbar";
import { Deck } from "./carddeck";
import { useGameStore } from "./gameload";
import ExploreSwitcher from "./exploreswitcher";
import Explore from "./explore";

export default function MainPage() {
  const styles = useMemo(
    () => ({
      page: {
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        background: "#111",
        minHeight: "100dvh",
        color: "#ffffffff",
        padding: "24px",
        overflow: "hidden",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
      } as React.CSSProperties,
      container: {
        display: "flex",
        flexDirection: "row" as const,
        height: "100%",
        width: "100%",
        alignItems: "flex-start",
        position: "relative",
      } as React.CSSProperties,
      tabBar: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      } as React.CSSProperties,
      mainContent: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      } as React.CSSProperties,
      switcher: {
        display: "flex",
        justifyContent: "right",
        alignItems: "right",
        marginBottom: "15px",
        zIndex: 99,
      } as React.CSSProperties,
      logo: {
        position: "absolute",
        top: 0,
        left: 35,
        zIndex: -2,
        pointerEvents: "auto",
      } as React.CSSProperties,
      deckWrap: {
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%) scale(var(--deck-scale, 1))",
        aspectRatio: "16 / 9",
        width: "min(90vw, 1200px)",
        transformOrigin: "center top",
        margin: 0,
        transition: "transform 0.3s ease",
      } as React.CSSProperties,
    }),
    []
  );

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scaleW = Math.min(Math.max(width / 700, 0.7), 1);
      const scaleH = Math.min(Math.max(height / 960, 0.7), 1);
      const scale = Math.min(scaleW, scaleH);
      document.documentElement.style.setProperty("--deck-scale", String(scale));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const MODE_KEY = "gc_mode_v1";
  const [mode, setMode] = useState<"forYou" | "explore">("forYou");

  // After mount, read persisted mode (avoids hydration mismatches)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(MODE_KEY);
      if (raw === "explore") setMode("explore");
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(MODE_KEY, mode); } catch {}
  }, [mode]);

  // Listen for a custom event from ExploreSwitcher as a fallback
  useEffect(() => {
    const onSwitch = (e: any) => {
      const v = e?.detail === "explore" ? "explore" : "forYou";
      setMode(v);
    };
    window.addEventListener("explore:switch", onSwitch as any);
    return () => window.removeEventListener("explore:switch", onSwitch as any);
  }, []);

  const { catalog, loading, error } = useGameStore();
  // --- Genre preference filtering (from Settings) ---
  const STORAGE_KEY = "gc_genre_prefs_v1";

  // Build a set of selected genres from localStorage; default to all when missing
  const allGenres = React.useMemo(() => {
    const s = new Set<string>();
    for (const g of catalog) for (const gen of (g.genre ?? [])) {
      const t = String(gen).trim(); if (t) s.add(t);
    }
    return Array.from(s);
  }, [catalog]);

  const [selectedGenres, setSelectedGenres] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const readPrefs = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const arr = JSON.parse(raw) as string[];
          setSelectedGenres(new Set(arr));
        } else {
          // default: all genres selected
          setSelectedGenres(new Set(allGenres));
        }
      } catch {
        setSelectedGenres(new Set(allGenres));
      }
    };
    readPrefs();
    window.addEventListener('storage', readPrefs);
    return () => window.removeEventListener('storage', readPrefs);
  }, [allGenres]);

  const filteredCatalog = React.useMemo(() => {
    if (selectedGenres.size === 0) return [];
    return catalog.filter(g => (g.genre ?? []).some(gen => selectedGenres.has(String(gen).trim())));
  }, [catalog, selectedGenres]);

  const deckItems = React.useMemo(() => {
    return filteredCatalog.map(g => ({
      id: g.id,
      title: g.title,
      mainImage: g.images[0] ? g.images[0].toString() : "",
      previews: g.images.slice(1, 5).map(u => u.toString()),
      description: g.description,
      developer: g.developer,
      publisher: g.publisher,
      age_rating: g.ageRating,
      genre: g.genre.join(", "),
      links: g.links ?? {},
      videoUrl: g.videoUrl ?? null,
    }));
  }, [filteredCatalog]);

  return (
    <div style={{ ...styles.page, overflow: mode === "explore" ? "hidden auto" as const : "hidden" }}>
      <div style={styles.tabBar}>
        <TabBar/>
      </div>
      <div style={styles.logo}>
        <a href="/">
          <img
            src="/logo.svg"
            alt="Logo"
            style={{ width: "110px", height: "90px", display: "block" }}
          />
        </a>
      </div>
      <div style={styles.switcher}>
        <ExploreSwitcher
          value={mode}
          onChange={(v: any) => setMode(v === "explore" ? "explore" : "forYou")}
        />
      </div>
      <div style={styles.container}>
        <div style={styles.mainContent}>
          {loading && <div style={{ padding: 16 }}>Loading…</div>}
          {error && <div style={{ padding: 16, color: 'crimson' }}>Error: {error}</div>}
          {mode === "explore" ? (
            <div style={{ width: "100%", position: "relative" }}>
              <Explore />
            </div>
          ) : (
            <div style={styles.deckWrap}>
              <Deck
                items={deckItems}
                renderCard={(item, ctx) => <GameCard data={item} isFront={!!ctx?.isFront} />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}