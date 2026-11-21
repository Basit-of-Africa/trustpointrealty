import Link from "next/link";

export const metadata = { title: "Realtors" };

export default function RealtorsLanding() {
  return (
    <div className="max-w-xl text-center text-white">
      <p className="text-sm font-semibold tracking-wide text-accent-400 uppercase">
        Welcome to TrustPoint Realty Partners Portal
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Learn, earn and grow your real estate passion.
      </h1>
      <p className="mt-4 text-brand-100">
        Join our league of realtors from different walks of life. Register your clients, track
        every sale and see each commission and payout in one place.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/become-a-realtor" className="btn bg-accent-400 px-6 py-3 text-brand-900 hover:bg-accent-500">
          Register
        </Link>
        <Link href="/realtor-login" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
          Login
        </Link>
      </div>
    </div>
  );
}
