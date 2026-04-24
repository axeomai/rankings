import { headers } from "next/headers";
import { DISCIPLINES, DEFAULT_DISCIPLINE } from "@rankings/backend/src/lib/disciplines";
import type { Discipline } from "@rankings/backend/src/lib/disciplines";

export async function getDiscipline(): Promise<Discipline> {
  const host = (await headers()).get("host") ?? "";
  const subdomain = host.split(":")[0].split(".")[0];
  if (subdomain in DISCIPLINES) return DISCIPLINES[subdomain];
  return DISCIPLINES[DEFAULT_DISCIPLINE];
}
