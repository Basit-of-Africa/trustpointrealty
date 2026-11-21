import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/ui";
import { EstateForm } from "../estate-form";

export const metadata = { title: "Edit estate" };

export default async function EditEstatePage({ params }: PageProps<"/admin/estates/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [estate] = await getDb().select().from(schema.estates).where(eq(schema.estates.id, id)).limit(1);
  if (!estate) notFound();
  return (
    <>
      <PageHeader title={estate.name} description="Rate changes apply to sales recorded after you save. Existing sales keep their rates." />
      <Card><EstateForm estate={estate} /></Card>
    </>
  );
}
