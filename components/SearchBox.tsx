"use client";

import { useState, useEffect, useRef } from "react";
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
  const router = useRouter();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    }, 250);
  }, [query]);

  function select(profile: string) {
    setOpen(false);
    setQuery("");
    router.push(`/player/${profile}`);
  }

  return (
    <div className="relative w-full max-w-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a player..."
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
          {results.map((r) => (
            <li
              key={r.profile}
              onMouseDown={() => select(r.profile)}
              className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-zinc-800"
            >
              <span className="text-white">{r.name}</span>
              <span className="text-xs text-zinc-500">{r.tournaments} tournaments</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
