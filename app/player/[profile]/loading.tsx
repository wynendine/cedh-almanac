export default function Loading() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-10 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 rounded bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-zinc-800" />
            <div className="h-4 w-24 rounded bg-zinc-800" />
          </div>
        </div>

        {/* Overall Record */}
        <section>
          <div className="mb-3 h-5 w-32 rounded bg-zinc-800" />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg bg-zinc-900 p-4 text-center">
                  <div className="mx-auto h-8 w-12 rounded bg-zinc-800" />
                  <div className="mx-auto mt-2 h-3 w-10 rounded bg-zinc-800" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg bg-zinc-900 p-4 text-center">
                  <div className="mx-auto h-8 w-16 rounded bg-zinc-800" />
                  <div className="mx-auto mt-2 h-3 w-16 rounded bg-zinc-800" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seat win rates */}
        <section>
          <div className="mb-3 h-5 w-36 rounded bg-zinc-800" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg bg-zinc-900 p-4 text-center">
                <div className="mx-auto h-3 w-10 rounded bg-zinc-800" />
                <div className="mx-auto mt-2 h-7 w-14 rounded bg-zinc-800" />
                <div className="mx-auto mt-2 h-3 w-16 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </section>

        {/* Opponents */}
        <section>
          <div className="mb-3 h-5 w-44 rounded bg-zinc-800" />
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800 last:border-0">
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 rounded bg-zinc-800" />
                  <div className="h-3 w-48 rounded bg-zinc-800" />
                </div>
                <div className="h-4 w-12 rounded bg-zinc-800" />
                <div className="h-4 w-12 rounded bg-zinc-800" />
                <div className="h-4 w-12 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
