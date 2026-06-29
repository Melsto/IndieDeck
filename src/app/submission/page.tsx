"use client";

import { createClient } from "@supabase/supabase-js";

import { useMemo, useState } from "react";

import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseBucket = (process.env.NEXT_PUBLIC_SUPABASE_BUCKET as string) || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Links = {
  steam?: string;
  itch?: string;
  nintendo?: string; // Nintendo eShop
  playstation?: string;
  xbox?: string;
  metaquest?: string;
};

type Submission = {
  id: string;
  name: string;
  images: string[];
  description: string;
  publisher?: string | null;
  developer: string;
  age_rating: string; // e.g. "Not Rated", "PEGI 12", etc.
  genre: string;
  links: Links;
  email: string;
  rights_confirmed: boolean;
  videourl?: string; // required YouTube trailer URL
};

const AGE_OPTIONS = [
  "Not Rated",
  "PEGI 3 / E",
  "PEGI 7 / E10+",
  "PEGI 12 / Teen",
  "PEGI 16 / M17+",
  "PEGI 18 / AO 18+",
];

const GENRE_OPTIONS = [
  "Choose a Genre",
  "Platformer",
  "Action",
  "Adventure",
  "Puzzle",
  "RPG",
  "Shooter",
  "Simulation",
  "Sports",
  "Strategy",
  "Fighting",
  "Racing",
  "Horror",
  "Fantasy",
  "Sandbox",
  "Narrative",
  "Metroidvania",
  "Rhythm",
  "Roguelike",
  "Co-op",
  "Survival",
  "VR/AR",
];

const PLATFORM_OPTIONS = [
  { key: "steam", label: "Steam" },
  { key: "itch", label: "Itch.io" },
  { key: "nintendo", label: "Nintendo eShop" },
  { key: "playstation", label: "PlayStation" },
  { key: "xbox", label: "Xbox" },
  { key: "metaquest", label: "Meta Quest" },
  
] as const;

const wrap = (cls: string, extra?: string) =>
  [cls, extra].filter(Boolean).join(" ");

