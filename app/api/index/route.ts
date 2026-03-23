import { NextRequest, NextResponse } from "next/server";
import { getTournamentPage } from "@/lib/edhtop16";
import { setPlayerIndex, PlayerIndexEntry } from "@/lib/cache";

export const maxDuration = 300;

export async function POST(_req: NextRequest) {
  try {
    return await buildIndex();
  } catch (err) {
    console.error("Index build failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function buildIndex() {
  const playerMap: Record<string, { name: string; tournaments: number }> = {};
  let cursor: string | null = null;
  let hasNext = true;
  let pages = 0;
  const PAGE_SIZE = 100;
  const MAX_PAGES = 120; // up to 12,000 tournaments

  while (hasNext && pages < MAX_PAGES) {
    const { tournaments, hasNextPage, endCursor } = await getTournamentPage(PAGE_SIZE, cursor ?? undefined);

    for (const t of tournaments) {
      for (const entry of t.entries ?? []) {
        const { topdeckProfile, name } = entry.player ?? {};
        if (!topdeckProfile || !name) continue;
        if (!playerMap[topdeckProfile]) {
          playerMap[topdeckProfile] = { name, tournaments: 0 };
        }
        playerMap[topdeckProfile].name = name;
        playerMap[topdeckProfile].tournaments++;
      }
    }

    hasNext = hasNextPage;
    cursor = endCursor;
    pages++;
  }

  const entries: PlayerIndexEntry[] = Object.entries(playerMap).map(
    ([profile, { name, tournaments }]) => ({ profile, name, tournaments })
  );

  await setPlayerIndex(entries);

  return NextResponse.json({ playersIndexed: entries.length, pages, tournamentsScanned: pages * PAGE_SIZE });
}
