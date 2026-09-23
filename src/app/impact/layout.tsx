import Link from "next/link";

export default function ImpactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f7f4ea]">
      <header className="border-b border-[#d8d3c3] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/impact"
            className="no-underline hover:no-underline"
          >
            <div className="text-2xl font-bold text-[#183f2b]">
              Nourish Impact
            </div>

            <div className="mt-1 text-sm text-[#66756b]">
              Nutrition affordability intelligence
            </div>
          </Link>

          <nav className="flex w-full gap-2 overflow-x-auto pb-1 text-base lg:w-auto lg:pb-0">
            <Link
              href="/impact"
              className="whitespace-nowrap rounded-lg px-4 py-2.5 font-semibold text-[#183f2b] no-underline hover:bg-[#edf2ed] hover:no-underline"
            >
              Overview
            </Link>

            <Link
              href="/impact/interventions"
              className="whitespace-nowrap rounded-lg px-4 py-2.5 font-semibold text-[#183f2b] no-underline hover:bg-[#edf2ed] hover:no-underline"
            >
              Intervention Lab
            </Link>

            <Link
              href="/impact/reports"
              className="whitespace-nowrap rounded-lg px-4 py-2.5 font-semibold text-[#183f2b] no-underline hover:bg-[#edf2ed] hover:no-underline"
            >
              Reports
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-9 lg:px-8">
        {children}
      </main>
    </div>
  );
}