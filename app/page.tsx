import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { DEFAULT_DISCIPLINE, DISCIPLINES, getAllAreaIds, getAllJournals } from "@/lib/disciplines";
import HeroShader from "@/components/HeroShader";

export const metadata: Metadata = {
  title: "STEM Rankings",
  description:
    "Mathematics, physics, and computer science departments ranked by publications in selective venues, built from OpenAlex open data.",
};

const STEPS: { title: string; body: ReactNode }[] = [
  {
    title: "Choose the venues",
    body: "Each research area has a short list of selective journals and conferences, the places its strongest work appears.",
  },
  {
    title: "Collect the papers",
    body: "Every paper published in those venues comes from OpenAlex, with its authors and the institutions they list.",
  },
  {
    title: "Share the credit",
    body: (
      <>
        A paper with <i>n</i> authors gives each of them 1/<i>n</i>. An author listing several affiliations splits that
        share between them, so no paper counts for more than one.
      </>
    ),
  },
  {
    title: "Add it up",
    body: "An institution's score is the sum of its authors' shares in the areas and years you choose. Ranks are recomputed as you filter.",
  },
];

export default function HomePage() {
  const disciplines = Object.values(DISCIPLINES);

  return (
    <main className="flex-1">
      <section className="home-hero relative isolate overflow-hidden">
        <HeroShader />
        <div aria-hidden className="home-hero-scrim absolute inset-0" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-24 align-center sm:px-6 sm:py-32">
          <p className="section-label">Mathematics · Physics · Computer Science</p>
          <h1 className="home-title mt-4">Department rankings built from open data</h1>
          <p className="home-lead muted mt-5 max-w-2xl">
            STEM Rankings ranks university departments by what their researchers publish in each field&rsquo;s most
            selective venues. Every paper is counted from OpenAlex, and the method is open source.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link href={`/${DEFAULT_DISCIPLINE}`} data-variant="primary" className="button inline-flex h-10 items-center gap-2 px-4">
              Explore the rankings
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link href="#how-it-works" data-variant="quiet" className="button inline-flex h-10 items-center px-4">
              How it works
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <section id="what-we-do" aria-labelledby="what-we-do-title" className="home-section">
          <h2 id="what-we-do-title" className="home-heading">What we do</h2>
          <p className="home-body muted mt-3 max-w-2xl">
            We count publications, not reputations. For each field we pick the venues where its strongest work appears,
            then credit every paper to the institutions of its authors. The result is a ranking you can reshape: choose the
            research areas, the years, and the region that matter to you. The approach follows{" "}
            <a href="https://csrankings.org" target="_blank" rel="noopener noreferrer" className="link">
              CSRankings
            </a>
            .
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {disciplines.map((d) => (
              <li key={d.id}>
                <Link href={`/${d.id}`} className="lib-card flex h-full flex-col gap-2 p-5">
                  <span className="lib-card-name">{d.title}</span>
                  <span className="lib-card-description flex-1">{d.description}</span>
                  <span className="lib-card-footer type-tiny mt-2 flex items-center justify-between">
                    {getAllAreaIds(d).length} areas · {new Set(getAllJournals(d).map((j) => j.displayName)).size} venues
                    <ArrowRight aria-hidden className="lib-card-arrow size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="data" aria-labelledby="data-title" className="home-section">
          <h2 id="data-title" className="home-heading">Where the data comes from</h2>
          <div className="mt-3 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="home-body muted flex flex-col gap-4">
              <p>
                Every number comes from{" "}
                <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="link">
                  OpenAlex
                </a>
                , a free and open catalog of the world&rsquo;s scholarly papers, authors, and institutions, run by the
                nonprofit OurResearch.
              </p>
              <p>
                Nothing is entered by hand. Departments and researchers are found through the affiliations authors list on
                their papers, and the venue list for every research area is published with the code.
              </p>
              <p>
                Because affiliations come from the papers themselves, a researcher counts where they were when they
                published, not where they are today.
              </p>
            </div>
            <dl className="home-facts flex flex-col">
              <div className="home-fact py-3">
                <dt className="section-label">Source</dt>
                <dd className="mt-1">OpenAlex works, authors, and institutions</dd>
              </div>
              <div className="home-fact py-3">
                <dt className="section-label">Venues</dt>
                <dd className="mt-1">Selective journals and conferences, chosen per research area</dd>
              </div>
              <div className="home-fact py-3">
                <dt className="section-label">Code</dt>
                <dd className="mt-1">
                  <a href="https://github.com/axeomai/rankings" target="_blank" rel="noopener noreferrer" className="link">
                    Open source on GitHub
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="how-it-works-title" className="home-section">
          <h2 id="how-it-works-title" className="home-heading">How it&rsquo;s done</h2>
          <ol className="steps mt-6 flex max-w-2xl flex-col">
            {STEPS.map((step) => (
              <li key={step.title} className="step grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
                <span className="step-rail relative flex justify-center">
                  <span aria-hidden className="step-dot type-tiny inline-flex size-7 items-center justify-center font-semibold" />
                </span>
                <div className="pb-7">
                  <h3 className="home-step-title">{step.title}</h3>
                  <p className="home-body muted mt-1">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
