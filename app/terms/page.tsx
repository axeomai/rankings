import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { REPOSITORY_URL } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Terms of Service · STEM Rankings" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 20, 2026">
      <p>
        These terms cover your use of STEM Rankings (the &ldquo;site&rdquo;). By using the site you agree to them. If you
        don&rsquo;t agree, please don&rsquo;t use the site.
      </p>
      <h2>What the site is</h2>
      <p>
        STEM Rankings is a free, informational ranking of university departments, computed from publication data. It needs
        no account, and it is not an official evaluation of any institution, department, or person.
      </p>
      <h2>The data</h2>
      <p>
        Publication data comes from OpenAlex, which releases its data under the CC0 public-domain dedication. Rankings are
        computed automatically from that data and from the venue lists we choose. They may contain errors, such as a missed
        paper or a wrong affiliation, and they change as the data does.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Don&rsquo;t use the site in a way that disrupts it or its service for others, for example by sending automated
        requests at a rate that degrades it. The source code is available to run yourself.
      </p>
      <h2>No warranty</h2>
      <p>
        The site and its rankings are provided &ldquo;as is&rdquo;, without warranties of any kind. To the extent the law
        allows, we are not liable for any loss arising from your use of the site or from decisions based on it.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows when they last changed.</p>
      <h2>Contact</h2>
      <p>
        Questions or corrections are welcome as{" "}
        <a href={`${REPOSITORY_URL}/issues`} target="_blank" rel="noopener noreferrer" className="link">
          issues on GitHub
        </a>
        .
      </p>
    </LegalPage>
  );
}
