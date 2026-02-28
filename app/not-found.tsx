import type { Metadata } from "next";
import Link from "next/link";
import { landingPages } from "@/lib/landing-pages";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you're looking for doesn't exist. Explore Dungym's kettlebell strength program or browse our workout guides.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  const popular = landingPages.slice(0, 4);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold">
            Dungym
          </Link>
          <Link
            href="/program"
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold transition-colors hover:bg-red-600"
          >
            Start Training
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-6xl font-bold text-zinc-700">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-400">
          This page doesn&apos;t exist. But your next workout does.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-red-500 px-7 py-3 text-sm font-semibold transition-colors hover:bg-red-600"
        >
          Go to Homepage
        </Link>

        <div className="mt-16 w-full max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Popular programs
          </p>
          <div className="grid gap-2">
            {popular.map((page) => (
              <Link
                key={page.slug}
                href={`/workout/${page.slug}`}
                className="rounded-lg border border-white/5 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
              >
                {page.headline}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
