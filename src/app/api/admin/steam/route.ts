import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

const steamApi = "https://store.steampowered.com/api";

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");
  const query = searchParams.get("query")?.trim();
  try {
    if (appId) {
      if (!/^\d+$/.test(appId)) return NextResponse.json({ error: "Invalid Steam app ID." }, { status: 400 });
      const response = await fetch(`${steamApi}/appdetails?appids=${appId}&cc=us&l=en`, { cache: "no-store" });
      const item = (await response.json())[appId];
      if (!item?.success) return NextResponse.json({ error: "Steam game details were not found." }, { status: 404 });
      const game = item.data;
      const images = [game.header_image, ...(game.screenshots ?? []).map((screenshot: { path_full?: string }) => screenshot.path_full)]
        .filter((image): image is string => typeof image === "string")
        .slice(0, 5);
      return NextResponse.json({
        game: {
          id: `steam-${appId}`,
          name: game.name ?? "",
          description: plainText(game.short_description ?? game.detailed_description ?? "").slice(0, 200),
          developer: game.developers?.[0] ?? "",
          publisher: game.publishers?.[0] ?? "",
          genre: game.genres?.[0]?.description ?? "",
          steam: `https://store.steampowered.com/app/${appId}/`,
          images,
        },
      });
    }
    if (!query || query.length < 2) return NextResponse.json({ games: [] });
    const response = await fetch(`${steamApi}/storesearch/?term=${encodeURIComponent(query)}&cc=us&l=en`, { cache: "no-store" });
    const data = await response.json();
    const games = (data.items ?? []).filter((item: { type?: string }) => item.type === "app").slice(0, 8).map((item: { id: number; name: string; tiny_image?: string }) => ({ id: item.id, name: item.name, image: item.tiny_image ?? "" }));
    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: "Steam lookup is unavailable right now." }, { status: 502 });
  }
}