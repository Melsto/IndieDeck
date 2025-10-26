

"use client";

import * as React from "react";

export type GenreTogglesProps = {
  genres: string[];
  selected: Set<string>;
  onToggle: (genre: string) => void;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
};

export default function GenreToggles({
  genres,
  selected,
  onToggle,
  className,
  style,
  title = "Content Preferences",
}: GenreTogglesProps) {
  const styles = React.useMemo(
    () => ({
      panel: {
        width: "100%",
        maxWidth: "100%",
        background: "#1e1e1e",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 12,
        boxSizing: "border-box",
      } as React.CSSProperties,
      subheader: {
        fontSize: 16,
        fontWeight: 700,
        color: "#cfcfcf",
        marginTop: 0,
        marginBottom: 8,
        alignSelf: "flex-start",
      } as React.CSSProperties,
      row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      } as React.CSSProperties,
      rowLast: { borderBottom: "none" } as React.CSSProperties,
      label: {
        fontSize: 16,
        color: "#e6e6e6",
        fontWeight: 600,
      } as React.CSSProperties,
      switchBtn: {
        appearance: "none" as any,
        WebkitAppearance: "none" as any,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        margin: 0,
      } as React.CSSProperties,
      track: {
        position: "relative",
        width: 56,
        height: 28,
        borderRadius: 999,
        background: "#2a2a2a",
        border: "1px solid rgba(255,255,255,0.12)",
        transition: "background 160ms ease",
      } as React.CSSProperties,
      thumb: {
        position: "absolute",
        top: 1,
        left: 2,
        width: 24,
        height: 24,
        borderRadius: 12,
        background: "#fff",
        transition: "transform 160ms ease",
      } as React.CSSProperties,
      on: { background: "#ef7f2a" } as React.CSSProperties,
      thumbOn: { transform: "translateX(28px)" } as React.CSSProperties,
      footnote: {
        color: "#9a9a9a",
        fontSize: 12,
        marginTop: 8,
        paddingLeft: 0,
        alignSelf: "flex-start",
      } as React.CSSProperties,
    }),
    []
  );

  return (
    <div className={className} style={{ ...styles.panel, ...style }}>
      <div style={styles.subheader}>{title}</div>
      {genres.length === 0 ? (
        <div style={{ padding: 14, color: "#777" }}>No genres found.</div>
      ) : (
        genres.map((g, idx) => {
          const on = selected.has(g);
          const isLast = idx === genres.length - 1;
          return (
            <div key={g} style={{ ...styles.row, ...(isLast ? styles.rowLast : {}) }}>
              <div style={styles.label}>{g}</div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => onToggle(g)}
                style={styles.switchBtn}
              >
                <div style={{ ...styles.track, ...(on ? styles.on : {}) }}>
                  <div style={{ ...styles.thumb, ...(on ? styles.thumbOn : {}) }} />
                </div>
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}