"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useGameStore } from "./gameload";
import GameCard from "./gamecard";
import GameTileCard from "./liked/likedgame"; // reusable small card (thumb + title + like)

export default function Explore() {
  const styles = useMemo(
    () => ({
      page: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      } as React.CSSProperties,
      container: {
        width: "min(1100px, 92vw)",
        margin: "0 auto",
        paddingTop: 15,
        paddingBottom: 200,
        position: "relative",
      } as React.CSSProperties,
      title: {
        fontSize: "2rem",
        fontWeight: 800,
        letterSpacing: 0.2,
        marginBottom: 16,
      } as React.CSSProperties,
      section: {
        marginTop: 28,
      } as React.CSSProperties,
      rowHead: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 10,
        color: "#fff",
        opacity: 0.9,
      } as React.CSSProperties,
      scroller: {
        display: "grid",
        gridAutoFlow: "column",
        gridAutoColumns: "150px",
        gap: 16,
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 8,
        paddingRight: 8,
        paddingLeft: 8,
      } as React.CSSProperties,
      overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: 20,
      } as React.CSSProperties,
      sheet: {
        position: "relative",
        maxWidth: 920,
        width: "min(92vw, 920px)",
        margin: "0 auto",
        transformOrigin: "center",
        display: "flex",
        justifyContent: "center",
      } as React.CSSProperties,
      closeHit: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 40,
        height: 40,
        borderRadius: 20,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.2)",
        cursor: "pointer",
        zIndex: 1,
      } as React.CSSProperties,
    }),
    []
  );

  const { catalog, loading, error } = useGameStore();

  // Build genre -> games map
  const grouped = useMemo(() => {
    const map = new Map<string, typeof catalog>();
    for (const g of catalog) {
      const genres = Array.isArray(g.genre) ? g.genre : (g.genre ? [g.genre as any] : []);
      for (const raw of genres) {
        const name = String(raw).trim();
        if (!name) continue;
        const arr = map.get(name) ?? [];
        arr.push(g);
        map.set(name, arr);
      }
    }
    // Sort genres alphabetically, and within each row keep original order
    const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return entries;
  }, [catalog]);

  const [selected, setSelected] = useState<null | (typeof catalog)[number]>(null);

  // proportional overlay scaling like on Liked page
  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scaleW = Math.min(Math.max(width / 700, 0.6), 1);
      const scaleH = Math.min(Math.max(height / 700, 0.6), 1);
      const scale = Math.min(scaleW, scaleH);
      document.documentElement.style.setProperty("--card-scale", String(scale));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toCardData = (g: (typeof catalog)[number]) => ({
    id: g.id,
    title: g.title,
    mainImage: g.images[0] ? g.images[0].toString() : "",
    previews: g.images.slice(1, 5).map((u) => u.toString()),
    description: g.description,
    developer: g.developer,
    publisher: g.publisher,
    age_rating: g.ageRating,
    genre: g.genre.join(", "),
    links: g.links ?? {},
    videoUrl: (g as any).videoUrl ?? null,
  });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Explore</h1>

        {loading && <div style={{ color: "#aaa", padding: 16 }}>Loading…</div>}
        {error && <div style={{ color: "crimson", padding: 16 }}>Error: {error}</div>}

        {!loading && !error && grouped.length === 0 && (
          <div style={{ color: "#777", padding: 16 }}>No genres found.</div>
        )}

        {!loading && !error && grouped.map(([genre, games]) => (
          <section key={genre} style={styles.section}>
            <div style={styles.rowHead}>{genre}</div>
            <div style={styles.scroller} className="rowScroller">
              {games.map((g) => (
                <GameTileCard
                  key={g.id ?? g.title}
                  id={g.id as any}
                  title={g.title}
                  image={g.images && g.images[0] ? g.images[0].toString() : undefined}
                  onClick={() => setSelected(g)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.closeHit} onClick={() => setSelected(null)} aria-label="Close overlay">✕</div>
            <div style={{ transform: 'scale(var(--card-scale, 1))', transformOrigin: 'center', transition: 'transform 0.3s ease', display: 'flex', justifyContent: 'center' }}>
              <GameCard data={toCardData(selected)} />
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .rowScroller > * { width: 180px; margin: 0; }
      `}</style>
    </div>
  );
}