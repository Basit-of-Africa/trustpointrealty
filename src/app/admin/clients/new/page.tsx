import { requireAdmin } from "@/lib/auth/session";
import { activeEstates, realtorOptions } from "@/lib/queries";
import { Card, PageHeader } from "@/components/ui";
import { ClientForm } from "../client-form";

export const metadata = { title: "Add client" };

export default async function NewClientPage() {
  await requireAdmin();
  const [realtors, estates] = await Promise.all([realtorOptions(), activeEstates()]);
  return (
    <>
      <PageHeader title="Add client" />
      <Card><ClientForm realtors={realtors} estates={estates} /></Card>
    </>
  );
}
