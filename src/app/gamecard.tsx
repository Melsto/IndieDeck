"use client";

import React, { useMemo, useRef, useState, useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";

export default function GameCard(props: { isFront?: boolean; data: { id: string; title: string; mainImage: string; previews: string[]; description: string; developer: string; publisher: string; age_rating: string; genre: string; links: Record<string, string>; videoUrl?: string | null; } }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMounted, setLightboxMounted] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showLinks, setShowLinks] = useState(false);
  const [linksVisible, setLinksVisible] = useState(false);
  const linksRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLIFrameElement | null>(null);
  const lightboxTimerRef = useRef<number | null>(null);

  const [showVideo, setShowVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  // Mute state with localStorage persistence and sync
  const MUTE_KEY = "gc_playback_muted_v1";
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false; // default: NOT muted
    try {
      const raw = window.localStorage.getItem(MUTE_KEY);
      return raw === null ? false : JSON.parse(raw) === true;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const readMute = () => {
      try {
        const raw = window.localStorage.getItem(MUTE_KEY);
        setMuted(raw === null ? false : JSON.parse(raw) === true);
      } catch {
        setMuted(false);
      }
    };
    const onStorage = (e: StorageEvent) => { if (e.key === MUTE_KEY) readMute(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Autoplay state with localStorage persistence
  const AUTOPLAY_KEY = "gc_playback_autoplay_v1";
  const [autoplay, setAutoplay] = useState<boolean>(true);

  useEffect(() => {
    const read = () => {
      try {
        const raw = window.localStorage.getItem(AUTOPLAY_KEY);
        setAutoplay(raw === null ? true : JSON.parse(raw) === true);
      } catch {
        setAutoplay(true);
      }
    };
    read();
    const onStorage = (e: StorageEvent) => { if (e.key === AUTOPLAY_KEY) read(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Helper to coerce a possibly JSON-stringified array or array into a single URL string
  const coerceFirstUrl = (raw?: string | string[] | null): string | null => {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw[0] ? String(raw[0]) : null;
    let s = String(raw).trim();
    // If Supabase stored it like "[\"https://...\"]", parse and take first
    if (s.startsWith("[")) {
      try {
        const arr = JSON.parse(s);
        if (Array.isArray(arr) && arr[0]) s = String(arr[0]);
      } catch {}
    }
    // Strip surrounding quotes if present
    s = s.replace(/^"(.*)"$/, "$1");
    return s || null;
  };

// Convert a YouTube watch/shorts/share/embed URL to an embeddable URL.
// YouTube still owns some branding/overlay behavior, but these flags keep it as minimal as possible.
const toYouTubeEmbed = (url?: string | null, muted: boolean = false): string | null => {
  if (!url) return null;
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const api = `enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`;
    // Common params to minimize overlays, keyboard shortcuts, and recommendations.
    const common =
      `autoplay=1&mute=${muted ? 1 : 0}&playsinline=1` +
      `&controls=0` +
      `&rel=0` +
      `&modestbranding=1` +
      `&iv_load_policy=3` +
      `&fs=0&disablekb=1` +
      `&cc_load_policy=0` +
      `&${api}`;

    // Already an embed URL
    if (/youtube\.com\/embed\//i.test(url)) {
      const m = url.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
      const vid = m?.[1];
      const sep = url.includes("?") ? "&" : "?";
      const loop = vid ? `&loop=1&playlist=${vid}` : "";
      return `${url}${sep}${common}${loop}`;
    }

    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    // youtube.com/watch?v=VIDEOID
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}?${common}&loop=1&playlist=${v}`;

      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1])
        return `https://www.youtube-nocookie.com/embed/${parts[1]}?${common}&loop=1&playlist=${parts[1]}`;
    }

    // youtu.be/VIDEOID
    if (host === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id)
        return `https://www.youtube-nocookie.com/embed/${id}?${common}&loop=1&playlist=${id}`;
    }

    return null;
  } catch {
    return null;
  }
};

  const embedSrc = useMemo(() => toYouTubeEmbed(coerceFirstUrl(props.data.videoUrl), muted), [props.data.videoUrl, muted]);
  const shouldShowVideo = Boolean(embedSrc && autoplay && props.isFront !== false);
  const videoVisible = shouldShowVideo && showVideo && videoReady;
  // PostMessage-based mute/unmute control for YouTube iframe
  useEffect(() => {
    const iframe = playerRef.current;
    if (!iframe || !iframe.contentWindow) return;
    // Send mute/unMute command via YouTube IFrame API postMessage
    try {
      const message = JSON.stringify({ event: 'command', func: muted ? 'mute' : 'unMute', args: [] });
      iframe.contentWindow.postMessage(message, '*');
    } catch {}
  }, [muted, showVideo, shouldShowVideo]);

  // Handler for iframe load to re-apply mute/unmute state
  const handlePlayerLoad = () => {
    const iframe = playerRef.current;
    if (!iframe || !iframe.contentWindow) return;
    setVideoReady(true);
    try {
      // Ensure player is muted/unmuted as per setting
      const msg = JSON.stringify({ event: 'command', func: muted ? 'mute' : 'unMute', args: [] });
      iframe.contentWindow.postMessage(msg, '*');
    } catch {}
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[GameCard] raw videoUrl:', props.data.videoUrl);
      console.log('[GameCard] embedSrc:', embedSrc);
    }
  }, [embedSrc, props.data.videoUrl]);

  // Log autoplay state in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[GameCard] autoplay is', autoplay ? 'ON' : 'OFF');
    }
  }, [autoplay]);

  useEffect(() => {
    if (!shouldShowVideo) {
      setShowVideo(false);
      return;
    }
    const t = setTimeout(() => setShowVideo(true), 2000);
    return () => clearTimeout(t);
  }, [shouldShowVideo]);

  useEffect(() => {
    // If src/front/autoplay changes, wait for the player to report loaded again
    setVideoReady(false);
  }, [embedSrc, props.isFront, autoplay]);

  const formatLinkLabel = (key: string) =>
    key
      .replace(/nintendo/i, 'Nintendo')
      .replace(/playstation/i, 'PlayStation')
      .replace(/xbox/i, 'Xbox')
      .replace(/steam/i, 'Steam')
      .replace(/epic(?:\s*games)?/i, 'Epic Games')
      .replace(/itch(?:\.io)?/i, 'itch.io')
      .replace(/gog/i, 'GOG')
      .replace(/(meta[\s-]*quest|oculus)/i, 'Meta Quest');

  const updateFades = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const handleHorizontalWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    if (el.scrollWidth <= el.clientWidth) return;

    const dominantDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (dominantDelta === 0) return;

    el.scrollLeft += dominantDelta;
    e.preventDefault();
  };

  const openLightbox = (index: number) => {
    if (lightboxTimerRef.current !== null) {
      window.clearTimeout(lightboxTimerRef.current);
      lightboxTimerRef.current = null;
    }
    setLightboxIndex(index);
    setLightboxMounted(true);
    setLightboxOpen(true);
    requestAnimationFrame(() => setLightboxVisible(true));
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setLightboxOpen(false);
    if (lightboxTimerRef.current !== null) {
      window.clearTimeout(lightboxTimerRef.current);
    }
    lightboxTimerRef.current = window.setTimeout(() => {
      setLightboxMounted(false);
      lightboxTimerRef.current = null;
    }, 220);
  };

  useEffect(() => {
    updateFades();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateFades();
    el.addEventListener("scroll", onScroll, { passive: true } as any);
    const onResize = () => updateFades();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (lightboxTimerRef.current !== null) {
        window.clearTimeout(lightboxTimerRef.current);
      }
    };
  }, []);


  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % Math.max(1, props.data.previews.length));
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + Math.max(1, props.data.previews.length)) % Math.max(1, props.data.previews.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, props.data.previews.length]);

  useEffect(() => {
    if (!showLinks) {
      setLinksVisible(false);
      return;
    }
    // Start fade-in on next frame
    setLinksVisible(false);
    const raf = requestAnimationFrame(() => {
      setLinksVisible(true);
    });
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (linksRef.current && t && !linksRef.current.contains(t)) {
        setShowLinks(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowLinks(false); };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [showLinks]);

  const MASK_PX = 32;
  const maskBoth = `linear-gradient(to right, transparent 0, black ${MASK_PX}px, black calc(100% - ${MASK_PX}px), transparent 100%)`;
  const maskRight = `linear-gradient(to right, black 0, black calc(100% - ${MASK_PX}px), transparent 100%)`;
  const maskLeft = `linear-gradient(to right, transparent 0, black ${MASK_PX}px, black 100%)`;

  const maskStyle: CSSProperties = (!showLeft && !showRight)
    ? {}
    : showLeft && showRight
    ? {
        WebkitMaskImage: maskBoth,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskImage: maskBoth,
        maskRepeat: "no-repeat",
        maskSize: "100% 100%",
      }
    : showRight
    ? {
        WebkitMaskImage: maskRight,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskImage: maskRight,
        maskRepeat: "no-repeat",
        maskSize: "100% 100%",
      }
    : {
        WebkitMaskImage: maskLeft,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskImage: maskLeft,
        maskRepeat: "no-repeat",
        maskSize: "100% 100%",
      };

  const styles: Record<string, CSSProperties> = {
    card: {
      borderRadius: 50,
      backgroundColor: "rgba(0,0,0,0.5)",
      backgroundImage:
        "linear-gradient(135deg, color-mix(in srgb, rgba(0,0,0,0.5) 88%, #ffffff 20%), color-mix(in srgb, rgba(0,0,0,0.5) 92%, #6e9eff 5%))",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      border: "1px solid color-mix(in srgb, rgba(255, 255, 255, 0.14) 70%, #ffffff 10%)",
      padding: 24,
      width: "500px",
      overflow: "hidden",
      color: "#fff",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      display: "flex",
      flexDirection: "column",
      gap: 9,
    },
    title: {
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: 0.2,
      margin: "4px 6px 6px 6px",
      textShadow: "0 2px 8px rgba(0,0,0,0.35)",
    },
    mainImage: {
      width: "100%",
      height: "275px",
      borderRadius: 22,
      objectFit: "cover",
    },
    mediaWrap: {
      position: "relative",
      width: "100%",
      height: "275px",
      borderRadius: 22,
      overflow: "hidden",
      background: "#050505",
    } as CSSProperties,
    coverImg: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "opacity 450ms ease-in-out",
      opacity: 1,
    } as CSSProperties,
    videoFrame: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      border: 0,
      objectFit: "cover",
      transition: "opacity 450ms ease-in-out",
      opacity: 0,
      pointerEvents: "none",
    } as CSSProperties,
    previewsWrapper: {
      position: "relative",
    },
    previewsRow: {
      display: "flex",
      gap: 12,
      overflowX: "auto",
      paddingBottom: 6,
      scrollSnapType: "x mandatory",
      WebkitOverflowScrolling: "touch",
    },
    previewImage: {
      flex: "0 0 auto",
      width: 190,
      height: 100,
      borderRadius: 18,
      objectFit: "cover",
      scrollSnapAlign: "start",
    },
    infoRow: {
      display: "flex",
      gap: 24,
      alignItems: "flex-start",
      flexWrap: "wrap",
    },
    description: {
      flex: 2,
      fontSize: 15,
      lineHeight: 1.55,
      color: "#e6e6e6",
      height: 120,
      overflowY: "auto",
    },
    details: {
      flex: 1,
      minWidth: 205,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      fontSize: 14,
      color: "#eaeaea",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      paddingBottom: 4,
    },
    divider: {
      width: 1,
      alignSelf: "stretch",
      background: "rgba(255,255,255,0.18)",
      borderRadius: 1,
      margin: "2px 2px",
    },
    label: { opacity: 0.8, fontWeight: 700 },
    value: { opacity: 0.95 },
    detailItem: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      whiteSpace: "nowrap",
      gap: 8,
    },
    footerRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: 10,
      position: "relative",
      justifyContent: "flex-start",
    },
    linkButton: {
      borderRadius: 50,
      padding: "12px 16px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.22)",
      color: "#fff",
      fontSize: 18,
      fontWeight: 700,
      cursor: "pointer",
      width: "150px",
    },
    iconButton: {
      width: 54,
      height: 54,
      borderRadius: 27,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.28)",
      color: "#fff",
      fontSize: 22,
      cursor: "pointer",
    },
    overlayBackdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 4000,
      padding: 20,
    } as CSSProperties,
    overlayBox: {
      position: "relative",
      maxWidth: 440,
      width: "min(92vw, 440px)",
      background: "rgba(20,20,20,0.92)",
      color: "#fff",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.18)",
      boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
      padding: "16px 18px 18px",
    } as CSSProperties,
    lightboxBackdrop: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
      padding: 16,
    } as CSSProperties,
    lightboxImgWrap: {
      position: 'relative',
      maxWidth: '92vw',
      maxHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as CSSProperties,
    lightboxImg: {
      width: 'auto',
      height: '80vh',
      borderRadius: 12,
      objectFit: 'contain',
      boxShadow: '0 18px 48px rgba(0,0,0,0.65)',
    } as CSSProperties,
    lightboxArrow: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 48,
      height: 48,
      borderRadius: 24,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.28)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      userSelect: 'none',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0)',
    } as CSSProperties,
    lightboxClose: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 44,
      height: 44,
      borderRadius: 22,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.28)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      userSelect: 'none',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    } as CSSProperties,
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>{props.data.title}</div>
      <div style={styles.mediaWrap}>
        <img
          src={props.data.mainImage}
          alt="Main header"
          style={{ ...styles.coverImg, opacity: videoVisible ? 0 : 1 }}
        />
        {shouldShowVideo && embedSrc && (
          <iframe
            title={`${props.data.title} video`}
            src={embedSrc}
            ref={playerRef}
            onLoad={handlePlayerLoad}
            // Set src only when visible for better autoplay reliability
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            loading="eager"
            style={{
              ...styles.videoFrame,
              opacity: videoVisible ? 1 : 0,
              pointerEvents: videoVisible ? "auto" : "none",
            }}
          />
        )}
      </div>
      <div style={{ ...styles.previewsWrapper, ...maskStyle }}>
        <div
          ref={scrollerRef}
          className="noScrollbar"
          style={styles.previewsRow}
          aria-label="Screenshots"
          role="list"
          onScroll={updateFades}
          onWheel={handleHorizontalWheel}
        >
          {props.data.previews.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Screenshot ${i + 1}`}
              style={{ ...styles.previewImage, cursor: 'zoom-in' }}
              role="button"
              onClick={() => openLightbox(i)}
            />
          ))}
        </div>
      </div>
      <div style={styles.infoRow}>
        <div style={styles.description} className="noScrollbar">
          <p>{props.data.description}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.details} className="noScrollbar" onWheel={handleHorizontalWheel}>
          <div style={styles.detailItem}>
            <span style={styles.label}>Developer:</span> <span style={styles.value}>{props.data.developer}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>Publisher:</span> <span style={styles.value}>{props.data.publisher}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>Age Rating:</span> <span style={styles.value}>{props.data.age_rating}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>Genre:</span> <span style={styles.value}>{props.data.genre}</span>
          </div>
        </div>
      </div>
      <div style={styles.footerRow}>
        <button
          type="button"
          style={styles.linkButton}
          aria-label="Open Links"
          onClick={() => setShowLinks(true)}
        >
          Links
        </button>
      </div>
      <style jsx>{`
        .noScrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .noScrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {showLinks && (
  <div
    style={{
      ...styles.overlayBackdrop,
      opacity: linksVisible ? 1 : 0,
      transition: "opacity 180ms ease-out",
    }}
  >
    <div
      ref={linksRef}
      style={styles.overlayBox}
      role="dialog"
      aria-modal="true"
      aria-label="Links"
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Links</div>
      {Object.keys(props.data.links || {}).length === 0 ? (
        <div style={{ fontSize: 14, opacity: 0.85 }}>No links available.</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {Object.entries(props.data.links).map(([label, href]) => (
            <li key={formatLinkLabel(label)}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  color: '#fff',
                }}
                onClick={() => setShowLinks(false)}
              >
                <span style={{ fontWeight: 600 }}>{formatLinkLabel(label)}</span>
                <span style={{ opacity: 0.8, fontSize: 12 }}>Open ↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          type="button"
          aria-label="Close"
          onClick={() => setShowLinks(false)}
          style={{
            border: '1px solid rgba(255,255,255,0.28)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            borderRadius: 50,
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      {lightboxMounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            ...styles.lightboxBackdrop,
            opacity: lightboxVisible ? 1 : 0,
            transition: "opacity 220ms ease",
          }}
          onClick={closeLightbox}
        >
          <div
            style={{
              ...styles.lightboxImgWrap,
              opacity: lightboxVisible ? 1 : 0,
              transform: lightboxVisible ? "scale(1) translateY(0)" : "scale(0.97) translateY(10px)",
              transition: "opacity 220ms ease, transform 220ms ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={props.data.previews[lightboxIndex]}
              alt={`Screenshot ${lightboxIndex + 1}`}
              style={{
                ...styles.lightboxImg,
                opacity: lightboxVisible ? 1 : 0,
                transform: lightboxVisible ? "scale(1)" : "scale(1.02)",
                transition: "opacity 220ms ease, transform 220ms ease",
              }}
            />
            <div
              style={{
                ...styles.lightboxArrow,
                left: 30,
                opacity: lightboxVisible ? 1 : 0,
                transition: "opacity 220ms ease, transform 220ms ease",
              }}
              onClick={() => setLightboxIndex((i) => (i - 1 + props.data.previews.length) % props.data.previews.length)}
              aria-label="Previous screenshot"
              role="button"
            >
              ‹
            </div>
            <div
              style={{
                ...styles.lightboxArrow,
                right: 30,
                opacity: lightboxVisible ? 1 : 0,
                transition: "opacity 220ms ease, transform 220ms ease",
              }}
              onClick={() => setLightboxIndex((i) => (i + 1) % props.data.previews.length)}
              aria-label="Next screenshot"
              role="button"
            >
              ›
            </div>
            <div
              style={styles.lightboxClose}
              onClick={closeLightbox}
              aria-label="Close"
              role="button"
            >
              ✕
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}