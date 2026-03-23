import SearchBox from "@/components/SearchBox";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <h1 className="mb-2 text-4xl font-bold text-white">cEDH Almanac</h1>
      <p className="mb-8 text-zinc-400">Player stats for competitive EDH</p>
      <SearchBox />
    </main>
  );
}
