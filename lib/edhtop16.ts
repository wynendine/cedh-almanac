const GRAPHQL_URL = "https://edhtop16.com/api/graphql";

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
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
  const data = await gql(
    `query GetPlayer($profile: String!) {
      player(profile: $profile) {
        name wins losses draws
        entries {
          tournament { TID name }
          commander { name }
        }
      }
    }`,
    { profile }
  );
  return data?.data?.player ?? null;
}

export async function getTournamentProfiles(
  tid: string
): Promise<Record<string, string>> {
  const data = await gql(
    `query GetTournament($tid: String!) {
      tournament(TID: $tid) {
        entries {
          player { topdeckProfile }
          commander { name }
        }
      }
    }`,
    { tid }
  );
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
  const data = await gql(
    `query GetTournaments($first: Int!, $after: String) {
      tournaments(first: $first, after: $after, sortBy: PLAYERS) {
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
    }`,
    { first, after: after ?? null }
  );
  const conn = data?.data?.tournaments;
  return {
    tournaments: conn?.edges?.map((e: { node: TournamentListEntry }) => e.node) ?? [],
    hasNextPage: conn?.pageInfo?.hasNextPage ?? false,
    endCursor: conn?.pageInfo?.endCursor ?? null,
  };
}
