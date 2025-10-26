"use client";

import React, { useMemo, useState, useRef, useEffect, KeyboardEvent } from "react";

type ExploreMode = "forYou" | "explore";
interface ExploreSwitcherProps {
  value?: ExploreMode;
  onChange?: (value: ExploreMode) => void;
}

export default function ExploreSwitcher({ value, onChange }: ExploreSwitcherProps) {
  const [internal, setInternal] = useState<ExploreMode>("forYou");
  const selected = value ?? internal;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isForYou = selected === "forYou";

  const setSelected = (next: ExploreMode) => {
    if (onChange) onChange(next);
    else setInternal(next);
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setSelected(selected === "forYou" ? "explore" : "forYou");
    }
  };

  return (
    <div className="pill" role="tablist" aria-label="Feed switcher" ref={containerRef} onKeyDown={handleKey}>
      {/* Slider */}
      <span
        className="slider"
        aria-hidden
        style={{ transform: `translateX(${isForYou ? "0%" : "100%"})` }}
      />

      {/* Buttons */}
      <button
        type="button"
        className={`btn ${isForYou ? "active" : ""}`}
        role="tab"
        aria-selected={isForYou}
        onClick={() => setSelected("forYou")}
      >
        For You
      </button>

      <button
        type="button"
        className={`btn ${!isForYou ? "active" : ""}`}
        role="tab"
        aria-selected={!isForYou}
        onClick={() => setSelected("explore")}
      >
        Explore
      </button>

      <style jsx>{`
        .pill {
          position: relative;
          display: flex;
          align-items: stretch;
          width: 180px;
          height: 40px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.08);
          overflow: hidden;
          user-select: none;
          z-index: 1001;
        }
        .slider {
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: #fff;
          border-radius: inherit;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
          transition: transform 180ms ease;
          will-change: transform;
          z-index: 1000;
        }
        .btn {
          flex: 1;
          z-index: 1;
          appearance: none;
          border: none;
          background: transparent;
          padding: 0 18px;
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: rgba(0,0,0,0.6);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          z-index: 1000;
        }
        .btn.active {
          color: #111;
          z-index: 1000;
        }
        .btn:focus-visible {
          box-shadow: inset 0 0 0 2px #000;
          border-radius: 9999px;
          z-index: 1000;
        }
        @media (prefers-color-scheme: dark) {
          .pill {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.1);
            z-index: 1000;
          }
          .slider {
            background: rgba(255,255,255,0.12);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
            z-index: 1000;
          }
          .btn { color: rgba(255,255,255,0.8); }
          .btn.active { color: #fff; }
          .btn:focus-visible { box-shadow: inset 0 0 0 2px #fff;
          z-index: 1000; }
        }
      `}</style>
    </div>
  );
}