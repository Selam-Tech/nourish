import Link from "next/link";
import { createI18n } from "@/lib/i18n/server";

export function SiteHeader() {
  const { t } = createI18n();

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
            aria-hidden
          >
            N
          </span>
          <span className="text-xl font-semibold" style={{ color: "var(--color-primary-dark)" }}>
            Nourish
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/app"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white no-underline hover:no-underline"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {t("nav.getStarted")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="border-t border-[var(--color-border)] py-8"
      style={{ backgroundColor: "var(--color-primary-dark)" }}
    >
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="text-sm text-white/80">
          Nourish — Built for Ethiopia first. Designed to scale globally.
        </p>
        <p className="mt-2 text-xs text-white/50">
          Not a medical diagnosis system. Nutrition data from authoritative sources.
        </p>
      </div>
    </footer>
  );
}
