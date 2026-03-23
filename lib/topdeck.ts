const TOPDECK_URL = "https://topdeck.gg/api/v2/tournaments";
const API_KEY = process.env.TOPDECK_API_KEY!;

export interface TablePlayer {
  id: string;
  name: string;
}

export interface Table {
  table: number;
  players: TablePlayer[];
  winner_id: string;
}

export interface Round {
  round: string | number;
  tables: Table[];
}

export async function getRounds(tid: string): Promise<Round[]> {
  const res = await fetch(`${TOPDECK_URL}/${tid}/rounds`, {
    headers: { Authorization: API_KEY },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

export async function getRoundsBatch(tids: string[]): Promise<Record<string, Round[]>> {
  const BATCH_SIZE = 20;
  const results: Record<string, Round[]> = {};

  for (let i = 0; i < tids.length; i += BATCH_SIZE) {
    const batch = tids.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(async (tid) => ({ tid, rounds: await getRounds(tid) }))
    );
    for (const s of settled) {
      if (s.status === "fulfilled") {
        results[s.value.tid] = s.value.rounds;
      }
    }
  }

  return results;
}
