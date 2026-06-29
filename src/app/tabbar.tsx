"use client";

import React, { useMemo, type CSSProperties } from "react";
import { RectangleVertical, Heart, User, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  // Describe tabs with their target routes so we can both render and navigate from one source of truth
  const items = [
    { label: "Cards", icon: <RectangleVertical size={20} />, href: "/" },
    { label: "Liked", icon: <Heart size={20} />, href: "/liked" },
    { label: "You", icon: <User size={20} />, href: "/you" },
  ] as const;

  const isActive = (href: string) => {
    // Exact match for home; prefix match for nested routes like /liked/...
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };
  const styles: Record<string, CSSProperties> = {
    sidebar: {
      position: "fixed",
      bottom: "2%",
      width: "80%",
      maxWidth: "500px",
      height: "70px",
      backgroundColor: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      borderTop: "1px solid rgba(255,255,255,0.14)",
      borderRadius: "50px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      zIndex: 2000,
    },
    container: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 8,
      width: "100%",
      color: "#fff",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    },
    item: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontSize: 12,
      opacity: 0.85,
      cursor: "pointer",
      flex: 1,
      padding: "8px 12px",
      borderRadius: 30,
      marginLeft: 8,
      marginRight: 8,
    },
    activeItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      cursor: "pointer",
      flex: 1,
      opacity: 1,
      color: "#ef7f2a",
      background: "#4242427e",
      borderRadius: 30,
      padding: "8px 12px",
      marginLeft: 8,
      marginRight: 8,
      height: "57px",
      borderTop: "1px solid rgba(255,255,255,0.14)",
    },
    icon: {
      width: 28,
      height: 28,
      borderRadius: 6,
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 0,
      fontSize: 16,
    },
    activeIcon: {
      width: 28,
      height: 28,
      borderRadius: 6,
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
      fontSize: 16,
      color: "#ef7f2a",
    },
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.container}>
        {items.map((item) => (
          <div
            key={item.label}
            style={isActive(item.href) ? styles.activeItem : styles.item}
            onClick={() => router.push(item.href)}
          >
            <div style={isActive(item.href) ? styles.activeIcon : styles.icon}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}