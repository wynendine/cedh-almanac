import { put, list, del } from "@vercel/blob";
import { PlayerStats } from "./compute";

const PLAYER_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface PlayerIndexEntry {
  name: string;
  profile: string;
  tournaments: number;
}

// --- Player stats cache ---

export async function getCachedPlayer(profile: string): Promise<PlayerStats | null> {
  try {
    const { blobs } = await list({ prefix: `player-${profile}` });
    if (!blobs.length) return null;
    const blob = blobs[0];
    if (Date.now() - new Date(blob.uploadedAt).getTime() > PLAYER_TTL_MS) return null;
    const res = await fetch(blob.url);
    return res.json();
  } catch {
    return null;
  }
}

export async function setCachedPlayer(stats: PlayerStats): Promise<void> {
  try {
    const { blobs } = await list({ prefix: `player-${stats.profile}` });
    if (blobs.length) await del(blobs.map((b) => b.url));
    await put(`player-${stats.profile}.json`, JSON.stringify(stats), { access: "public" });
  } catch {
    // fail silently
  }
}

// --- Player search index ---

export async function getPlayerIndex(): Promise<PlayerIndexEntry[]> {
  try {
    const { blobs } = await list({ prefix: "index-players" });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url);
    return res.json();
  } catch {
    return [];
  }
}

export async function setPlayerIndex(entries: PlayerIndexEntry[]): Promise<void> {
  const { blobs } = await list({ prefix: "index-players" });
  if (blobs.length) await del(blobs.map((b) => b.url));
  await put("index-players.json", JSON.stringify(entries), { access: "public" });
}
