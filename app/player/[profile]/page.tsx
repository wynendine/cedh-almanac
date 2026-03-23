import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/edhtop16";
import { getRoundsBatch } from "@/lib/topdeck";
import { computeStats, PlayerStats } from "@/lib/compute";
import { getCachedPlayer, setCachedPlayer } from "@/lib/cache";
import OpponentTable from "@/components/OpponentTable";

function pct(n: number | null) {
  if (n === null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

async function fetchStats(profile: string): Promise<PlayerStats | null> {
  const cached = await getCachedPlayer(profile);
  if (cached) return cached;

  const player = await getPlayer(profile);
  if (!player) return null;

  const tids = player.entries.map((e) => e.tournament.TID);
  const roundsByTid = await getRoundsBatch(tids);
  const stats = computeStats(profile, player.name, roundsByTid);

  if (stats.overall.wins === 0 && stats.overall.losses === 0) {
    stats.overall.wins = player.wins;
    stats.overall.losses = player.losses;
    stats.overall.draws = player.draws;
    const total = player.wins + player.losses + player.draws;
    stats.overall.winRate = total > 0 ? player.wins / total : null;
  }

  await setCachedPlayer(stats);
  return stats;
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;
  const stats = await fetchStats(profile);
  if (!stats) notFound();

  const { overall, byseat } = stats;
  const opponents = stats.opponents.filter((o) => o.games >= 3);
  const totalGames = overall.wins + overall.losses + overall.draws;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <a href="/" className="text-zinc-500 hover:text-white text-sm">← Search</a>
          <div>
            <h1 className="text-3xl font-bold">{stats.name}</h1>
            <p className="mt-1 text-zinc-400">{totalGames} games played</p>
          </div>
        </div>

        {/* Overall */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-300">Overall Record</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <div className="rounded-lg bg-zinc-900 p-4 text-center col-span-2 sm:col-span-1">
              <div className="text-3xl font-bold text-indigo-400">{pct(overall.winRate)}</div>
              <div className="mt-1 text-sm text-zinc-400">Win Rate</div>
            </div>
          </div>
        </section>

        {/* Seat win rates */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-300">Win Rate by Seat</h2>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((seat) => {
              const s = byseat[String(seat)];
              return (
                <div key={seat} className="rounded-lg bg-zinc-900 p-4 flex flex-col items-center text-center">
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
          <OpponentTable opponents={opponents} />
          <p className="mt-2 text-xs text-zinc-600">
            Cached {new Date(stats.cachedAt).toLocaleString()}
          </p>
        </section>
      </div>
    </main>
  );
}
