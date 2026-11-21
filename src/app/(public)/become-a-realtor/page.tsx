import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";
import { registerAction } from "@/app/auth-actions";
import { getCurrentUser, homeFor } from "@/lib/auth/session";

export const metadata = { title: "Become a realtor" };

export default async function RegisterPage({ searchParams }: PageProps<"/become-a-realtor">) {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user));
  const { ref } = await searchParams;
  const referral = (typeof ref === "string" ? ref : (await cookies()).get("tp_ref")?.value) ?? "";

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
      <h1 className="text-2xl font-bold">Become a TrustPoint realtor</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Create your account. Our team will review and activate it, usually within one working day.
      </p>
      <ActionForm action={registerAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <input className="input" name="firstName" autoComplete="given-name" required />
        </Field>
        <Field label="Last name">
          <input className="input" name="lastName" autoComplete="family-name" required />
        </Field>
        <Field label="Email">
          <input className="input" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Phone (WhatsApp)">
          <input className="input" name="phone" type="tel" autoComplete="tel" placeholder="0803 123 4567" required />
        </Field>
        <Field label="Password" hint="At least 8 characters, with a number or symbol.">
          <input className="input" name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Field label="Confirm password">
          <input className="input" name="confirmPassword" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Referral code (optional)" hint="The code of the realtor who invited you." className="sm:col-span-2">
          <input className="input uppercase" name="referralCode" defaultValue={referral} placeholder="e.g. TPAB12C" />
        </Field>
        <label className="flex items-start gap-2 text-sm text-zinc-700 sm:col-span-2">
          <input type="checkbox" name="terms" className="mt-0.5" required />
          I agree to TrustPoint Realty&apos;s realtor terms and confirm my details are correct.
        </label>
        <div className="sm:col-span-2">
          <SubmitButton className="w-full sm:w-auto">Create account</SubmitButton>
        </div>
      </ActionForm>
      <p className="mt-6 border-t border-zinc-100 pt-4 text-sm text-zinc-600">
        Already registered? <Link href="/realtor-login" className="link">Log in</Link>
      </p>
    </div>
  );
}
