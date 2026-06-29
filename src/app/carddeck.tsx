"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useLikes } from "./likestore";

const SEEN_KEY = "gc_seen_v1";
function readSeen(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try { const raw = window.localStorage.getItem(SEEN_KEY); return raw ? new Set(JSON.parse(raw)) : new Set(); } catch { return new Set(); }
}
function writeSeen(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids))); } catch {}
}

export type DeckRenderCtx = { index: number; isFront: boolean; isBack: boolean };

const FLING_MS = 320; // keep JS timeout and CSS transition in sync

export default function DraggableCard({ children, onSwiped, interactive = true, onDrag, onDragEnd }: { children: React.ReactNode; onSwiped: (dir: "left" | "right") => void; interactive?: boolean; onDrag?: (x: number, y: number) => void; onDragEnd?: () => void }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const [style, setStyle] = useState<React.CSSProperties>({
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
  });

  const threshold = () => (typeof window !== "undefined" ? Math.min(220, window.innerWidth * 0.28) : 200);

  const disableGlobalSelection = () => {
    try {
      const root = document.documentElement as HTMLElement;
      (root.style as any).userSelect = "none";
      (root.style as any).webkitUserSelect = "none";
    } catch {}
  };
  const enableGlobalSelection = () => {
    try {
      const root = document.documentElement as HTMLElement;
      root.style.removeProperty("user-select");
      root.style.removeProperty("-webkit-user-select");
    } catch {}
  };

  const setTransform = (x: number, y: number, withTransition = false) => {
    const rot = x / 20; // small rotation based on x drag
    setStyle((s) => ({
      ...s,
      transition: withTransition ? `transform ${FLING_MS}ms ease-out` : "none",
      transform: `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`,
    }));
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dragging.current = true;
    onDrag?.(pos.current.x, pos.current.y);
    disableGlobalSelection();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y };
  };
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current) return;
    pos.current.x = e.clientX - start.current.x;
    pos.current.y = e.clientY - start.current.y;
    setTransform(pos.current.x, pos.current.y);
    onDrag?.(pos.current.x, pos.current.y);
  };
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current) return;
    enableGlobalSelection();
    dragging.current = false;
    const t = threshold();
    const x = pos.current.x;
    const y = pos.current.y;
    // decide swipe
    if (Math.abs(x) > t) {
      const dir: "left" | "right" = x > 0 ? "right" : "left";
      // fling off-screen
      const offX = (Math.sign(x) || 1) * (window.innerWidth + 400);
      setTransform(offX, y, true);
      // after animation, notify parent to remove card
      setTimeout(() => onSwiped(dir), FLING_MS);
      onDragEnd?.();
    } else {
      // snap back
      pos.current = { x: 0, y: 0 };
      setTransform(0, 0, true);
      onDragEnd?.();
    }
  };

  const endDrag = () => {
    dragging.current = false;
    enableGlobalSelection();
  };
  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = () => {
    if (!dragging.current) return;
    endDrag();
    pos.current = { x: 0, y: 0 };
    setTransform(0, 0, true);
    onDragEnd?.();
  };
  const onPointerLeave: React.PointerEventHandler<HTMLDivElement> = () => {
    if (!dragging.current) return;
    endDrag();
    const t = threshold();
    const { x, y } = pos.current;
    if (Math.abs(x) > t) {
      const dir: "left" | "right" = x > 0 ? "right" : "left";
      const offX = (Math.sign(x) || 1) * (window.innerWidth + 400);
      setTransform(offX, y, true);
      setTimeout(() => onSwiped(dir), FLING_MS);
      onDragEnd?.();
    } else {
      pos.current = { x: 0, y: 0 };
      setTransform(0, 0, true);
      onDragEnd?.();
    }
  };

  return (
    <div
      ref={elRef}
      onPointerDown={interactive ? onPointerDown : undefined}
      onPointerMove={interactive ? onPointerMove : undefined}
      onPointerUp={interactive ? onPointerUp : undefined}
      onPointerCancel={interactive ? onPointerCancel : undefined}
      onPointerLeave={interactive ? onPointerLeave : undefined}
      onDragStart={interactive ? (e) => e.preventDefault() : undefined}
      style={style}
      aria-label={interactive ? "Draggable card" : "Card"}
    >
      {children}
    </div>
  );
}

