"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setError("");
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (response.ok) window.location.assign("/admin");
    else { setError((await response.json()).error ?? "Could not sign in."); setSubmitting(false); }
  }
  return <main className="admin-shell"><form className="admin-login" onSubmit={submit}><p className="admin-kicker">IndieDeck</p><h1>Admin sign in</h1><label>Password<input name="password" type="password" autoComplete="current-password" required autoFocus /></label>{error && <p className="admin-error">{error}</p>}<button disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button></form></main>;
}