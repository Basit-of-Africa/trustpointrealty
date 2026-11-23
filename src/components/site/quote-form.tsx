"use client";

import { usePathname } from "next/navigation";
import { startTransition, useActionState, useRef, useState } from "react";
import { quotePackages } from "@/content/site";
import { requestQuoteAction, type QuoteState } from "@/app/(site)/actions";

const line =
  "block w-full border-0 border-b border-white bg-transparent px-0 pt-6 pb-2 text-[16px] text-white placeholder:text-white focus:border-accent-500 focus:ring-0 focus:outline-none";

/** "Request a Quote" form, styled like the live site's Forminator form. */
export function QuoteForm({ wide = false }: { wide?: boolean }) {
  const pathname = usePathname();
  const ref = useRef<HTMLFormElement>(null);
  const [notes, setNotes] = useState("");
  const [state, dispatch, pending] = useActionState(async (prev: QuoteState, data: FormData) => {
    const result = await requestQuoteAction(prev, data);
    if (result.ok) {
      ref.current?.reset();
      setNotes("");
    }
    return result;
  }, {});

  const pair = wide ? "grid gap-x-[30px] sm:grid-cols-2" : "";

  return (
    <div>
      <h2 className="text-4xl font-bold text-white lg:text-[44px]">Request a Quote</h2>
      <p className="mt-6 text-[15px] text-white">Ready to Work Together? Build a project with us!</p>
      <form
        ref={ref}
        method="post"
        className="mt-14 sm:px-[10px]"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => dispatch(data));
        }}
      >
        <input type="hidden" name="sourcePage" value={pathname} />
        <div className="absolute -left-[9999px]" aria-hidden>
          <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        <fieldset>
          <legend className="text-[12px] font-bold text-zinc-400">Packages</legend>
          {quotePackages.map((p) => (
            <label key={p} className="mt-3 flex items-center gap-3 text-[14px] text-white">
              <input type="checkbox" name="packages" value={p} className="h-5 w-5 shrink-0 appearance-none border-2 border-white bg-transparent checked:border-accent-500 checked:bg-accent-500" />
              {p}
            </label>
          ))}
        </fieldset>

        <label className="mt-5 block">
          <span className="sr-only">Additional notes</span>
          <textarea
            name="notes"
            rows={5}
            maxLength={180}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes"
            className="block w-full border border-white bg-transparent p-2.5 text-[16px] text-white placeholder:text-white focus:border-accent-500 focus:outline-none"
          />
          <span className="mt-1 block text-right text-[12px] text-zinc-400">{notes.length} / 180</span>
        </label>

        <div className={`mt-6 ${pair}`}>
          <label className="block">
            <span className="text-[12px] font-bold text-zinc-400">Prefix</span>
            <select name="prefix" defaultValue="Mr." className={`${line} pt-1`}>
              {["Mr.", "Mrs.", "Ms.", "Mx.", "Miss", "Dr.", "Prof."].map((p) => (
                <option key={p} value={p} className="text-black">{p}</option>
              ))}
            </select>
          </label>
          <label className="block"><span className="sr-only">First Name</span><input name="firstName" required autoComplete="given-name" placeholder="First Name *" className={line} /></label>
        </div>
        <div className={`mt-4 ${pair}`}>
          <label className="block"><span className="sr-only">Middle Name</span><input name="middleName" autoComplete="additional-name" placeholder="Middle Name" className={line} /></label>
          <label className="block"><span className="sr-only">Last Name</span><input name="lastName" required autoComplete="family-name" placeholder="Last Name *" className={line} /></label>
        </div>
        <label className="mt-4 block"><span className="sr-only">Email Address</span><input name="email" type="email" required autoComplete="email" placeholder="Email Address *" className={line} /></label>
        <label className="mt-4 block"><span className="sr-only">Phone Number</span><input name="phone" type="tel" required autoComplete="tel" placeholder="Phone Number *" className={line} /></label>

        {state.error && <p role="alert" className="mt-5 bg-red-500/15 px-3 py-2 text-[14px] text-red-200">{state.error}</p>}
        {state.ok && (
          <p role="status" className="mt-5 bg-emerald-500/15 px-3 py-2 text-[14px] text-emerald-200">
            Thank you! Your request has been received. Our team will contact you shortly.
          </p>
        )}
        <button type="submit" disabled={pending} className="mt-5 bg-accent-500 px-2.5 py-2.5 text-[14px] text-brand-900 uppercase transition hover:bg-accent-600 disabled:opacity-60">
          {pending ? "Sending…" : "Request Quote"}
        </button>
      </form>
    </div>
  );
}
