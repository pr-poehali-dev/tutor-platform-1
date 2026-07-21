import func2url from "../../../backend/func2url.json";

const REGISTRY_URL = (func2url as Record<string, string>)["grants-registry"];

export type GrantStatus = "open" | "soon" | "closed";

export interface RegistryGrant {
  slug: string;
  name: string;
  organizer: string;
  description: string;
  category: string;
  region: string | null;
  amount_min: number | null;
  amount_max: number | null;
  amount_text: string | null;
  starts_on: string | null;
  deadline_on: string | null;
  results_on: string | null;
  official_url: string;
  source_verified: boolean;
  verified_at: string | null;
  status: GrantStatus;
  days_left: number | null;
}

export interface RegistryResponse {
  items: RegistryGrant[];
  today: string;
}

export async function fetchGrantsRegistry(): Promise<RegistryResponse> {
  const res = await fetch(REGISTRY_URL);
  if (!res.ok) throw new Error("Не удалось загрузить реестр грантов");
  return res.json();
}
