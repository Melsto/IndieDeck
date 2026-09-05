import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { adminSupabase, storageBucket } from "@/lib/admin-supabase";

const platforms = ["steam", "itch", "nintendo", "playstation", "xbox", "metaquest"];
const unauthorized = () => NextResponse.json({ error: "Unauthorized." }, { status: 401 });

export async function GET() {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const { data, error } = await adminSupabase().from("games").select("id,name,developer,genre,images").order("name");
    if (error) throw error;
    return NextResponse.json({ games: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load games." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const form = await request.formData();
    const id = String(form.get("id") ?? "").trim().toLowerCase();
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const developer = String(form.get("developer") ?? "").trim();
    const publisher = String(form.get("publisher") ?? "").trim() || null;
    const age_rating = String(form.get("age_rating") ?? "Not Rated");
    const genre = String(form.get("genre") ?? "").trim();
    const videourl = String(form.get("videourl") ?? "").trim() || null;
    if (!/^[a-z0-9-]+$/.test(id) || !name || !description || !developer || !genre) {
      return NextResponse.json({ error: "Complete all required fields. The ID may use lowercase letters, numbers, and dashes." }, { status: 400 });
    }
    const links: Record<string, string> = {};
    for (const platform of platforms) {
      const value = String(form.get(platform) ?? "").trim();
      if (value) links[platform] = value;
    }
    if (!Object.keys(links).length) return NextResponse.json({ error: "Add at least one store link." }, { status: 400 });

    const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    const importedImages = JSON.parse(String(form.get("imported_images") ?? "[]"));
    const remoteImages = Array.isArray(importedImages) ? importedImages.filter((value): value is string => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" && url.hostname.endsWith("steamstatic.com");
      } catch { return false; }
    }) : [];
    if (!files.length && !remoteImages.length) return NextResponse.json({ error: "Add at least one image or import a Steam game." }, { status: 400 });

    const supabase = adminSupabase();
    const bucket = storageBucket();
    const images: string[] = [...remoteImages];
    for (const [index, file] of files.entries()) {
      const filename = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const path = `GameCardFootage/${id}/${Date.now()}_${index}_${filename}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      images.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    }
    const { error } = await supabase.from("games").insert({ id, name, images, description, publisher, developer, age_rating, genre, links, videourl });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not add game." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const { id } = await request.json();
    if (typeof id !== "string" || !id) return NextResponse.json({ error: "Invalid game ID." }, { status: 400 });
    const { error } = await adminSupabase().from("games").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not remove game." }, { status: 500 });
  }
}