import { Round, Table } from "./topdeck";

export interface SeatStats {
  wins: number;
  games: number;
  winRate: number | null;
}

export interface OpponentStats {
  name: string;
  profile: string;
  wins: number;
  losses: number;
  draws: number;
  games: number;
  winPct: number | null;
  lossPct: number | null;
  drawPct: number | null;
}

export interface PlayerStats {
  profile: string;
  name: string;
  overall: { wins: number; losses: number; draws: number; winRate: number | null };
  byseat: Record<string, SeatStats>;
  opponents: OpponentStats[];
  cachedAt: string;
}

function getResult(
  myId: string,
  oppId: string,
  winnerId: string
): "win" | "loss" | "draw" | null {
  const isDraw = winnerId === "Draw" || winnerId === "";
  if (isDraw) return "draw";
  if (myId === winnerId) return "win";
  if (oppId === winnerId) return "loss";
  return null; // third player won
}

export function computeStats(
  profile: string,
  name: string,
  roundsByTid: Record<string, Round[]>
): PlayerStats {
  const seatStats: Record<string, { wins: number; games: number }> = {
    "1": { wins: 0, games: 0 },
    "2": { wins: 0, games: 0 },
    "3": { wins: 0, games: 0 },
    "4": { wins: 0, games: 0 },
  };

  // opponent profile -> { name, wins, losses, draws, games }
  const oppMap: Record<string, { name: string; wins: number; losses: number; draws: number; games: number }> = {};

  let totalWins = 0;
  let totalLosses = 0;
  let totalDraws = 0;

  for (const rounds of Object.values(roundsByTid)) {
    for (const round of rounds) {
      for (const table of round.tables ?? []) {
        const players = table.players ?? [];
        const myIndex = players.findIndex((p) => p.id === profile);
        if (myIndex === -1) continue;

        const me = players[myIndex];
        const winnerId = table.winner_id ?? "";
        const isDraw = winnerId === "Draw" || winnerId === "";
        const iWon = me.id === winnerId;
        const seat = String(myIndex + 1);

        // Seat stats
        if (seat in seatStats) {
          seatStats[seat].games++;
          if (iWon) seatStats[seat].wins++;
        }

        // Overall stats (count once per table, not per opponent)
        if (isDraw) totalDraws++;
        else if (iWon) totalWins++;
        else totalLosses++;

        // Opponent stats
        for (const opp of players) {
          if (opp.id === profile) continue;
          if (!oppMap[opp.id]) {
            oppMap[opp.id] = { name: opp.name, wins: 0, losses: 0, draws: 0, games: 0 };
          }
          oppMap[opp.id].games++;
          oppMap[opp.id].name = opp.name; // keep latest name

          const result = getResult(me.id, opp.id, winnerId);
          if (result === "win") oppMap[opp.id].wins++;
          else if (result === "loss") oppMap[opp.id].losses++;
          else if (result === "draw") oppMap[opp.id].draws++;
        }
      }
    }
  }

  const totalGames = totalWins + totalLosses + totalDraws;

  const byseat: Record<string, SeatStats> = {};
  for (const [seat, s] of Object.entries(seatStats)) {
    byseat[seat] = {
      wins: s.wins,
      games: s.games,
      winRate: s.games > 0 ? s.wins / s.games : null,
    };
  }

  const opponents: OpponentStats[] = Object.entries(oppMap)
    .map(([oppProfile, s]) => {
      const counted = s.wins + s.losses + s.draws;
      return {
        name: s.name,
        profile: oppProfile,
        wins: s.wins,
        losses: s.losses,
        draws: s.draws,
        games: s.games,
        winPct: counted > 0 ? s.wins / counted : null,
        lossPct: counted > 0 ? s.losses / counted : null,
        drawPct: counted > 0 ? s.draws / counted : null,
      };
    })
    .sort((a, b) => b.games - a.games);

  return {
    profile,
    name,
    overall: {
      wins: totalWins,
      losses: totalLosses,
      draws: totalDraws,
      winRate: totalGames > 0 ? totalWins / totalGames : null,
    },
    byseat,
    opponents,
    cachedAt: new Date().toISOString(),
  };
}
