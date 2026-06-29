"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TabBar from "../tabbar";
import { useGameStore } from "../gameload";
import GenreToggles from "./GenreToggles";

export default function MainPage() {
  const STORAGE_KEY = "gc_genre_prefs_v1";
  const SEEN_KEY = "gc_seen_v1";
  const { catalog } = useGameStore();

  // Compute unique genres from catalog
  const allGenres = useMemo(() => {
    const s = new Set<string>();
    for (const g of catalog) {
      for (const gen of (g.genre ?? [])) {
        const t = String(gen).trim();
        if (t) s.add(t);
      }
    }
    return Array.from(s).sort((a,b) => a.localeCompare(b));
  }, [catalog]);

  // Initialize selected to all genres once loaded
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw));
      // If no saved prefs, default to all genres (empty for now, will update in useEffect)
      return new Set();
    } catch {
      return new Set();
    }
  });

  const [autoplay, setAutoplay] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true; // default ON
    try {
      const raw = window.localStorage.getItem("gc_playback_autoplay_v1");
      return raw === null ? true : JSON.parse(raw) === true;
    } catch {
      return true;
    }
  });

  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false; // default MUTED OFF
    try {
      const raw = window.localStorage.getItem("gc_playback_muted_v1");
      return raw === null ? false : JSON.parse(raw) === true;
    } catch {
      return false;
    }
  });

  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // Persist on change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selected)));
    } catch {}
  }, [selected]);

  useEffect(() => {
    try { window.localStorage.setItem("gc_playback_autoplay_v1", JSON.stringify(autoplay)); } catch {}
  }, [autoplay]);

  useEffect(() => {
    try { window.localStorage.setItem("gc_playback_muted_v1", JSON.stringify(muted)); } catch {}
  }, [muted]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) setSelected(new Set(JSON.parse(raw)));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // First-visit bootstrap: only if no prefs exist in storage at all
  useEffect(() => {
    if (allGenres.length === 0) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw || (selected.size === 0 && raw !== null)) {
        const all = new Set(allGenres);
        setSelected(all);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(all)));
      }
      // If selected is empty (no genres checked), keep it empty (hide all games)
    } catch {}
  }, [allGenres]);

  const toggle = (g: string) => setSelected(prev => {
    const n = new Set(prev);
    if (n.has(g)) n.delete(g); else n.add(g);
    return n;
  });

  const selectAll = () => setSelected(new Set(allGenres));
  const clearAll = () => setSelected(new Set());

  const resetSeen = () => {
    try {
      window.localStorage.removeItem(SEEN_KEY);
      // also write an empty set to trigger storage listeners reliably
      window.localStorage.setItem(SEEN_KEY, JSON.stringify([]));
      setResetMsg("Feed reset. You will see all games again on next reload.");
      setTimeout(() => setResetMsg(null), 2000);
    } catch {}
  };

  const styles = useMemo(
    () => ({
      page: {
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        background: "#111",
        minHeight: "100dvh",
        color: "#ffffffff",
        padding: "16px",
        overflow: "auto",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
      } as React.CSSProperties,
      container: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "flex-start",            // changed from "stretch"
        justifyContent: "center",
        margin: "0 auto",
        height: "auto",                      // changed from "75%"
        position: "relative",
        zIndex: 1,
        padding: 10,
        maxWidth: "680px",
        width: "100%",
        boxSizing: "border-box",       // include padding in width
      } as React.CSSProperties,
      mainContent: {
        flex: 1,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "stretch",             // changed from "center"
        flexDirection: "column" as const,
        marginTop: "32px",                 // changed from paddingTop: "2em"
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        paddingBottom: "15em",
      } as React.CSSProperties,
      tabBar: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      } as React.CSSProperties,
      logo: {
        position: "absolute",
        top: 0,
        left: 35,
        zIndex: 2001,
        pointerEvents: "auto",
        maxWidth: '100%',
      } as React.CSSProperties,
      headline: {
        fontSize: '1.6rem',
        fontWeight: 700,
        color: '#fff',
        textAlign: 'left' as const,
        paddingTop: '28px',
        alignSelf: 'stretch',            // stretch to container width
        width: '100%',
        maxWidth: '100%',                // never exceed
        boxSizing: 'border-box',
      } as React.CSSProperties,
      section: {
        width: '100%',
        maxWidth: '100%',
        marginTop: 12,
        padding: 12,
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        boxSizing: 'border-box',
        overflowWrap: 'anywhere',        // prevent long text from overflowing
        wordBreak: 'break-word',
      } as React.CSSProperties,
      sectionTitle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#d9d9d9',
        marginBottom: 8,
      } as React.CSSProperties,
      footerRow: {
        display: 'flex',
        gap: 16,
        width: '100%',
        maxWidth: '100%',
        paddingTop: 16,
        boxSizing: 'border-box',
      } as React.CSSProperties,
      ghostBtn: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.22)',
        background: "rgba(255,255,255,0.06)",
        color: '#ddd',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none' as const,
        textDecoration: 'none',
      } as React.CSSProperties,
      primaryBtn: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.22)',
        background: '#ef7f2a',
        color: '#ffffffff',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none' as const,
        textDecoration: 'none',
      } as React.CSSProperties,
      genreRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 10,
        marginTop: 12,
        maxHeight: 360,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        paddingRight: 4,
      } as React.CSSProperties,
      check: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      } as React.CSSProperties,
      controlsRow: {
        display: "flex",
        gap: 8,
        marginTop: 10,
      } as React.CSSProperties,
      smallBtn: {
        height: 32,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.06)",
        color: "#ddd",
        fontWeight: 600,
        padding: "0 10px",
        cursor: "pointer",
      } as React.CSSProperties,
      subheader: {
        fontSize: 16,
        fontWeight: 700,
        color: '#cfcfcf',
        marginTop: 4,
        marginBottom: 8,
        alignSelf: 'flex-start',
      } as React.CSSProperties,
      smallSection: {
        width: '100%',
        maxWidth: '100%',
        marginTop: 12,
        padding: 12,
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        boxSizing: 'border-box',
      } as React.CSSProperties,
      row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      } as React.CSSProperties,
      rowTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#cfcfcf',
      } as React.CSSProperties,
      track: {
        position: 'relative',
        width: 56,
        height: 28,
        borderRadius: 999,
        background: '#2a2a2a',
        border: '1px solid rgba(255,255,255,0.12)',
        transition: 'background 160ms ease',
      } as React.CSSProperties,
      thumb: {
        position: 'absolute',
        top: 2,
        left: 2,
        width: 24,
        height: 24,
        borderRadius: 12,
        background: '#fff',
        transition: 'transform 160ms ease',
      } as React.CSSProperties,
      trackOn: { background: '#ef7f2a' } as React.CSSProperties,
      thumbOn: { transform: 'translateX(28px)' } as React.CSSProperties,
      switchBtn: {
        appearance: 'none' as any,
        WebkitAppearance: 'none' as any,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
        margin: 0,
      } as React.CSSProperties,
      hint: {
        marginTop: 8,
        color: '#9a9a9a',
        fontSize: 12,
      } as React.CSSProperties,
    }),
    []
  );

  return (
    <div style={styles.page}>
      <div style={styles.tabBar}>
        <TabBar />
      </div>
      <div style={styles.logo}>
        <a href="/">
          <img
            src="/logo.svg"
            alt="Logo"
            style={{ width: '110px', height: '90px', display: 'block', pointerEvents: 'auto' }}
          />
        </a>
      </div>

      <div style={styles.container}>
        <div style={styles.mainContent}>
          <h1 style={styles.headline}>Settings</h1>

          {/* Settings Section with two panels inside */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Genre Preferences</div>
            <GenreToggles
              genres={allGenres}
              selected={selected}
              onToggle={toggle}
              title={""}
            />

            <div style={{ height: 12 }} />

            <div style={styles.sectionTitle}>Playback Settings</div>
            <GenreToggles
              genres={["Autoplay Videos", "Mute Videos"]}
              selected={new Set([
                ...(autoplay ? ["Autoplay Videos"] : []),
                ...(muted ? ["Mute Videos"] : []),
              ])}
              onToggle={(label) => {
                if (label === "Autoplay Videos") setAutoplay(v => !v);
                if (label === "Mute Videos") setMuted(v => !v);
              }}
              title={""}
            />
            <div style={{ height: 12 }} />
            <div style={styles.controlsRow}>
              <button type="button" onClick={resetSeen} style={styles.smallBtn}>Reset Seen Games</button>
            </div>
            {resetMsg && <div style={styles.hint}>{resetMsg}</div>}
          </div>

          <div style={styles.footerRow}>
            <Link href="/data" style={styles.ghostBtn as React.CSSProperties}>Legal Info</Link>
            <Link href="/submission" style={styles.primaryBtn as React.CSSProperties}>Submit Game</Link>
          </div>
        </div>
      </div>
    </div>
  );
}