export default function SubmitPage() {
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [platformChecks, setPlatformChecks] = useState<Record<string, boolean>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const id = String(fd.get("id") || "").trim();
    const name = String(fd.get("name") || "").trim();
    const description = String(fd.get("description") || "").trim();
    const developer = String(fd.get("developer") || "").trim();
    const publisher =
      String(fd.get("publisher") || "").trim() || null;
    const age_rating = String(fd.get("age_rating") || "Not Rated");
    const genre = String(fd.get("genre") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const rights_confirmed = fd.get("rights_confirmed") === "on";
    const videourl = String(fd.get("videourl") || "").trim();

    const links: Links = {};
    PLATFORM_OPTIONS.forEach(({ key }) => {
      const v = String(fd.get(key) || "").trim();
      if (v) (links as any)[key] = v;
    });

    // minimal validation
    if (!id || !name || !description || !developer || !genre) {
      setErr("Please fill all required fields.");
      return;
    }
    if (!email) {
      setErr("Please provide your email.");
      return;
    }
    if (!rights_confirmed) {
      setErr("You must confirm that you hold the rights to submit this game.");
      return;
    }
    // require at least one store link
    if (Object.keys(links).length === 0) {
      setErr("Please provide at least one store link.");
      return;
    }
    // collect image files from the 5 inputs (some may be empty)
    const files: File[] = [];
    for (let i = 1; i <= 5; i++) {
      const f = fd.get(`image${i}`) as File | null;
      if (f && typeof f !== "string" && f.size > 0) files.push(f);
    }
    if (files.length === 0) {
      setErr("Please add at least one image.");
      return;
    }

    // prepare folder path in Storage bucket <bucket>/GameCardFootage/<id>/
    const bucket = supabaseBucket; // e.g. "gamecard-data" (bucket IDs cannot contain spaces)
    const folder = `GameCardFootage/${id}`; // one folder per game id, under GameCardFootage
    if (!bucket) {
      setErr("Storage bucket id missing. Define NEXT_PUBLIC_SUPABASE_BUCKET in .env.local");
      return;
    }

    setSubmitting(true);
    try {
      // upload each file and collect its public URL
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const path = `${folder}/${Date.now()}_${i}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        uploadedUrls.push(pub.publicUrl);
      }

      const payload: Submission = {
        id,
        name,
        images: uploadedUrls,
        description,
        publisher,
        developer,
        age_rating,
        genre,
        links,
        email,
        rights_confirmed,
        videourl,
      };

      // insert row into submissions table
      const { error: dbErr } = await supabase
        .from("submissions")
        .insert([payload]);
      if (dbErr) throw dbErr;

      setOk("Submitted. Thank you!");
      (e.currentTarget as HTMLFormElement).reset();
      setImagePreviews([null, null, null, null, null]);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // Simple, pleasant styles without Tailwind
  const styles = useMemo(
    () => ({
      page: {
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        background: "#111",
        minHeight: "100dvh",
        color: "#fff",
        padding: "0",
      },
      logoRow: {
        display: "flex",
        alignItems: "center",
        height: 64,
        padding: "0 0 0 32px",
        marginBottom: 28,
      } as React.CSSProperties,
      logo: {
        position: "absolute",
        top: 0,
        left: 35,
        zIndex: 2001,
        pointerEvents: "auto",
        maxWidth: '100%',
      } as React.CSSProperties,
      container: {
        maxWidth: 750,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "90px 16px 24px 16px",
        background: "none",
      } as React.CSSProperties,
      card: {
        width: "100%",
        background: "#181818",
        border: "1px solid #232323",
        borderRadius: 12,
        boxShadow: "none",
        padding: 0,
      } as React.CSSProperties,
      header: {
        padding: "24px 28px 24px 28px",
        borderBottom: "1px solid #232323",
      } as React.CSSProperties,
      body: { padding: "20px 28px 28px 28px" },
      grid2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      },
      label: {
        display: "block",
        fontSize: 15,
        fontWeight: 700,
        color: "#fff",
        marginBottom: 7,
        letterSpacing: 0.1,
      },
      input: {
        width: "100%",
        padding: "10px 13px",
        borderRadius: 6,
        border: "1px solid #222",
        background: "#181818",
        color: "#fff",
        outline: "none",
        fontSize: 15,
        marginBottom: 0,
      } as React.CSSProperties,
      textarea: {
        width: "100%",
        minHeight: 120,
        padding: "10px 13px",
        borderRadius: 6,
        border: "1px solid #222",
        background: "#181818",
        color: "#fff",
        outline: "none",
        resize: "vertical",
        fontSize: 15,
      } as React.CSSProperties,
      select: {
        width: "100%",
        padding: "10px 13px",
        borderRadius: 6,
        border: "1px solid #222",
        background: "#181818",
        color: "#fff",
        outline: "none",
        fontSize: 15,
      } as React.CSSProperties,
      help: { fontSize: 12, opacity: 0.7, marginTop: 6, color: "#fff" },
      buttonRow: {
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginTop: 18,
      },
      button: {
        height: 44,
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.22)',
        background: '#ef7f2a',
        color: '#ffffffff',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none' as const,
        textDecoration: 'none',
        width: "100px",
      } as React.CSSProperties,
      buttonHover: {
        background: "#ff9a4dff",
      } as React.CSSProperties,
      danger: { color: "#ff4c4c", marginTop: 8, fontWeight: 600 },
      success: { color: "#70ffa7", marginTop: 8, fontWeight: 600 },
      hr: {
        height: 1,
        background: "#232323",
        border: "none",
        margin: "16px 0",
      },
      sectionTitle: { fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 },
      imageGrid: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: 0,
      } as React.CSSProperties,
      largeImage: {
        gridRow: "span 2",
        gridColumn: "1",
      } as React.CSSProperties,
      hiddenInput: {
        display: "none",
      } as React.CSSProperties,
      imageLabel: {
        width: "100%",
        aspectRatio: "1",
        border: "2px dashed #232323",
        borderRadius: 6,
        background: "#141414",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#363636",
        fontSize: 32,
        userSelect: "none",
        overflow: "hidden",
      } as React.CSSProperties,
      checkboxRow: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 8 },
      checkboxLabel: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "#fff", fontWeight: 600 },
      footer: {
        marginTop: 40,
        padding: "18px 0 30px 0",
        borderRadius: 0,
        textAlign: "center",
        opacity: 1,
        color: "#bbb",
        fontSize: 13,
        width: "100%",
      } as React.CSSProperties,
      footerLink: {
        color: "#bbb",
        textDecoration: "underline",
        fontWeight: 500,
      } as React.CSSProperties,
    }),
    []
  );

  // Button hover state (minimal, since no CSS-in-JS hover, but can use onMouseEnter/Leave)
  const [btnHover, setBtnHover] = useState(false);

  return (
    <div style={styles.page}>
      <div style={styles.logo}>
        <a href="/">
          <img
            src="/logo.svg"
            alt="Logo"
            style={{ width: '110px', height: '90px', display: 'block', pointerEvents: 'auto' }}
          />
        </a>
      </div>
      <div style={styles.container as React.CSSProperties}>
        <div style={styles.card as React.CSSProperties}>
          <div style={styles.header}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>
              Submit your game
            </h1>
            <p style={{ margin: "6px 0 0", opacity: 0.8, fontSize: 14, color: "#fff" }}>
              Fill the fields below. Required fields are marked with *
            </p>
          </div>
          <form style={styles.body} onSubmit={onSubmit}>
          {/* ID + Name */}
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>ID*</label>
              <input
                name="id"
                placeholder="your-game"
                style={styles.input}
                required
              />
              <div style={styles.help}>
                Lowercase letters, numbers, and dashes.
              </div>
            </div>

            <div>
              <label style={styles.label}>Name*</label>
              <input name="name" placeholder="Your Game" style={styles.input} required />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginTop: 16 }}>
            <label style={styles.label}>Description*</label>
            <textarea
              name="description"
              placeholder="Short pitch of the game… (max 200 characters)"
              style={styles.textarea}
              required
              maxLength={200}
            />
          </div>

          {/* Developer / Publisher */}
          <div style={{ ...styles.grid2, marginTop: 16 }}>
            <div>
              <label style={styles.label}>Developer*</label>
              <input name="developer" style={styles.input} required />
            </div>
            <div>
              <label style={styles.label}>Publisher (optional)</label>
              <input name="publisher" style={styles.input} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginTop: 16 }}>
            <label style={styles.label}>Email*</label>
            <input type="email" name="email" placeholder="you@example.com" style={styles.input} required />
          </div>

          {/* Age / Genre */}
          <div style={{ ...styles.grid2, marginTop: 16 }}>
            <div>
              <label style={styles.label}>Age rating</label>
              <select name="age_rating" defaultValue="Not Rated" style={styles.select}>
                {AGE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Genre*</label>
              <select name="genre" style={styles.select} required>
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Images */}
          <div style={{ marginTop: 16 }}>
            <label style={styles.label}>Cover + Screenshots* (16:9)</label>
            <div style={styles.imageGrid}>
              {[1, 2, 3, 4, 5].map((num) => {
                const inputElement = (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      name={`image${num}`}
                      id={`image${num}`}
                      style={styles.hiddenInput}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setImagePreviews((prev) => {
                            const next = [...prev];
                            next[num - 1] = url;
                            return next;
                          });
                        }
                      }}
                    />
                    <label htmlFor={`image${num}`} style={styles.imageLabel}>
                      {imagePreviews[num - 1] ? (
                        <img src={imagePreviews[num - 1] as string} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                      ) : (
                        "+"
                      )}
                    </label>
                  </>
                );
                if (num === 1) {
                  return (
                    <div key={num} style={styles.largeImage}>
                      {inputElement}
                    </div>
                  );
                }
                return <div key={num}>{inputElement}</div>;
              })}
            </div>
          </div>

                    {/* Game Trailer (required) */}
          <div style={{ marginTop: 12 }}>
            <label style={styles.label}>Game Trailer (YouTube link)</label>
            <input
              name="videourl"
              placeholder="https://www.youtube.com/watch?v=..."
              style={styles.input}
              type="url"
              pattern="https?://.+"
            />
            <div style={styles.help}>Add a YouTube link to your trailer.</div>
          </div>

          <hr style={styles.hr} />
          <div style={styles.sectionTitle}>Store links* (at least one)</div>

          <div style={styles.checkboxRow as React.CSSProperties}>
            {PLATFORM_OPTIONS.map(({ key, label }) => (
              <label key={key} style={styles.checkboxLabel as React.CSSProperties}>
                <input
                  type="checkbox"
                  checked={!!platformChecks[key]}
                  onChange={(e) =>
                    setPlatformChecks((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <div style={{ ...styles.grid2, marginTop: 8 }}>
            {PLATFORM_OPTIONS.filter(({ key }) => platformChecks[key]).map(({ key, label }) => (
              <div key={key}>
                <label style={styles.label}>{label} URL</label>
                <input name={key} placeholder={`https://...`} style={styles.input} />
              </div>
            ))}
          </div>

          {/* Rights confirmation */}
          <div style={{ marginTop: 16 }}>
            <label style={styles.checkboxLabel as React.CSSProperties}>
              <input type="checkbox" name="rights_confirmed" required />
              I declare that I am the creator of the submitted game or have the necessary rights to submit and publish it.
            </label>
          </div>

          <div style={styles.buttonRow}>
            <button
              type="submit"
              style={{
                ...(styles.button as React.CSSProperties),
                ...(btnHover ? (styles.buttonHover as React.CSSProperties) : {}),
              }}
              disabled={submitting}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
            {ok && <span style={styles.success}>{ok}</span>}
            {err && <span style={styles.danger}>{err}</span>}
          </div>
        </form>
        </div>
      </div>
      <footer style={styles.footer as React.CSSProperties}>
        <a href="/data" style={styles.footerLink as React.CSSProperties}>
          Impressum, Datenschutz und Takedown Policy
        </a>{" "}
        · 2025 IndieDeck
      </footer>
    </div>
  );
}