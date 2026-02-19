export default function AddToWatchlistLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 backdrop-blur-xl sm:p-6">
        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded-md bg-[var(--badge-bg)]" />
          <div className="h-5 w-80 animate-pulse rounded-md bg-[var(--badge-bg)]" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-xl border border-[var(--card-border)] bg-[var(--header-bg)]"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
