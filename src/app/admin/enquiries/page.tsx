import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { pageFrom, PAGE_SIZE } from "@/lib/queries";
import { Badge, Card, Empty, PageHeader, Pager } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/form";
import { setEnquiryStatusAction } from "../actions";

export const metadata = { title: "Enquiries" };

const tabs = ["new", "contacted", "closed"] as const;

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = tabs.find((t) => t === sp.status) ?? "new";
  const page = pageFrom(sp.page);
  const db = getDb();
  const { enquiries } = schema;
  const [rows, counts] = await Promise.all([
    db.select().from(enquiries).where(eq(enquiries.status, status)).orderBy(desc(enquiries.createdAt)).limit(PAGE_SIZE + 1).offset((page - 1) * PAGE_SIZE),
    db.select({ status: enquiries.status, n: count() }).from(enquiries).groupBy(enquiries.status),
  ]);
  const n = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <>
      <PageHeader title="Enquiries" description="“Request a Quote” submissions from the website." />
      <div className="mb-3 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link key={t} href={`/admin/enquiries?status=${t}`}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${status === t ? "bg-brand-900 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200"}`}>
            {t} ({n(t)})
          </Link>
        ))}
      </div>
      <Card flush>
        {rows.length === 0 ? <Empty>No {status} enquiries.</Empty> : (
          <table className="data-table">
            <thead><tr><th>Received</th><th>Name</th><th>Contact</th><th>Interest</th><th>Notes</th><th /></tr></thead>
            <tbody>
              {rows.slice(0, PAGE_SIZE).map((e) => (
                <tr key={e.id}>
                  <td className="text-xs whitespace-nowrap">{formatDateTime(e.createdAt)}<div className="text-zinc-500">#{e.id}{e.sourcePage ? ` · ${e.sourcePage}` : ""}</div></td>
                  <td className="font-medium">{[e.prefix, e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ")}</td>
                  <td className="text-xs">
                    <a className="link" href={`tel:${e.phone}`}>{formatPhone(e.phone)}</a>
                    <div><a className="link" href={`mailto:${e.email}`}>{e.email}</a></div>
                    <a className="link" target="_blank" rel="noreferrer" href={`https://wa.me/${e.phone.replace(/\D/g, "")}`}>WhatsApp</a>
                  </td>
                  <td className="text-xs">{e.packages.length ? e.packages.join(", ") : "—"}</td>
                  <td className="max-w-xs text-xs">{e.notes ?? "—"}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      {tabs.filter((t) => t !== e.status).map((t) => (
                        <ActionForm key={t} action={setEnquiryStatusAction} className="">
                          <input type="hidden" name="enquiryId" value={e.id} />
                          <input type="hidden" name="status" value={t} />
                          <SubmitButton variant="secondary" small>Mark {t}</SubmitButton>
                        </ActionForm>
                      ))}
                    </div>
                    <div className="mt-1"><Badge>{e.status}</Badge></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager page={page} hasMore={rows.length > PAGE_SIZE} basePath="/admin/enquiries" params={{ status }} />
      </Card>
    </>
  );
}
