import { put, list, del, get } from "@vercel/blob";
import { PlayerStats } from "./compute";

const PLAYER_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface PlayerIndexEntry {
  name: string;
  profile: string;
  tournaments: number;
}

async function readBlob(url: string): Promise<unknown> {
  const result = await get(url, { access: "private" });
  if (!result || result.statusCode !== 200) return null;
  const stream = result.stream;
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const text = new TextDecoder().decode(
    chunks.reduce((acc, chunk) => {
      const merged = new Uint8Array(acc.length + chunk.length);
      merged.set(acc);
      merged.set(chunk, acc.length);
      return merged;
    }, new Uint8Array(0))
  );
  return JSON.parse(text);
}

// --- Player stats cache ---

export async function getCachedPlayer(profile: string): Promise<PlayerStats | null> {
  try {
    const { blobs } = await list({ prefix: `player-${profile}` });
    if (!blobs.length) return null;
    const blob = blobs[0];
    if (Date.now() - new Date(blob.uploadedAt).getTime() > PLAYER_TTL_MS) return null;
    return (await readBlob(blob.url)) as PlayerStats | null;
  } catch {
    return null;
  }
}

export async function setCachedPlayer(stats: PlayerStats): Promise<void> {
  try {
    const { blobs } = await list({ prefix: `player-${stats.profile}` });
    if (blobs.length) await del(blobs.map((b) => b.url));
    await put(`player-${stats.profile}.json`, JSON.stringify(stats), { access: "private" });
  } catch {
    // fail silently
  }
}

// --- Player search index ---

export async function getPlayerIndex(): Promise<PlayerIndexEntry[]> {
  try {
    const { blobs } = await list({ prefix: "index-players" });
    if (!blobs.length) return [];
    return (await readBlob(blobs[0].url)) as PlayerIndexEntry[];
  } catch {
    return [];
  }
}

export async function setPlayerIndex(entries: PlayerIndexEntry[]): Promise<void> {
  const { blobs } = await list({ prefix: "index-players" });
  if (blobs.length) await del(blobs.map((b) => b.url));
  await put("index-players.json", JSON.stringify(entries), { access: "private" });
}
