import Link from "next/link";

export default function CryptoNotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center shadow-lg shadow-[var(--shadow-color)] backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Crypto Not Found</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          The requested cryptocurrency does not exist in the current dataset.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-green-500/20"
        >
          Return to watchlist
        </Link>
      </section>
    </main>
  );
}