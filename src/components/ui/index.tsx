import Link from "next/link";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "warning";
}

export function Card({ title, children, className = "", variant = "default" }: CardProps) {
  const variants = {
    default: "bg-[var(--color-surface)] border-[var(--color-border)]",
    muted: "bg-[var(--color-background)] border-[var(--color-border)]",
    warning: "bg-orange-50 border-[var(--color-warning)]",
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-[var(--shadow-sm)] sm:p-5 ${variants[variant]} ${className}`}
    >
      {title && (
        <h3 className="mb-3 text-base font-semibold" style={{ color: "var(--color-primary-dark)" }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "text-white hover:opacity-90",
    secondary: "border border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-background)]",
    danger: "text-white hover:opacity-90",
    ghost: "hover:bg-[var(--color-background)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const bgStyle =
    variant === "primary"
      ? { backgroundColor: "var(--color-primary)" }
      : variant === "danger"
        ? { backgroundColor: "var(--color-critical)" }
        : {};

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-opacity disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      style={bgStyle}
      {...props}
    >
      {children}
    </button>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background)] px-6 py-12 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl"
        style={{ backgroundColor: "var(--color-border)", color: "var(--color-primary)" }}
        aria-hidden
      >
        ○
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
        {description}
      </p>
      {action}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "warning" | "success" | "muted";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const styles = {
    default: { backgroundColor: "var(--color-primary)", color: "white" },
    warning: { backgroundColor: "var(--color-warning)", color: "white" },
    success: { backgroundColor: "var(--color-primary-light)", color: "white" },
    muted: { backgroundColor: "var(--color-border)", color: "var(--color-text-muted)" },
  };

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={styles[variant]}
    >
      {children}
    </span>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}

export function FormField({ label, htmlFor, children, hint, error }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs" style={{ color: "var(--color-critical)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClassName =
  "w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";

export const selectClassName = inputClassName;

interface AppNavLinkProps {
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function AppNavLink({ href, label, active, onClick }: AppNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`block rounded-lg border-l-[3px] py-2.5 pr-3 text-sm font-medium no-underline transition-colors hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
        active
          ? "border-l-[var(--color-primary)] bg-[var(--color-background)] pl-[calc(0.75rem-3px)] font-semibold text-[var(--color-primary-dark)]"
          : "border-l-transparent pl-3 text-[var(--color-text)] hover:border-l-[var(--color-border-strong)] hover:bg-[var(--color-background)] hover:text-[var(--color-primary-dark)]"
      }`}
    >
      {label}
    </Link>
  );
}
