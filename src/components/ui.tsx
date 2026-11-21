import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  actions,
  children,
  className = "",
  flush = false,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section className={`min-w-0 rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3">
          {title && <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={flush ? "overflow-x-auto" : "p-4"}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "brand" | "accent";
}) {
  const tones = {
    default: "bg-white border-zinc-200",
    brand: "bg-brand-700 border-brand-700 text-white",
    accent: "bg-accent-400/15 border-accent-400/40",
  };
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className={`text-xs font-medium uppercase tracking-wide ${tone === "brand" ? "text-brand-100" : "text-zinc-500"}`}>
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{value}</div>
      {hint && <div className={`mt-1 text-xs ${tone === "brand" ? "text-brand-100" : "text-zinc-500"}`}>{hint}</div>}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  yellow: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  gray: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
};

const statusTone: Record<string, keyof typeof badgeTones> = {
  active: "green",
  approved: "green",
  completed: "green",
  buyer: "green",
  selling: "green",
  pending: "yellow",
  inspection: "blue",
  lead: "gray",
  suspended: "red",
  rejected: "red",
  cancelled: "red",
  void: "gray",
  voided: "gray",
  reversed: "gray",
  lost: "gray",
  sold_out: "gray",
  archived: "gray",
};

export function Badge({ children, tone }: { children: ReactNode; tone?: keyof typeof badgeTones }) {
  const key = tone ?? statusTone[String(children)] ?? "gray";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${badgeTones[key]}`}>
      {String(children).replace(/_/g, " ")}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="px-4 py-10 text-center text-sm text-zinc-500">{children}</div>;
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link href={href} className={variant === "primary" ? "btn-primary" : "btn-secondary"}>
      {children}
    </Link>
  );
}

export function Money({ kobo, className = "" }: { kobo: number; className?: string }) {
  const negative = kobo < 0;
  return (
    <span className={`tabular-nums whitespace-nowrap ${negative ? "text-red-700" : ""} ${className}`}>
      {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100)}
    </span>
  );
}

/** Simple ?page= pagination links. */
export function Pager({ page, hasMore, basePath, params = {} }: {
  page: number;
  hasMore: boolean;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (page <= 1 && !hasMore) return null;
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    q.set("page", String(p));
    return `${basePath}?${q}`;
  };
  return (
    <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 text-sm">
      {page > 1 ? <Link className="link" href={href(page - 1)}>← Previous</Link> : <span />}
      <span className="text-zinc-500">Page {page}</span>
      {hasMore ? <Link className="link" href={href(page + 1)}>Next →</Link> : <span />}
    </div>
  );
}