function shuffleArray<T>(src: T[]): T[] {
  const a = [...src];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Deck({ items, renderCard }: { items: any[]; renderCard: (item: any, ctx?: DeckRenderCtx) => React.ReactNode }) {
  const [stack, setStack] = useState(items);
  const { like, unlike } = useLikes();

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [releaseDir, setReleaseDir] = useState<null | "left" | "right">(null);

  const [seen, setSeen] = useState<Set<string>>(() => readSeen());

  const t = typeof window !== 'undefined' ? Math.min(220, window.innerWidth * 0.28) : 200;

  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === SEEN_KEY) setSeen(readSeen()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    // Only filter against the persisted seen set when items change,
    // so current top card doesn't disappear mid-session when we mark it seen.
    const persistedSeen = readSeen();
    const filtered = (items || []).filter((it: any) => {
      const id = it?.id != null ? String(it.id) : undefined;
      return !id || !persistedSeen.has(id);
    });
    setStack(shuffleArray(filtered));
  }, [items]);

  const handleSwiped = useCallback((dir: "left" | "right") => {
    setStack((s) => {
      const top = s[s.length - 1];
      const id = top?.id != null ? String(top.id) : undefined;

      if (id) {
        // Defer side-effects until after render to satisfy React rules
        setTimeout(() => {
          try {
            if (dir === "left") {
              like(id);
              console.log("[Deck] Liked via swipe left:", id);
            } else {
              unlike(id);
              console.log("[Deck] Unliked via swipe right:", id);
            }
          } catch {}
          // Mark as seen only after a confirmed swipe away
          try {
            const next = new Set(seen);
            next.add(id);
            setSeen(next);
            writeSeen(next);
          } catch {}
        }, 0);
      }

      // Remove the top card from the stack
      return s.slice(0, -1);
    });
  }, [like, unlike, seen]);

  const absX = Math.abs(dragX);
  const progress = Math.max(0, Math.min(1, absX / (t || 200)));
  const liveDir: null | "left" | "right" = dragging && absX > 6 ? (dragX < 0 ? "left" : "right") : null;
  const liveScale = 0.8 + 0.4 * progress; // bouncy-ish scale while dragging
  const liveOpacity = progress * 0.95;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (!stack.length) return;
        const dir: "left" | "right" = e.key === "ArrowLeft" ? "left" : "right";
        // Show the same release icon animation as a drag swipe
        setReleaseDir(dir);
        setTimeout(() => setReleaseDir(null), 380);
        handleSwiped(dir);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSwiped, stack.length]);

  return (
    <div
      style={{
        position: "relative",
        width: "min(760px, 90vw)",
        height: 860,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {(() => {
        const count = stack.length;
        const start = Math.max(0, count - 2); // render only last two
        const visible = stack.slice(start, count);
        return visible.map((item, localIdx) => {
          const isTop = localIdx === visible.length - 1; // last in visible is the top
          // Compute global idx for stable z-index and key
          const globalIdx = start + localIdx;
          const z = 100 + globalIdx;
          return (
            <div
              key={(item.id ?? item.title ?? "card")}
              data-front={isTop ? 'true' : 'false'}
              data-back={isTop ? 'false' : 'true'}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                transform: `translateY(${isTop ? 0 : 12}px)`, // second sits lower, animates up when it becomes top
                transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)", // ease-out
                willChange: "transform",
                zIndex: z,
                pointerEvents: isTop ? "auto" : "none",
              }}
            >
              {isTop ? (
                <DraggableCard
                  onSwiped={handleSwiped}
                  interactive
                  onDrag={(x) => { setDragging(true); setDragX(x); }}
                  onDragEnd={() => {
                    const abs = Math.abs(dragX);
                    setDragging(false);
                    if (abs > 25) {
                      const dir: "left" | "right" = dragX < 0 ? "left" : "right";
                      setReleaseDir(dir);
                      // Play fade/scale-out, then clear symbol
                      setTimeout(() => setReleaseDir(null), 380);
                    }
                    setDragX(0);
                  }}
                >
                  <div className="cardFrame">{renderCard(item, { index: globalIdx, isFront: true, isBack: false })}</div>
                </DraggableCard>
              ) : (
                <DraggableCard onSwiped={handleSwiped} interactive={false}>
                  <div className="cardFrame">{renderCard(item, { index: globalIdx, isFront: false, isBack: true })}</div>
                </DraggableCard>
              )}
            </div>
          );
        });
      })()}
      {liveDir && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "40%",
            transform: `translate(-50%, -50%) scale(${liveScale})`,
            zIndex: 9998,
            pointerEvents: "none",
            fontSize: 96,
            fontWeight: 800,
            color: liveDir === "left" ? "#ff5a7a" : "#ffffff",
            textShadow: "0 10px 40px rgba(0,0,0,0.6)",
            opacity: liveOpacity,
            transition: "transform 90ms cubic-bezier(0.34,1.56,0.64,1), opacity 90ms ease",
          }}
          aria-hidden
        >
          {liveDir === "left" ? "♥" : "✕"}
        </div>
      )}
      {releaseDir && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%) scale(1)",
            zIndex: 9999,
            pointerEvents: "none",
            fontSize: 96,
            fontWeight: 800,
            color: releaseDir === "left" ? "#ff5a7a" : "#ffffff",
            textShadow: "0 10px 40px rgba(0,0,0,0.6)",
            opacity: 0.95,
            animation: "releaseOut 360ms ease-out forwards",
          }}
          aria-hidden
        >
          {releaseDir === "left" ? "♥" : "✕"}
        </div>
      )}
      <style jsx>{`
        .cardFrame {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          /* Prevent top-margin collapse and keep baseline consistent */
          padding-top: 1px;
          margin-top: -1px;
          overflow: hidden;
        }
        .cardFrame :global(h1),
        .cardFrame :global(h2),
        .cardFrame :global(h3),
        .cardFrame :global(h4),
        .cardFrame :global(p) {
          margin-top: 0;
        }
        @keyframes releaseOut {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.95; }
          60% { transform: translate(-50%, -50%) scale(1.22); opacity: 0.55; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
