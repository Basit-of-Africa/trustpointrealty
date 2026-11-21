import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";
import { loginAction } from "@/app/auth-actions";
import { getCurrentUser, homeFor } from "@/lib/auth/session";

export const metadata = { title: "Realtor login" };

export default async function LoginPage({ searchParams }: PageProps<"/realtor-login">) {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user));
  const { next } = await searchParams;
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
      <h1 className="text-2xl font-bold">Realtor login</h1>
      <p className="mt-1 text-sm text-zinc-600">Welcome back. Log in to your partner dashboard.</p>
      <ActionForm action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
        <Field label="Email">
          <input className="input" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password">
          <input className="input" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <div className="flex items-center justify-between">
          <SubmitButton>Log in</SubmitButton>
          <Link href="/forgot-password" className="link text-sm">Forgot password?</Link>
        </div>
      </ActionForm>
      <p className="mt-6 border-t border-zinc-100 pt-4 text-sm text-zinc-600">
        New here? <Link href="/become-a-realtor" className="link">Become a realtor</Link>
      </p>
    </div>
  );
}
