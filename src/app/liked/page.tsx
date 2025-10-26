"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import TabBar from "../tabbar";
import { useGameStore } from "../gameload";
import { useLikedGames } from "../likestore";
import LikedGameCard from "./likedgame";
import GameCard from "../gamecard";

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
        overflow: "hidden auto",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
      } as React.CSSProperties,
      container: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "flex-start",
        justifyContent: "center",
        margin: "0 auto",
        height: "100%",
        position: "relative",
        zIndex: 1,
        padding: 10,
        maxWidth: "750px",
      } as React.CSSProperties,
      mainContent: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "1em",
      } as React.CSSProperties,
      list: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 160px))",
        gap: 10,
        marginTop: 20,
        paddingBottom: 100,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        height: "calc(80vh - 200px)",
        width: "100%",
        justifyContent: "start",
        alignContent: "start",
      } as React.CSSProperties,
      listMask: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 80,
        background: "linear-gradient(to bottom, rgba(17,17,17,0) 0%, rgba(17,17,17,1) 100%)",
        pointerEvents: "none",
        zIndex: 2,
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
      filterBar: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
        alignSelf: "flex-start",
        width: "100%",
        maxWidth: "calc(5 * 160px + 4 * 10px)",
      } as React.CSSProperties,
      filterButton: {
        padding: "8px 12px",
        borderRadius: 50,
        background: "#222",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#eee",
        fontWeight: 600,
        cursor: "pointer",
        userSelect: "none",
      } as React.CSSProperties,
      popOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        zIndex: 4000,
        padding: 16,
      } as React.CSSProperties,
      popPanel: {
        width: "min(360px, 92vw)",
        maxHeight: "70vh",
        background: "rgba(20,20,20,0.92)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      } as React.CSSProperties,
      popHeader: {
        padding: "12px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontWeight: 700,
      } as React.CSSProperties,
      popList: {
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      } as React.CSSProperties,
      popItem: {
        width: "100%",
        textAlign: "left" as const,
        padding: "12px 14px",
        background: "transparent",
        border: "none",
        color: "#ddd",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
        fontWeight: 600,
      } as React.CSSProperties,
      popItemActive: {
        color: "#fff",
        background: "#242424",
        borderLeft: "3px solid #ff7f2aff",
      } as React.CSSProperties,
      popClose: {
        padding: "6px 10px",
        borderRadius: 50,
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.06)",
        color: "#eee",
        cursor: "pointer",
        fontWeight: 600,
      } as React.CSSProperties,
    }),
    []
  );

  const { catalog } = useGameStore();
  const likedGames = useLikedGames(catalog);

  const availableGenres = useMemo(() => {
    const s = new Set<string>();
    for (const g of likedGames) {
      for (const gen of (g.genre ?? [])) {
        const t = String(gen).trim();
        if (t) s.add(t);
      }
    }
    return ["All", ...Array.from(s).sort((a,b)=>a.localeCompare(b))];
  }, [likedGames]);

  const [activeGenre, setActiveGenre] = useState<string>("All");
  const [showFilter, setShowFilter] = useState(false);

  const filteredLiked = useMemo(() => {
    if (activeGenre === "All") return likedGames;
    return likedGames.filter(g => (g.genre ?? []).some(gen => String(gen).trim() === activeGenre));
  }, [likedGames, activeGenre]);

  const [selected, setSelected] = useState<null | typeof catalog[number]>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scaleW = Math.min(Math.max(width / 700, 0.6), 1);
      const scaleH = Math.min(Math.max(height / 700, 0.6), 1);
      const scale = Math.min(scaleW, scaleH);
      document.documentElement.style.setProperty('--card-scale', String(scale));
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function toCardData(g: typeof catalog[number]) {
    return {
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
    };
  }

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
            style={{ width: "110px", height: "90px", display: "block", pointerEvents: "auto" }}
          />
        </a>
      </div>
      <div style={{ position: "absolute", top: "0px", left: "35px" }}>
      </div>
      <div style={styles.container}>
        <div style={{ ...styles.mainContent, flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{
        fontSize: '1.6rem',
        fontWeight: 700,
        color: '#fff',
        textAlign: 'left' as const,
        paddingTop: '28px',
        alignSelf: 'stretch',            // stretch to container width
        width: '100%',
        maxWidth: '100%',                // never exceed
        boxSizing: 'border-box',
          }}>
            Liked
          </h1>
          <div style={styles.filterBar}>
            <button
              type="button"
              onClick={() => setShowFilter(true)}
              style={styles.filterButton}
            >
              Filter: {activeGenre}
            </button>
          </div>
          <div style={{ position: "relative", width: "100%" }}>
            <div style={styles.list}>
              {filteredLiked.length === 0 ? (
                <div style={{ color: "#777", textAlign: "center", width: "100%" }}>No liked games.</div>
              ) : (
                filteredLiked.map((game) => (
                  <LikedGameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    image={game.images && game.images[0] ? game.images[0].toString() : undefined}
                    onClick={() => setSelected(game)}
                  />
                ))
              )}
            </div>
            <div style={styles.listMask}></div>
          </div>
        </div>
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
      {showFilter && (
        <div style={styles.popOverlay} onClick={() => setShowFilter(false)}>
          <div style={styles.popPanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popHeader}>
              <span>Filter by Genre</span>
              <button type="button" style={styles.popClose} onClick={() => setShowFilter(false)}>Close</button>
            </div>
            <div style={styles.popList}>
              {availableGenres.map((g) => {
                const active = activeGenre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setActiveGenre(g); setShowFilter(false); }}
                    style={{
                      ...(styles.popItem as React.CSSProperties),
                      ...(active ? (styles.popItemActive as React.CSSProperties) : {}),
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}