import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700">
      <header className="px-6 py-5">
        <Link href="/realtors" className="inline-block">
          <span className="font-heading text-xl font-bold text-white">TrustPoint <span className="text-accent-500">Realty</span></span>
          <span className="ml-2 text-xs font-semibold tracking-wide text-brand-100 uppercase">Partners</span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center">{children}</main>
      <footer className="px-6 py-5 text-center text-xs text-brand-100">
        © {new Date().getFullYear()} TrustPoint Realty NG · <a className="hover:text-white" href="https://trustpointrealty.ng">trustpointrealty.ng</a>
      </footer>
    </div>
  );
}
