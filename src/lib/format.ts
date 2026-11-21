const dateFmt = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Lagos",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

/** Accepts a Date or a "YYYY-MM-DD" string from a Postgres date column. */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d =
    typeof value === "string" ? new Date(`${value}T12:00:00+01:00`) : value;
  return dateFmt.format(d);
}

export function formatDateTime(value: Date | null | undefined): string {
  return value ? dateTimeFmt.format(value) : "—";
}

/** Today's date in Lagos as YYYY-MM-DD, for date input defaults. */
export function todayLagos(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(
    new Date(),
  );
}

export function fullName(u: { firstName: string; lastName: string }): string {
  return `${u.firstName} ${u.lastName}`.trim();
}
