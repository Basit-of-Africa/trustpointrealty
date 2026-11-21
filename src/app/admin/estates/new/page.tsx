import { requireAdmin } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/ui";
import { EstateForm } from "../estate-form";

export const metadata = { title: "Add estate" };

export default async function NewEstatePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add estate" />
      <Card><EstateForm /></Card>
    </>
  );
}
