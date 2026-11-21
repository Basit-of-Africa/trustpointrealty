import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";
import { forgotPasswordAction } from "@/app/auth-actions";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Enter your email and we&apos;ll send you a reset link. You can also ask the TrustPoint office to send you one on WhatsApp.
      </p>
      <ActionForm action={forgotPasswordAction} className="mt-6 space-y-4" resetOnSuccess inlineSuccess>
        <Field label="Email">
          <input className="input" name="email" type="email" required />
        </Field>
        <SubmitButton>Send reset link</SubmitButton>
      </ActionForm>
      <p className="mt-6 text-sm"><Link href="/realtor-login" className="link">← Back to login</Link></p>
    </div>
  );
}
