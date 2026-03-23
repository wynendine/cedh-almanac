import { kv } from "@vercel/kv";
import { PlayerStats } from "./compute";

const PLAYER_TTL = 60 * 60 * 6; // 6 hours
const INDEX_TTL = 60 * 60 * 25; // 25 hours

export interface PlayerIndexEntry {
  name: string;
  profile: string;
  tournaments: number;
}

export async function getCachedPlayer(profile: string): Promise<PlayerStats | null> {
  try {
    return await kv.get<PlayerStats>(`player:${profile}`);
  } catch {
    return null;
  }
}

export async function setCachedPlayer(stats: PlayerStats): Promise<void> {
  try {
    await kv.set(`player:${stats.profile}`, stats, { ex: PLAYER_TTL });
  } catch {
    // fail silently — cache is best-effort
  }
}

export async function getPlayerIndex(): Promise<PlayerIndexEntry[]> {
  try {
    return (await kv.get<PlayerIndexEntry[]>("index:players")) ?? [];
  } catch {
    return [];
  }
}

export async function setPlayerIndex(entries: PlayerIndexEntry[]): Promise<void> {
  await kv.set("index:players", entries, { ex: INDEX_TTL });
}
