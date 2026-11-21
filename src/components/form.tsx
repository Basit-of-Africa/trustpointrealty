"use client";

import { createContext, useActionState, useContext, useEffect, useRef, useState, startTransition } from "react";
import type { ReactNode } from "react";

export type ActionState = { error?: string; success?: string; at?: number };
type Action = (prev: ActionState, data: FormData) => Promise<ActionState>;

const PendingContext = createContext(false);

/**
 * A form bound to a server action. Shows the action's error/success
 * message. Field values are kept on error, and cleared on success when
 * resetOnSuccess is set.
 */
export function ActionForm({
  action,
  children,
  className = "space-y-4",
  resetOnSuccess = false,
  inlineSuccess = false,
  confirm,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  /** Keep the success message inside the form (e.g. it contains a link to copy). */
  inlineSuccess?: boolean;
  confirm?: string;
}) {
  // Success messages go to the shell's toast, which survives even when the
  // action removes this form (e.g. approving the last pending item).
  const [state, dispatch, pending] = useActionState(async (prev: ActionState, data: FormData) => {
    const result = await action(prev, data);
    if (result?.success && !inlineSuccess) toast(result.success);
    return result ?? {};
  }, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <PendingContext value={pending}>
      {/* method="post": if someone submits before JavaScript loads, the browser
          must never fall back to GET, which would put fields (passwords) in the URL. */}
      <form
        ref={ref}
        method="post"
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          if (confirm && !window.confirm(confirm)) return;
          const data = new FormData(e.currentTarget);
          startTransition(() => dispatch(data));
        }}
      >
        {children}
        {state.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.success && inlineSuccess && (
          <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm break-all text-emerald-800">
            {state.success}
          </p>
        )}
      </form>
    </PendingContext>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  small = false,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  small?: boolean;
  className?: string;
}) {
  const pending = useContext(PendingContext);
  // Full class names are written out so Tailwind generates them.
  const variants = { primary: "btn-primary", secondary: "btn-secondary", danger: "btn-danger" };
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${variants[variant]} ${small ? "btn-sm" : ""} ${className}`}
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  return (
    <button
      type="button"
      className="btn-secondary btn-sm"
      onClick={async (e) => {
        const btn = e.currentTarget;
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = label), 1500);
      }}
    >
      {label}
    </button>
  );
}

/** A header checkbox that ticks every checkbox with the given name in the same form. */
export function SelectAll({ name }: { name: string }) {
  return (
    <input
      type="checkbox"
      aria-label="Select all"
      onChange={(e) => {
        const form = e.currentTarget.form;
        form?.querySelectorAll<HTMLInputElement>(`input[type=checkbox][name="${name}"]`).forEach((cb) => {
          cb.checked = e.currentTarget.checked;
        });
      }}
    />
  );
}

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("tp:toast", { detail: message }));
}

/** Shows success messages from ActionForm. Mounted once in the app shell. */
export function Toaster() {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    const onToast = (e: Event) => {
      const id = Date.now() + Math.random();
      setMessages((m) => [...m, { id, text: (e as CustomEvent<string>).detail }]);
      setTimeout(() => setMessages((m) => m.filter((x) => x.id !== id)), 5000);
    };
    window.addEventListener("tp:toast", onToast);
    return () => window.removeEventListener("tp:toast", onToast);
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:right-6 sm:left-auto sm:items-end">
      {messages.map((m) => (
        <div key={m.id} role="status" className="pointer-events-auto max-w-sm rounded-lg bg-brand-900 px-4 py-3 text-sm text-white shadow-lg">
          ✓ {m.text}
        </div>
      ))}
    </div>
  );
}
