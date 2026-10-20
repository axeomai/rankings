import Link from "next/link";
import GitHubMark from "./GitHubMark";
import { REPOSITORY_URL } from "./SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="thry-site-footer">
      <div className="muted type-small mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-6 sm:px-6">
        <p>© {new Date().getFullYear()} STEM Rankings</p>
        <nav aria-label="Legal and source" className="flex items-center gap-5">
          <Link href="/terms" className="site-link">
            Terms of Service
          </Link>
          <Link href="/privacy" className="site-link">
            Privacy Policy
          </Link>
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source on GitHub"
            title="Source on GitHub"
            className="site-link inline-flex"
          >
            <GitHubMark className="size-[18px]" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
