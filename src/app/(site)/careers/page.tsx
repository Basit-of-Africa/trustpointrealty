import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { images, jobs, recruitmentEmail } from "@/content/site";
import { Container, PageHero, StatsBand } from "@/components/site/sections";
import { whyChoose } from "@/content/site";
import { Icon } from "@/components/site/icons";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <>
      <PageHero title="Careers at TrustPoint" image={images.careersHero} />
      <section className="py-[100px] pb-6">
        <Container>
          <h2 className="text-[26px] font-bold text-accent-500">Start a Career at TrustPoint Realty</h2>
          <p className="mt-6 max-w-[600px] leading-7">
            At TrustPoint Realty, we redefine real estate excellence. Our seasoned team of professionals brings a wealth of experience and unwavering commitment to ensuring your property journey is seamless.
          </p>
        </Container>
      </section>

      <section className="bg-tp-light py-[50px]">
        <Container className="space-y-4">
          {jobs.map((job, i) => (
            <details key={job.title} open={i === 0} className="group">
              <summary className="relative flex cursor-pointer list-none items-center justify-between bg-tp-orange px-[30px] py-5 text-lg text-white">
                {job.title}
                <ChevronRight className="h-5 w-5 transition group-open:rotate-90" aria-hidden />
                <span className="absolute -bottom-2 left-1/2 hidden h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[8px] border-x-transparent border-t-zinc-700 group-open:block" aria-hidden />
              </summary>
              <div className="space-y-6 px-[15px] py-6 leading-7">
                <p>{job.intro}</p>
                <p>Location: {job.location}<br /><strong>{job.note}</strong></p>
                <p>Job Type: {job.type}</p>
                <div>
                  <p>Responsibilities:</p>
                  <ul className="mt-4">{job.responsibilities.map((r) => <li key={r}>✅ {r}</li>)}</ul>
                </div>
                <div>
                  <p>Requirements:</p>
                  <ul className="mt-4">{job.requirements.map((r) => <li key={r}>✔ {r}</li>)}</ul>
                </div>
                <div>
                  <p>Benefits:</p>
                  <ul className="mt-4">{job.benefits.map((r) => <li key={r}>🔹 {r}</li>)}</ul>
                </div>
                <p>{job.closing}</p>
                <p>
                  📩 To Apply: Send your CV to <a className="underline" href={`mailto:${job.applyEmail}`}>{job.applyEmail}</a> or call{" "}
                  <a className="underline" href={`tel:${job.applyPhone}`}>{job.applyPhone}</a> for more details.
                </p>
                <p className="italic">{job.tags}</p>
              </div>
            </details>
          ))}
        </Container>
      </section>

      <section className="py-[100px] pb-6">
        <Container>
          <h2 className="text-[26px] font-bold text-brand-900">Disclaimer</h2>
          <p className="mt-6 leading-7">
            TrustPoint Realty is an equal opportunity employer and does not discriminate based on indices.<br />
            If you encounter any suspicious activity, please report it to <a className="underline" href={`mailto:${recruitmentEmail}`}>{recruitmentEmail}</a> immediately.
          </p>
        </Container>
      </section>

      <StatsBand />
      <section className="bg-tp-light py-5">
        <Container className="grid gap-5 md:grid-cols-3">
          {whyChoose.map((w) => (
            <div key={w.title} className="flex gap-4 border border-zinc-200 bg-tp-light p-[40px]">
              <Icon name={w.icon} className="h-12 w-12 shrink-0 text-tp-orange" />
              <div>
                <h3 className="text-[26px] font-bold text-brand-900">{w.title}</h3>
                <p className="mt-3 leading-7">{w.text}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
