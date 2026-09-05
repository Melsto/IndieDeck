"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Game = { id: string; name: string; developer: string; genre: string; images: string[] | null };
type SteamResult = { id: number; name: string; image: string };
const genres = ["Platformer", "Action", "Adventure", "Puzzle", "RPG", "Shooter", "Simulation", "Sports", "Strategy", "Fighting", "Racing", "Horror", "Fantasy", "Sandbox", "Narrative", "Metroidvania", "Rhythm", "Roguelike", "Co-op", "Survival", "VR/AR"];
const platforms = ["steam", "itch", "nintendo", "playstation", "xbox", "metaquest"];
const ageRatings = ["Not Rated", "PEGI 3 / E", "PEGI 7 / E10+", "PEGI 12 / Teen", "PEGI 16 / M17+", "PEGI 18 / AO 18+"];

export default function AdminPanel() {
  const [games, setGames] = useState<Game[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SteamResult[]>([]);
  const [importedImages, setImportedImages] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  async function loadGames() {
    const response = await fetch("/api/admin/games");
    if (!response.ok) { setMessage("Could not load the catalog."); return; }
    setGames((await response.json()).games);
  }
  useEffect(() => { void loadGames(); }, []);
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timeout = window.setTimeout(async () => {
      const response = await fetch(`/api/admin/steam?query=${encodeURIComponent(query)}`);
      if (response.ok) setResults((await response.json()).games);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query]);
  async function importSteamGame(appId: number) {
    setMessage("Loading Steam details...");
    const response = await fetch(`/api/admin/steam?appId=${appId}`);
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "Could not import Steam details."); return; }
    const form = formRef.current;
    if (!form) return;
    for (const [field, value] of Object.entries(data.game)) {
      if (field === "images" || field === "genre") continue;
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement | null;
      if (input) input.value = String(value);
    }
    const genre = form.elements.namedItem("genre") as HTMLSelectElement;
    if (genres.includes(data.game.genre)) genre.value = data.game.genre;
    setImportedImages(data.game.images);
    setQuery(""); setResults([]); setMessage("Steam details imported. Review and add the game when ready.");
  }
  async function addGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/admin/games", { method: "POST", body: new FormData(event.currentTarget) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error ?? "Could not add game.");
    else { event.currentTarget.reset(); setImportedImages([]); setMessage("Game added to the deck."); await loadGames(); }
    setSaving(false);
  }
  async function removeGame(id: string) {
    if (!window.confirm("Remove this game from the deck?")) return;
    const response = await fetch("/api/admin/games", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!response.ok) { setMessage("Could not remove game."); return; }
    setGames((current) => current.filter((game) => game.id !== id));
  }
  return <main className="admin-shell"><div className="admin-layout"><section><p className="admin-kicker">IndieDeck catalog</p><h1>Manage games</h1><div className="steam-import"><label>Find on Steam<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a game title" /></label>{results.length > 0 && <div className="steam-results">{results.map((result) => <button type="button" key={result.id} onClick={() => void importSteamGame(result.id)}>{result.image && <img src={result.image} alt="" />}<span>{result.name}</span></button>)}</div>}</div><form ref={formRef} className="admin-form" onSubmit={addGame}>
    <input name="imported_images" type="hidden" value={JSON.stringify(importedImages)} /><div className="admin-grid"><label>Game ID<input name="id" placeholder="your-game" pattern="[a-z0-9-]+" required /></label><label>Title<input name="name" required /></label></div><label>Description<textarea name="description" maxLength={200} required /></label><div className="admin-grid"><label>Developer<input name="developer" required /></label><label>Publisher<input name="publisher" /></label></div><div className="admin-grid"><label>Genre<select name="genre" defaultValue="" required><option value="" disabled>Select a genre</option>{genres.map((genre) => <option key={genre}>{genre}</option>)}</select></label><label>Age rating<select name="age_rating" defaultValue="Not Rated">{ageRatings.map((rating) => <option key={rating}>{rating}</option>)}</select></label></div><label>Trailer URL<input name="videourl" type="url" placeholder="https://www.youtube.com/watch?v=..." /></label><label>Cover and screenshots<input name="images" type="file" accept="image/*" multiple /></label>{importedImages.length > 0 && <div className="imported-images">{importedImages.map((image) => <img key={image} src={image} alt="Imported from Steam" />)}</div>}<fieldset><legend>Store links</legend><div className="admin-grid">{platforms.map((platform) => <label key={platform}>{platform}<input name={platform} type="url" placeholder="https://..." /></label>)}</div></fieldset><button className="admin-primary" disabled={saving}><Plus size={18} />{saving ? "Adding..." : "Add game"}</button>{message && <p className="admin-message">{message}</p>}
  </form></section><aside><h2>Current catalog</h2><p className="admin-count">{games.length} games</p><div className="admin-games">{games.map((game) => <article key={game.id} className="admin-game">{game.images?.[0] ? <img src={game.images[0]} alt="" /> : <div className="admin-image-placeholder" />}<div><strong>{game.name}</strong><span>{game.developer} · {game.genre}</span></div><button className="admin-delete" title={`Remove ${game.name}`} onClick={() => void removeGame(game.id)}><Trash2 size={17} /></button></article>)}</div></aside></div></main>;
}