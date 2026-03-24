import { put, list, del, get } from "@vercel/blob";
import { PlayerStats } from "./compute";

const PLAYER_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_VERSION = 3; // bump when cached data shape or logic changes

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
    const data = (await readBlob(blob.url)) as (PlayerStats & { v?: number }) | null;
    if (!data || data.v !== CACHE_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setCachedPlayer(stats: PlayerStats): Promise<void> {
  try {
    const { blobs } = await list({ prefix: `player-${stats.profile}` });
    if (blobs.length) await del(blobs.map((b) => b.url));
    await put(`player-${stats.profile}.json`, JSON.stringify({ ...stats, v: CACHE_VERSION }), { access: "private" });
  } catch {
    // fail silently
  }
}

// --- Player search index ---

export async function getPlayerIndex(): Promise<PlayerIndexEntry[]> {
  try {
    const { blobs } = await list({ prefix: "index-players" });
    if (!blobs.length) return [];
    // Pick the newest blob in case a previous partial write left duplicates
    const newest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];
    return (await readBlob(newest.url)) as PlayerIndexEntry[];
  } catch {
    return [];
  }
}

export async function setPlayerIndex(entries: PlayerIndexEntry[]): Promise<void> {
  // Write new blob first so the index is never absent if the delete fails
  const newBlob = await put("index-players.json", JSON.stringify(entries), { access: "private" });
  const { blobs } = await list({ prefix: "index-players" });
  const toDelete = blobs.map((b) => b.url).filter((url) => url !== newBlob.url);
  if (toDelete.length) await del(toDelete);
}

// Updates a single player's entry in the index with an accurate tournament count.
// Called after fetching fresh player stats so counts stay correct over time.
export async function updatePlayerIndexEntry(profile: string, name: string, tournaments: number): Promise<void> {
  try {
    const entries = await getPlayerIndex();
    // Bail out if the index looks empty or corrupt — never write back a tiny index
    if (entries.length < 100) return;
    const idx = entries.findIndex((e) => e.profile === profile);
    if (idx === -1) {
      entries.push({ profile, name, tournaments });
    } else {
      entries[idx] = { profile, name, tournaments };
    }
    await setPlayerIndex(entries);
  } catch {
    // fail silently — index update is best-effort
  }
}
