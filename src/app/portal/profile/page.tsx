import { requireRealtor } from "@/lib/auth/session";
import { formatPhone } from "@/lib/phone";
import { fullName } from "@/lib/format";
import { Card, Field, PageHeader } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/form";
import { changePasswordAction, updateProfileAction } from "../actions";

export const metadata = { title: "Profile & bank" };

export default async function ProfilePage() {
  const user = await requireRealtor();
  return (
    <>
      <PageHeader title="Profile & bank details" description="Keep your bank details correct. Commission is paid by transfer to this account." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Your details" className="lg:col-span-2">
          <ActionForm action={updateProfileAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" hint="Contact the office to change your name or email.">
              <input className="input" value={fullName(user)} disabled />
            </Field>
            <Field label="Email">
              <input className="input" value={user.email} disabled />
            </Field>
            <Field label="Phone (WhatsApp)">
              <input className="input" name="phone" defaultValue={formatPhone(user.phone)} required />
            </Field>
            <Field label="Address">
              <input className="input" name="address" defaultValue={user.address ?? ""} />
            </Field>
            <div className="border-t border-zinc-100 pt-4 sm:col-span-2">
              <h3 className="text-sm font-semibold">Bank account for payouts</h3>
            </div>
            <Field label="Bank">
              <input className="input" name="bankName" defaultValue={user.bankName ?? ""} placeholder="e.g. GTBank" />
            </Field>
            <Field label="Account number">
              <input className="input" name="accountNumber" inputMode="numeric" maxLength={10} defaultValue={user.accountNumber ?? ""} />
            </Field>
            <Field label="Account name" className="sm:col-span-2" hint="Must match the name on the bank account.">
              <input className="input" name="accountName" defaultValue={user.accountName ?? ""} />
            </Field>
            <div className="sm:col-span-2"><SubmitButton>Save details</SubmitButton></div>
          </ActionForm>
        </Card>
        <Card title="Change password">
          <ActionForm action={changePasswordAction} resetOnSuccess>
            <Field label="Current password">
              <input className="input" name="currentPassword" type="password" autoComplete="current-password" required />
            </Field>
            <Field label="New password">
              <input className="input" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
            </Field>
            <Field label="Confirm new password">
              <input className="input" name="confirmPassword" type="password" autoComplete="new-password" required />
            </Field>
            <SubmitButton>Change password</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
