import Link from "next/link";
import SiteNav from "./SiteNav";
import ThemeToggle from "./ThemeToggle";

export const REPOSITORY_URL = "https://github.com/axeomai/rankings";

export default function SiteHeader() {
  return (
    <header className="site-header">
      {/* Brand, navigation, and theme toggle on three columns whose outer two are equal, so the navigation sits at the exact center; on a phone the navigation takes its own row below. */}
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-2.5 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="site-link site-brand justify-self-start py-1">
          STEM Rankings
        </Link>
        <div className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1">
          <SiteNav />
        </div>
        <div className="justify-self-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
