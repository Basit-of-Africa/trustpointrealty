const kindLabels: Record<string, string> = {
  direct: "Sale commission",
  upline: "Team bonus",
  adjustment: "Adjustment",
  clawback: "Reversal",
};

export function CommissionKind({ kind }: { kind: string }) {
  return <span>{kindLabels[kind] ?? kind}</span>;
}

export const clientStatuses = ["lead", "inspection", "buyer", "lost"] as const;
export const saleStatuses = ["active", "completed", "cancelled"] as const;
export const estateStatuses = ["selling", "sold_out", "archived"] as const;
export const userStatuses = ["pending", "active", "suspended", "rejected"] as const;

/** A small progress bar for "paid so far" on a sale. */
export function Progress({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-zinc-500">{pct}%</span>
    </div>
  );
}
