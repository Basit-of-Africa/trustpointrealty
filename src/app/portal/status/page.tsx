import { redirect } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Account status" };

export default async function StatusPage() {
  const user = await requireUser();
  if (user.status === "active") redirect("/portal");
  const messages: Record<string, { title: string; body: string }> = {
    pending: {
      title: "Your account is awaiting approval",
      body: "Thanks for registering! The TrustPoint team will review your details and activate your account, usually within one working day. You'll be able to register clients and track commissions once you're approved.",
    },
    suspended: {
      title: "Your account is suspended",
      body: "Your realtor account has been suspended. Please contact the TrustPoint office on 07025050037 or hello@trustpointrealty.ng.",
    },
    rejected: {
      title: "Your application wasn't approved",
      body: "Please contact the TrustPoint office if you have any questions.",
    },
  };
  const m = messages[user.status] ?? messages.pending;
  return (
    <>
      <PageHeader title={`Hello, ${user.firstName}`} />
      <Card>
        <h2 className="text-lg font-semibold">{m.title}</h2>
        <p className="mt-2 max-w-prose text-sm text-zinc-600">{m.body}</p>
        <p className="mt-4 text-sm text-zinc-600">
          Your referral code: <span className="font-mono font-semibold">{user.referralCode}</span>
        </p>
      </Card>
    </>
  );
}
