import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { REPOSITORY_URL } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Privacy Policy · STEM Rankings" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 20, 2026">
      <p>STEM Rankings has no accounts and never asks for your personal information. This page explains the little the site does handle.</p>
      <h2>In your browser</h2>
      <p>
        The site remembers whether you chose the light or dark theme by saving that choice in your browser&rsquo;s local
        storage. It stays on your device and is never sent to us.
      </p>
      <h2>Analytics</h2>
      <p>
        We count visits with Umami, a privacy-focused analytics tool that doesn&rsquo;t use cookies and doesn&rsquo;t
        identify you. It records aggregate information such as the pages viewed, the referring site, and the browser and
        country of each visit.
      </p>
      <h2>Server logs</h2>
      <p>
        Like most websites, the servers that host the site may keep standard request logs, such as IP address, browser, and
        the page requested, for security and reliability.
      </p>
      <h2>Researchers in the rankings</h2>
      <p>
        The rankings show researchers&rsquo; names, ORCID iDs, and affiliations as they appear in OpenAlex&rsquo;s public
        records of published papers. If something about you is wrong, correcting it at the source (OpenAlex or ORCID) fixes
        it here on the next data refresh, or you can{" "}
        <a href={`${REPOSITORY_URL}/issues`} target="_blank" rel="noopener noreferrer" className="link">
          open an issue on GitHub
        </a>
        .
      </p>
      <h2>Changes</h2>
      <p>We may update this policy. The date at the top shows when it last changed.</p>
    </LegalPage>
  );
}
