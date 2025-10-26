

"use client";

import React from "react";
import { LikeButton } from "../likestore";

export type LikedGameCardProps = {
  id: string;
  title: string;
  image?: string | null;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export default function LikedGameCard({ id, title, image, onClick, style }: LikedGameCardProps) {
  const styles: Record<string, React.CSSProperties> = {
    card: {
      position: "relative",
      height: "140px",
      width: "160px",
      borderRadius: 12,
      overflow: "hidden",
      background: "#1a1a1a",
      justifyContent: "space-between",
      cursor: onClick ? "pointer" : "default",
      boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
    },
    thumb: {
      width: "100%",
      height: 100,
      objectFit: "cover",
    },
    title: {
      padding: "8px 12px",
      fontSize: 15,
      fontWeight: 600,
      color: "#fff",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    likeWrap: {
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 2,
    },
  };

  return (
    <div style={{ ...styles.card, ...style }} onClick={onClick}>
      <div style={styles.likeWrap}>
        <LikeButton id={id} size={18} />
      </div>
      {image ? (
        <img src={image} alt={title} style={styles.thumb} />
      ) : (
        <div style={{ ...styles.thumb, display: "grid", placeItems: "center", color: "#666" }}>No Image</div>
      )}
      <div style={styles.title}>{title}</div>
    </div>
  );
}