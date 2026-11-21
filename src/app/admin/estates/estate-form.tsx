import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";
import { estateStatuses } from "@/components/labels";
import { koboToInput } from "@/lib/money";
import type { Estate } from "@/db/schema";
import { saveEstateAction } from "../actions";

export function EstateForm({ estate }: { estate?: Estate }) {
  return (
    <ActionForm action={saveEstateAction} className="grid gap-4 sm:grid-cols-2">
      {estate && <input type="hidden" name="id" value={estate.id} />}
      <Field label="Estate name"><input className="input" name="name" defaultValue={estate?.name} required /></Field>
      <Field label="Location"><input className="input" name="location" defaultValue={estate?.location ?? "Ibadan, Oyo State"} /></Field>
      <Field label="Price per plot (₦, optional)" hint="Pre-fills new sales.">
        <input className="input" name="pricePerPlot" inputMode="decimal" defaultValue={koboToInput(estate?.pricePerPlot)} />
      </Field>
      <Field label="Status">
        <select className="input" name="status" defaultValue={estate?.status ?? "selling"}>
          {estateStatuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </Field>
      <Field label="Realtor commission (%)" hint="Paid to the realtor who brought the client, on each payment.">
        <input className="input" name="commissionRate" inputMode="decimal" defaultValue={estate ? estate.commissionRateBps / 100 : 10} required />
      </Field>
      <Field label="Upline bonus (%)" hint="Paid to the realtor who recruited them. 0 for none.">
        <input className="input" name="uplineRate" inputMode="decimal" defaultValue={estate ? estate.uplineRateBps / 100 : 0} />
      </Field>
      <Field label="Description (optional)" className="sm:col-span-2">
        <textarea className="input" name="description" rows={3} defaultValue={estate?.description ?? ""} />
      </Field>
      <div className="sm:col-span-2"><SubmitButton>Save estate</SubmitButton></div>
    </ActionForm>
  );
}
