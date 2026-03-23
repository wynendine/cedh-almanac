"use client";

import { useState } from "react";

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

function pct(n: number | null) {
  if (n === null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

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

  const sorted = [...opponents].sort((a, b) => {
    if (!sortCol || !sortDir) return 0;
    const av = a[sortCol] ?? -1;
    const bv = b[sortCol] ?? -1;
    return sortDir === "desc" ? bv - av : av - bv;
  });

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

  return (
    <>
      {/* Mobile list */}
      <div className="sm:hidden rounded-lg overflow-hidden border border-zinc-800">
        <div className="grid grid-cols-[1fr_3rem_3rem_3rem] gap-x-2 bg-zinc-800 px-4 py-2 text-xs">
          <div className="text-zinc-400">Opponent</div>
          <div>{colHeader("Win%", "winPct")}</div>
          <div>{colHeader("Loss%", "lossPct")}</div>
          <div>{colHeader("Draw%", "drawPct")}</div>
        </div>
        <div className="divide-y divide-zinc-800">
          {sorted.map((opp) => (
            <div key={opp.profile} className="grid grid-cols-[1fr_3rem_3rem_3rem] gap-x-2 items-center bg-zinc-900 px-4 py-3">
              <div className="min-w-0">
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
                  {opp.games} games
                </div>
              </div>
              <div className="text-center text-sm font-semibold">{pct(opp.winPct)}</div>
              <div className="text-center text-sm font-semibold">{pct(opp.lossPct)}</div>
              <div className="text-center text-sm font-semibold">{pct(opp.drawPct)}</div>
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
                Win%{sortCol === "winPct" ? arrow(sortDir) : ""}
              </th>
              <th className="px-4 py-3 text-right cursor-pointer hover:text-white select-none" onClick={() => handleSort("lossPct")}>
                Loss%{sortCol === "lossPct" ? arrow(sortDir) : ""}
              </th>
              <th className="px-4 py-3 text-right cursor-pointer hover:text-white select-none" onClick={() => handleSort("drawPct")}>
                Draw%{sortCol === "drawPct" ? arrow(sortDir) : ""}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
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
