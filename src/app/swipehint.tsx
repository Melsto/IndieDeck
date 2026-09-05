"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

export default function SwipeHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style jsx>{`
        @keyframes swipeHintFade {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(8px) scale(0.98);
          }
          10% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(8px) scale(0.98);
          }
        }

        @keyframes swipeHintPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 104,
          transform: "translateX(-50%)",
          zIndex: 3400,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 16px",
          borderRadius: 999,
          background:
            "linear-gradient(180deg, rgba(14,14,14,0.88) 0%, rgba(20,20,20,0.8) 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          boxShadow: "0 18px 45px rgba(0,0,0,0.38)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: "swipeHintFade 5s ease forwards",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: "rgba(239,127,42,0.16)",
            border: "1px solid rgba(239,127,42,0.24)",
            color: "#ef7f2a",
            flex: "0 0 auto",
            animation: "swipeHintPulse 1.2s ease-in-out infinite",
          }}
        >
          <ArrowLeftRight size={16} strokeWidth={2.5} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, lineHeight: 1.15 }}>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.2 }}>Swipe the cards</span>
          <span style={{ fontSize: 11, color: "#d7d7d7", opacity: 0.9 }}>Drag left or right.</span>
        </div>
      </div>
    </>
  );
}