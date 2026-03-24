import { NextRequest, NextResponse } from "next/server";
import { getPlayerIndex, PlayerIndexEntry } from "@/lib/cache";

// Module-level cache so warm serverless instances skip the blob fetch
let memIndex: PlayerIndexEntry[] | null = null;
let memIndexAt = 0;
const MEM_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getIndex(): Promise<PlayerIndexEntry[]> {
  if (memIndex && Date.now() - memIndexAt < MEM_TTL_MS) return memIndex;
  memIndex = await getPlayerIndex();
  memIndexAt = Date.now();
  return memIndex;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() ?? "";
  if (q.length < 1) return NextResponse.json([]);

  const index = await getIndex();
  const results = index
    .filter((p) => p.name.toLowerCase().includes(q))
    .sort((a, b) => b.tournaments - a.tournaments)
    .slice(0, 20);

  return NextResponse.json(results);
}
