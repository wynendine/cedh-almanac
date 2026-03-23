import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/edhtop16";
import { getRoundsBatch } from "@/lib/topdeck";
import { computeStats } from "@/lib/compute";
import { getCachedPlayer, setCachedPlayer } from "@/lib/cache";

export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ profile: string }> }
) {
  const { profile } = await params;

  const cached = await getCachedPlayer(profile);
  if (cached) return NextResponse.json(cached);

  const player = await getPlayer(profile);
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const tids = player.entries.map((e) => e.tournament.TID);
  const roundsByTid = await getRoundsBatch(tids);

  const stats = computeStats(profile, player.name, roundsByTid);
  // Merge overall wins/losses/draws from edhtop16 as a fallback
  if (stats.overall.wins === 0 && stats.overall.losses === 0) {
    stats.overall.wins = player.wins;
    stats.overall.losses = player.losses;
    stats.overall.draws = player.draws;
    const total = player.wins + player.losses + player.draws;
    stats.overall.winRate = total > 0 ? player.wins / total : null;
  }

  await setCachedPlayer(stats);
  return NextResponse.json(stats);
}
