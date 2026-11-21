import { redirect } from "next/navigation";

// The main marketing site still lives on WordPress for now; the portal's
// root goes straight to the partners landing page.
export default function Home() {
  redirect("/realtors");
}
