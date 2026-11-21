import { NextResponse, type NextRequest } from "next/server";

/**
 * Realtor recruitment link: /r/TPAB12C
 * Remembers the code for 60 days and sends the visitor to registration.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/r/[code]">) {
  const { code } = await ctx.params;
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
  const res = NextResponse.redirect(new URL(`/become-a-realtor?ref=${clean}`, request.url));
  res.cookies.set("tp_ref", clean, {
    maxAge: 60 * 86_400,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
