"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DISCIPLINES } from "@/lib/disciplines";

/** The three disciplines, each at its own path (stemrankings.org/mathematics, …); the current one reads at full strength. */
export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Disciplines">
      <ul className="flex items-center justify-center gap-1">
        {Object.values(DISCIPLINES).map((d) => (
          <li key={d.id}>
            <Link
              href={`/${d.id}`}
              aria-current={pathname === `/${d.id}` ? "page" : undefined}
              data-variant="quiet"
              className="button header-nav-trigger inline-flex h-8 items-center px-3 type-small whitespace-nowrap"
            >
              {d.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
