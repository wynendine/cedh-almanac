"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Result {
  name: string;
  profile: string;
  tournaments: number;
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setOpen(false);
      setSearching(false);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    setSearching(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 150);
  }, [query]);

  function select(profile: string) {
    setOpen(false);
    setQuery("");
    startTransition(() => {
      router.push(`/player/${profile}`);
    });
  }

  const showDropdown = open && (searching || results.length > 0 || query.length < 2);

  return (
    <div className="relative w-full max-w-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isPending ? "Loading…" : "Search for a player..."}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
        disabled={isPending}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => (results.length > 0 || searching) && setOpen(true)}
      />
      {query.length >= 1 && open && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
          {searching ? (
            <li className="px-4 py-3 text-sm text-zinc-500">Searching…</li>
          ) : results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">No players found.</li>
          ) : (
            results.map((r) => (
              <li
                key={r.profile}
                onMouseDown={() => select(r.profile)}
                className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-zinc-800"
              >
                <span className="text-white">{r.name}</span>
                <span className="text-xs text-zinc-500">{r.tournaments} tournaments</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
