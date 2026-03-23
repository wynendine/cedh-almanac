"use client";

import SearchBox from "@/components/SearchBox";

export default function PlayerError() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 pt-32 text-white">
      <h1 className="mb-2 text-4xl font-bold">Something went wrong</h1>
      <p className="mb-8 text-zinc-400">We couldn&apos;t load this player&apos;s stats. The data source may be temporarily unavailable.</p>
      <SearchBox />
      <a href="/" className="mt-6 text-sm text-zinc-500 hover:text-white">← Back to search</a>
    </main>
  );
}
