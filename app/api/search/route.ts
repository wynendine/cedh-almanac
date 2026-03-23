import { NextRequest, NextResponse } from "next/server";
import { getPlayerIndex } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const index = await getPlayerIndex();
  const results = index
    .filter((p) => p.name.toLowerCase().includes(q))
    .sort((a, b) => b.tournaments - a.tournaments)
    .slice(0, 20);

  return NextResponse.json(results);
}
