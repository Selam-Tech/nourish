"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppNavLink } from "@/components/ui";
import { appNavItems, isNavItemActive } from "@/lib/navigation/app-nav";

interface AppNavigationProps {
  onNavigate?: () => void;
}

export function AppNavigation({ onNavigate }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="app-nav space-y-1" aria-label="Main navigation">
      {appNavItems.map((item) => (
        <AppNavLink
          key={item.href}
          href={item.href}
          label={item.label}
          active={isNavItemActive(pathname, item.href)}
          onClick={onNavigate}
        />
      ))}
    </nav>
  );
}

export function AppBrand({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 no-underline hover:no-underline ${compact ? "" : "mb-6"}`}
      onClick={onNavigate}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        N
      </span>
      <span className="font-semibold" style={{ color: "var(--color-primary-dark)" }}>
        Nourish
      </span>
    </Link>
  );
}
