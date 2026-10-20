import type { ReactNode } from "react";

/** The plain reading page the Terms of Service and Privacy Policy share. */
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="flex-1">
      <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <h1 className="page-title">{title}</h1>
        <p className="muted type-small mt-2">Last updated {updated}</p>
        <div className="legal-prose mt-8">{children}</div>
      </article>
    </main>
  );
}
