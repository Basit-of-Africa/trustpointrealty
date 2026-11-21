import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/form";
import { Badge, Empty, Field, Money } from "@/components/ui";
import { CommissionKind } from "@/components/labels";
import { formatDate } from "@/lib/format";
import { formatRate } from "@/lib/money";
import type { Commission, Payout } from "@/db/schema";
import { logPayoutAction, voidCommissionAction, voidPayoutAction } from "./actions";
import { todayLagos } from "@/lib/format";

/** An inline "reason required" action hidden behind a toggle. */
export function ReasonAction({
  label,
  action,
  hidden,
  placeholder = "Reason",
  confirm,
}: {
  label: string;
  action: Parameters<typeof ActionForm>[0]["action"];
  hidden: Record<string, string | number>;
  placeholder?: string;
  confirm?: string;
}) {
  return (
    <details className="group inline-block text-left">
      <summary className="cursor-pointer list-none text-xs font-medium text-red-700 hover:underline">{label}</summary>
      <ActionForm action={action} className="mt-2 flex w-64 flex-col gap-2" confirm={confirm}>
        {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <input className="input" name="reason" placeholder={placeholder} required />
        <SubmitButton variant="danger" small>{label}</SubmitButton>
      </ActionForm>
    </details>
  );
}

type CommissionRow = { c: Commission; realtorName?: string; realtorId?: string; client?: string | null; estate?: string | null };

export function CommissionTable({ rows, showRealtor = false }: { rows: CommissionRow[]; showRealtor?: boolean }) {
  if (!rows.length) return <Empty>No commission entries.</Empty>;
  return (
    <table className="data-table">
      <thead><tr><th>Date</th>{showRealtor && <th>Realtor</th>}<th>Type</th><th>Details</th><th>Status</th><th className="text-right">Amount</th><th /></tr></thead>
      <tbody>
        {rows.map(({ c, realtorName, client, estate }) => (
          <tr key={c.id}>
            <td className="whitespace-nowrap">{formatDate(c.createdAt)}</td>
            {showRealtor && <td><Link className="link" href={`/admin/realtors/${c.realtorId}`}>{realtorName}</Link></td>}
            <td><CommissionKind kind={c.kind} />{c.rateBps != null && <span className="text-xs text-zinc-500"> · {formatRate(c.rateBps)}</span>}</td>
            <td>
              {c.saleId && <Link className="link" href={`/admin/sales/${c.saleId}`}>Sale #{c.saleId}</Link>}
              {client && <span> · {client}</span>}{estate && <span className="text-zinc-500"> ({estate})</span>}
              {c.note && <div className="text-xs text-zinc-500">{c.note}</div>}
            </td>
            <td><Badge>{c.status}</Badge></td>
            <td className="text-right"><Money kobo={c.amount} className={c.status === "void" ? "line-through opacity-50" : ""} /></td>
            <td className="text-right">
              {c.status === "pending" && <ReasonAction label="Void" action={voidCommissionAction} hidden={{ commissionId: c.id }} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type PayoutRow = { p: Payout; realtorName?: string };

export function PayoutTable({ rows, showRealtor = false }: { rows: PayoutRow[]; showRealtor?: boolean }) {
  if (!rows.length) return <Empty>No payouts logged.</Empty>;
  return (
    <table className="data-table">
      <thead><tr><th>Date</th>{showRealtor && <th>Realtor</th>}<th>Sent to</th><th>Reference</th><th>Note</th><th className="text-right">Amount</th><th /></tr></thead>
      <tbody>
        {rows.map(({ p, realtorName }) => (
          <tr key={p.id} className={p.voidedAt ? "opacity-60" : ""}>
            <td className="whitespace-nowrap">{formatDate(p.paidOn)}</td>
            {showRealtor && <td><Link className="link" href={`/admin/realtors/${p.realtorId}`}>{realtorName}</Link></td>}
            <td className="text-xs">{p.accountName}<div className="text-zinc-500">{p.bankName} {p.accountNumber}</div></td>
            <td className="font-mono text-xs">{p.reference ?? "—"}</td>
            <td className="text-xs">{p.voidedAt ? <><Badge>voided</Badge> {p.voidReason}</> : p.note}</td>
            <td className="text-right"><Money kobo={p.amount} className={p.voidedAt ? "line-through" : "font-semibold"} /></td>
            <td className="text-right">{!p.voidedAt && <ReasonAction label="Void" action={voidPayoutAction} hidden={{ payoutId: p.id }} placeholder="e.g. transfer reversed" />}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function LogPayoutForm({
  realtors,
  fixedRealtor,
}: {
  realtors?: { id: string; name: string }[];
  fixedRealtor?: { id: string; bankName: string | null; accountNumber: string | null; accountName: string | null };
}) {
  return (
    <ActionForm action={logPayoutAction} resetOnSuccess className="grid gap-3 sm:grid-cols-2">
      {fixedRealtor ? (
        <input type="hidden" name="realtorId" value={fixedRealtor.id} />
      ) : (
        <Field label="Realtor" className="sm:col-span-2">
          <select className="input" name="realtorId" required defaultValue="">
            <option value="" disabled>Choose a realtor…</option>
            {realtors?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Amount (₦)"><input className="input" name="amount" inputMode="decimal" placeholder="50,000" required /></Field>
      <Field label="Transfer date"><input className="input" name="paidOn" type="date" defaultValue={todayLagos()} required /></Field>
      <Field label="Bank reference / session ID" className="sm:col-span-2"><input className="input" name="reference" /></Field>
      {fixedRealtor && (
        <p className="text-xs text-zinc-500 sm:col-span-2">
          Paid to: {fixedRealtor.accountName ?? "—"} · {fixedRealtor.bankName ?? "no bank"} {fixedRealtor.accountNumber ?? ""}
        </p>
      )}
      <Field label="Note (optional)" className="sm:col-span-2"><input className="input" name="note" placeholder="e.g. March commissions" /></Field>
      <div className="sm:col-span-2"><SubmitButton>Log payout</SubmitButton></div>
    </ActionForm>
  );
}
