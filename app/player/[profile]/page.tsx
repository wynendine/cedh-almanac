import { notFound } from "next/navigation";

interface SeatStats {
  wins: number;
  games: number;
  winRate: number | null;
}

interface OpponentStats {
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

interface PlayerStats {
  profile: string;
  name: string;
  overall: { wins: number; losses: number; draws: number; winRate: number | null };
  byseat: Record<string, SeatStats>;
  opponents: OpponentStats[];
  cachedAt: string;
}

function pct(n: number | null) {
  if (n === null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

async function fetchStats(profile: string): Promise<PlayerStats | null> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/player/${profile}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;
  const stats = await fetchStats(profile);
  if (!stats) notFound();

  const { overall, byseat, opponents } = stats;
  const totalGames = overall.wins + overall.losses + overall.draws;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{stats.name}</h1>
          <p className="mt-1 text-zinc-400">
            {totalGames} games · {pct(overall.winRate)} win rate
          </p>
        </div>

        {/* Overall */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-300">Overall Record</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Wins", value: overall.wins, color: "text-green-400" },
              { label: "Losses", value: overall.losses, color: "text-red-400" },
              { label: "Draws", value: overall.draws, color: "text-yellow-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg bg-zinc-900 p-4 text-center">
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="mt-1 text-sm text-zinc-400">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Seat win rates */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-300">Win Rate by Seat</h2>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((seat) => {
              const s = byseat[String(seat)];
              return (
                <div key={seat} className="rounded-lg bg-zinc-900 p-4 text-center">
                  <div className="text-xs text-zinc-500 mb-1">Seat {seat}</div>
                  <div className="text-2xl font-bold text-indigo-400">{pct(s?.winRate ?? null)}</div>
                  <div className="mt-1 text-xs text-zinc-500">{s?.wins ?? 0}W / {s?.games ?? 0} games</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Opponents */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-300">Results vs Opponents</h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left">Opponent</th>
                  <th className="px-4 py-3 text-right">W</th>
                  <th className="px-4 py-3 text-right">L</th>
                  <th className="px-4 py-3 text-right">D</th>
                  <th className="px-4 py-3 text-right">Games</th>
                  <th className="px-4 py-3 text-right">Win%</th>
                  <th className="px-4 py-3 text-right">Loss%</th>
                  <th className="px-4 py-3 text-right">Draw%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {opponents.map((opp) => (
                  <tr key={opp.profile} className="hover:bg-zinc-900 cursor-pointer" onClick={() => {}}>
                    <td className="px-4 py-2 font-medium">
                      <a href={`/player/${opp.profile}`} className="hover:text-indigo-400">
                        {opp.name}
                      </a>
                    </td>
                    <td className="px-4 py-2 text-right text-green-400">{opp.wins}</td>
                    <td className="px-4 py-2 text-right text-red-400">{opp.losses}</td>
                    <td className="px-4 py-2 text-right text-yellow-400">{opp.draws}</td>
                    <td className="px-4 py-2 text-right text-zinc-400">{opp.games}</td>
                    <td className="px-4 py-2 text-right">{pct(opp.winPct)}</td>
                    <td className="px-4 py-2 text-right">{pct(opp.lossPct)}</td>
                    <td className="px-4 py-2 text-right">{pct(opp.drawPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            Cached {new Date(stats.cachedAt).toLocaleString()}
          </p>
        </section>
      </div>
    </main>
  );
}
