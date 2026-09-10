import type { Catalog } from "@/types/directus";

export async function getCatalog(signal?: AbortSignal): Promise<Catalog> {
  const response = await fetch("/api/catalog", { cache: "no-store", signal });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Não foi possível carregar o catálogo.");
  return data;
}
