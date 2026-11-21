import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";
import { resetPasswordAction } from "@/app/auth-actions";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ params }: PageProps<"/reset-password/[token]">) {
  const { token } = await params;
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <ActionForm action={resetPasswordAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <Field label="New password" hint="At least 8 characters, with a number or symbol.">
          <input className="input" name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Field label="Confirm new password">
          <input className="input" name="confirmPassword" type="password" autoComplete="new-password" required />
        </Field>
        <SubmitButton>Save password</SubmitButton>
      </ActionForm>
    </div>
  );
}
