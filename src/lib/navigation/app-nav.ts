export interface AppNavItem {
  href: string;
  label: string;
}

export const appNavItems: AppNavItem[] = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/household", label: "Household" },
  { href: "/app/pantry", label: "Pantry" },
  { href: "/app/plan", label: "Plan" },
  { href: "/app/history", label: "History" },
  { href: "/app/affordability", label: "Affordability" },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href;
}
