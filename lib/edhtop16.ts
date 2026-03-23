const GRAPHQL_URL = "https://edhtop16.com/api/graphql";

async function gql(query: string) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`edhtop16 error: ${res.status}`);
  return res.json();
}

export interface PlayerEntry {
  tournament: { TID: string; name: string };
  commander: { name: string } | null;
}

export interface PlayerInfo {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  entries: PlayerEntry[];
}

export async function getPlayer(profile: string): Promise<PlayerInfo | null> {
  const data = await gql(`{
    player(profile: "${profile}") {
      name wins losses draws
      entries {
        tournament { TID name }
        commander { name }
      }
    }
  }`);
  return data?.data?.player ?? null;
}

export async function getTournamentProfiles(
  tid: string
): Promise<Record<string, string>> {
  const data = await gql(`{
    tournament(TID: "${tid}") {
      entries {
        player { topdeckProfile }
        commander { name }
      }
    }
  }`);
  const entries = data?.data?.tournament?.entries ?? [];
  const map: Record<string, string> = {};
  for (const e of entries) {
    if (e.player?.topdeckProfile && e.commander?.name) {
      map[e.player.topdeckProfile] = e.commander.name;
    }
  }
  return map;
}

export interface TournamentListEntry {
  TID: string;
  entries: { player: { topdeckProfile: string; name: string } }[];
}

export async function getTournamentPage(
  first: number,
  after?: string
): Promise<{ tournaments: TournamentListEntry[]; hasNextPage: boolean; endCursor: string | null }> {
  const cursor = after ? `, after: "${after}"` : "";
  const data = await gql(`{
    tournaments(first: ${first}${cursor}, sortBy: PLAYERS) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          TID
          entries {
            player { topdeckProfile name }
          }
        }
      }
    }
  }`);
  const conn = data?.data?.tournaments;
  return {
    tournaments: conn?.edges?.map((e: { node: TournamentListEntry }) => e.node) ?? [],
    hasNextPage: conn?.pageInfo?.hasNextPage ?? false,
    endCursor: conn?.pageInfo?.endCursor ?? null,
  };
}
