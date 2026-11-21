import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";
import { clientStatuses } from "@/components/labels";
import { formatPhone } from "@/lib/phone";
import type { Client } from "@/db/schema";
import { saveClientAction } from "../actions";

export function ClientForm({
  client,
  realtors,
  estates,
}: {
  client?: Client;
  realtors: { id: string; name: string }[];
  estates: { id: number; name: string }[];
}) {
  return (
    <ActionForm action={saveClientAction} className="grid gap-4 sm:grid-cols-2">
      {client && <input type="hidden" name="id" value={client.id} />}
      <Field label="Full name"><input className="input" name="fullName" defaultValue={client?.fullName} required /></Field>
      <Field label="Phone"><input className="input" name="phone" defaultValue={formatPhone(client?.phone)} required /></Field>
      <Field label="Email"><input className="input" name="email" type="email" defaultValue={client?.email ?? ""} /></Field>
      <Field label="Status">
        <select className="input" name="status" defaultValue={client?.status ?? "lead"}>
          {clientStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Realtor" hint="Who gets commission on this client's purchases. Reassigning only affects new sales.">
        <select className="input" name="realtorId" defaultValue={client?.realtorId ?? ""}>
          <option value="">No realtor (direct / walk-in)</option>
          {realtors.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </Field>
      <Field label="Interested in">
        <select className="input" name="estateId" defaultValue={client?.estateId ?? ""}>
          <option value="">—</option>
          {estates.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </Field>
      <Field label="Notes" className="sm:col-span-2"><textarea className="input" name="notes" rows={2} defaultValue={client?.notes ?? ""} /></Field>
      <div className="sm:col-span-2"><SubmitButton>{client ? "Save client" : "Add client"}</SubmitButton></div>
    </ActionForm>
  );
}
