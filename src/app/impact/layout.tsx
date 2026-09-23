import Link from "next/link";

export default function ImpactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f7f4ea]">
      <header className="border-b border-[#d8d3c3] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <Link
              href="/impact"
              className="text-xl font-bold text-[#183f2b] no-underline hover:no-underline"
            >
              Nourish Impact
            </Link>

            <p className="text-xs text-[#66756b]">
              Population nutrition affordability intelligence
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/impact"
              className="rounded-lg px-3 py-2 font-medium text-[#183f2b] no-underline hover:bg-[#edf2ed] hover:no-underline"
            >
              Overview
            </Link>

            <Link
              href="/impact/interventions"
              className="rounded-lg px-3 py-2 font-medium text-[#183f2b] no-underline hover:bg-[#edf2ed] hover:no-underline"
            >
              Intervention Lab
            </Link>

            <Link
              href="/impact/reports"
              className="rounded-lg px-3 py-2 font-medium text-[#183f2b] no-underline hover:bg-[#edf2ed] hover:no-underline"
            >
              Reports
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-[#c8c3b4] px-3 py-2 font-medium text-[#46534b] no-underline hover:bg-white hover:no-underline"
            >
              Nourish Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {children}
      </main>
    </div>
  );
}