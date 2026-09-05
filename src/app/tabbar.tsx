"use client";

import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { RectangleVertical, Heart, User, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

type PillState = {
  left: number;
  width: number;
};

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pill, setPill] = useState<PillState>({ left: 0, width: 0 });

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

  const activeIndex = Math.max(0, items.findIndex((item) => isActive(item.href)));
  const targetIndex = hoveredIndex ?? activeIndex;

  useEffect(() => {
    const updatePill = (index: number) => {
      const container = containerRef.current;
      const target = itemRefs.current[index];
      if (!container || !target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      setPill({
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
      });
    };

    updatePill(targetIndex);

    const onResize = () => updatePill(targetIndex);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [targetIndex, pathname]);

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
      overflow: "hidden",
    },
    container: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 8,
      width: "100%",
      color: "#fff",
      position: "relative",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    },
    indicator: {
      position: "absolute",
      top: "7.5%",
      left: 0,
      height: "85%",
      width: pill.width,
      transform: `translateX(${pill.left}px)`,
      transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1), width 240ms cubic-bezier(0.22, 1, 0.36, 1)",
      borderRadius: 999,
      background: "#4242427e",
      border: "1px solid rgba(255,255,255,0.14)",
      pointerEvents: "none",
      zIndex: 0,
      opacity: pill.width > 0 ? 1 : 0,
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
      position: "relative",
      zIndex: 1,
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
      borderRadius: 30,
      padding: "8px 12px",
      marginLeft: 8,
      marginRight: 8,
      position: "relative",
      zIndex: 1,
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
    <div style={styles.sidebar} ref={containerRef} onMouseLeave={() => setHoveredIndex(null)}>
      <div style={styles.container}>
        <div style={styles.indicator} />
        {items.map((item) => (
          <div
            key={item.label}
            ref={(node) => {
              itemRefs.current[items.findIndex((entry) => entry.label === item.label)] = node;
            }}
            style={isActive(item.href) ? styles.activeItem : styles.item}
            onClick={() => router.push(item.href)}
            onMouseEnter={() => setHoveredIndex(items.findIndex((entry) => entry.label === item.label))}
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