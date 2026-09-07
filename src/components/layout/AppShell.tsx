"use client";

import { useCallback, useEffect, useState } from "react";
import { AppBrand, AppNavigation } from "@/components/layout/AppNavigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className="min-h-screen md:flex">
      <header
        className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 md:hidden"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-primary-dark)] hover:bg-[var(--color-background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="app-mobile-nav"
          onClick={openDrawer}
        >
          <span className="sr-only">Open menu</span>
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <AppBrand compact />
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation menu"
            onClick={closeDrawer}
          />
          <aside
            id="app-mobile-nav"
            className="relative flex h-full w-[min(280px,85vw)] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]"
            aria-label="Navigation drawer"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <AppBrand onNavigate={closeDrawer} />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-primary-dark)] hover:bg-[var(--color-background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                aria-label="Close navigation menu"
                onClick={closeDrawer}
              >
                <span className="sr-only">Close menu</span>
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AppNavigation onNavigate={closeDrawer} />
            </div>
          </aside>
        </div>
      )}

      <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] md:block">
        <div className="sticky top-0 p-4">
          <AppBrand />
          <AppNavigation />
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
