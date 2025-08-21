"use client";

import { createClient } from "@supabase/supabase-js";

import { useMemo, useState } from "react";

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
        background: "linear-gradient(180deg, #1b1b1bff, #090909ff)",
        minHeight: "100dvh",
        color: "#ffffffff",
        padding: "32px",
      },
      headerCapsule: {
        display: "flex",
        alignItems: "center",
        gap: 500,
        margin: "0 auto 32px",
        padding: "5px 25px",
        borderRadius: 23,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
        width: "fit-content",
        userSelect: "none",
        position: "sticky",
        top: 12,
        zIndex: 50,
        backdropFilter: "blur(10px)",
      } as React.CSSProperties,
      headerImage: {
        display: "block",
        width: 140,
        height: "auto",
      } as React.CSSProperties,
      logoMark: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#111",
        fontWeight: 800,
        fontSize: 14,
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
      } as React.CSSProperties,
      burgerBtn: {
        marginLeft: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        color: "white",
        cursor: "pointer",
        fontSize: 24,
      } as React.CSSProperties,
      card: {
        maxWidth: 820,
        margin: "0 auto",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 30,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
      },
      header: {
        padding: "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      },
      body: { padding: "20px 24px" },
      grid2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      },
      label: {
        display: "block",
        fontSize: 13,
        opacity: 0.9,
        marginBottom: 6,
        letterSpacing: 0.2,
      },
      input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        color: "white",
        outline: "none",
      } as React.CSSProperties,
      textarea: {
        width: "100%",
        minHeight: 120,
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        color: "white",
        outline: "none",
        resize: "vertical",
      } as React.CSSProperties,
      select: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        color: "white",
        outline: "none",
      } as React.CSSProperties,
      help: { fontSize: 12, opacity: 0.7, marginTop: 6 },
      buttonRow: {
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginTop: 16,
      },
      button: {
        padding: "8px 16px",
        borderRadius: 25,
        border: "1px solid rgba(255,255,255,0.14)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
        color: "white",
        cursor: "pointer",
        boxShadow: "0 0px 25px rgba(255, 255, 255, 0.09)",
      } as React.CSSProperties,
      danger: { color: "#ff8080", marginTop: 8 },
      success: { color: "#70ffa7", marginTop: 8 },
      hr: {
        height: 1,
        background: "rgba(255,255,255,0.08)",
        border: "none",
        margin: "16px 0",
      },
      sectionTitle: { fontSize: 13, opacity: 0.9, marginBottom: 8 },
      imageGrid: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: 10,
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
        border: "2px dashed rgba(255,255,255,0.3)",
        borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: 32,
        userSelect: "none",
      } as React.CSSProperties,
      checkboxRow: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 8 },
      checkboxLabel: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, opacity: 0.9 },
      footer: {
        marginTop: 40,
        padding: "20px",
        borderRadius: 20,
        textAlign: "center",
        opacity: 0.8,
      } as React.CSSProperties,
    }),
    []
  );

  return (
    <div style={styles.page}>
      <header style={styles.headerCapsule as React.CSSProperties}>
        <img src="/GameCardLogo.png" alt="GameCard placeholder logo" style={styles.headerImage as React.CSSProperties} />
      </header>
      <div style={styles.card as React.CSSProperties}>
        <div style={styles.header}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Submit your game</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.8, fontSize: 14 }}>
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
            <button type="submit" style={styles.button} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </button>
            {ok && <span style={styles.success}>{ok}</span>}
            {err && <span style={styles.danger}>{err}</span>}
          </div>
        </form>
      </div>
      <footer style={styles.footer as React.CSSProperties}>
        2025 GameCard
      </footer>
    </div>
  );
}