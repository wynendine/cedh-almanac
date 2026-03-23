"use client";

import { useState, useMemo } from "react";
import { pct } from "@/lib/utils";

interface Opponent {
  profile: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  games: number;
  winPct: number | null;
  lossPct: number | null;
  drawPct: number | null;
}

type SortCol = "winPct" | "lossPct" | "drawPct";
type SortDir = "desc" | "asc" | null;

const MIN_GAMES_OPTIONS = [1, 3, 5, 10];

function nextDir(current: SortDir): SortDir {
  if (current === null) return "desc";
  if (current === "desc") return "asc";
  return null;
}

function arrow(dir: SortDir) {
  if (dir === "desc") return " ↓";
  if (dir === "asc") return " ↑";
  return "";
}

export default function OpponentTable({ opponents }: { opponents: Opponent[] }) {
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [minGames, setMinGames] = useState(3);
  const [filterOpen, setFilterOpen] = useState(false);

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      const next = nextDir(sortDir);
      setSortDir(next);
      if (next === null) setSortCol(null);
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    const filtered = opponents.filter((o) => o.games >= minGames);
    if (!sortCol || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? -1;
      const bv = b[sortCol] ?? -1;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [opponents, minGames, sortCol, sortDir]);

  function colHeader(label: string, col: SortCol) {
    const active = sortCol === col;
    return (
      <button
        onClick={() => handleSort(col)}
        className={`text-center w-full ${active ? "text-white" : "text-zinc-400"} hover:text-white`}
      >
        {label}{active ? arrow(sortDir) : ""}
      </button>
    );
  }

  const emptyMessage = `No opponents with ${minGames}+ games played together.`;

  return (
    <>
      {/* Min games filter */}
      <div className="mb-3 relative inline-block">
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
        >
          <span>Min games: {minGames}+</span>
          <span className="text-zinc-500">{filterOpen ? "▲" : "▼"}</span>
        </button>
        {filterOpen && (
          <div className="absolute left-0 top-full mt-1 z-10 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden">
            {MIN_GAMES_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => { setMinGames(n); setFilterOpen(false); }}
                className={`block w-full px-4 py-2 text-left text-xs transition-colors ${
                  minGames === n
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {n}+ games
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile list */}
      <div className="sm:hidden rounded-lg overflow-hidden border border-zinc-800">
        <div className="grid grid-cols-[1fr_3rem_3rem_3rem] bg-zinc-800 px-4 py-2 text-xs">
          <div className="text-zinc-400">Opponent</div>
          <div className="border-l border-zinc-700 flex items-center justify-center">{colHeader("Win %", "winPct")}</div>
          <div className="border-l border-zinc-700 flex items-center justify-center">{colHeader("Loss %", "lossPct")}</div>
          <div className="border-l border-zinc-700 flex items-center justify-center">{colHeader("Draw %", "drawPct")}</div>
        </div>
        <div className="divide-y divide-zinc-700">
          {sorted.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">
              {emptyMessage}
            </div>
          )}
          {sorted.map((opp) => (
            <div key={opp.profile} className="grid grid-cols-[1fr_3rem_3rem_3rem] items-stretch bg-zinc-900 px-4">
              <div className="min-w-0 py-3">
                <a href={`/player/${opp.profile}`} className="font-medium hover:text-indigo-400 truncate block">
                  {opp.name}
                </a>
                <div className="mt-0.5 text-xs text-white">
                  <span className="text-green-400 text-sm font-semibold">{opp.wins}W</span>
                  {" · "}
                  <span className="text-red-400 text-sm font-semibold">{opp.losses}L</span>
                  {" · "}
                  <span className="text-yellow-400 text-sm font-semibold">{opp.draws}D</span>
                  {" · "}
                  <span className="text-sm font-semibold">{opp.games} games</span>
                </div>
              </div>
              <div className="flex items-center justify-center text-sm font-semibold border-l border-zinc-700">{pct(opp.winPct)}</div>
              <div className="flex items-center justify-center text-sm font-semibold border-l border-zinc-700">{pct(opp.lossPct)}</div>
              <div className="flex items-center justify-center text-sm font-semibold border-l border-zinc-700">{pct(opp.drawPct)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 text-left">Opponent</th>
              <th className="px-4 py-3 text-right">W</th>
              <th className="px-4 py-3 text-right">L</th>
              <th className="px-4 py-3 text-right">D</th>
              <th className="px-4 py-3 text-right">Games</th>
              <th className="px-4 py-3 text-right cursor-pointer hover:text-white select-none" onClick={() => handleSort("winPct")}>
                Win %{sortCol === "winPct" ? arrow(sortDir) : ""}
              </th>
              <th className="px-4 py-3 text-right cursor-pointer hover:text-white select-none" onClick={() => handleSort("lossPct")}>
                Loss %{sortCol === "lossPct" ? arrow(sortDir) : ""}
              </th>
              <th className="px-4 py-3 text-right cursor-pointer hover:text-white select-none" onClick={() => handleSort("drawPct")}>
                Draw %{sortCol === "drawPct" ? arrow(sortDir) : ""}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-zinc-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {sorted.map((opp) => (
              <tr key={opp.profile} className="hover:bg-zinc-900">
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
    </>
  );
}
