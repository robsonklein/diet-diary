import "server-only";

export async function readCollection(
  collection: "foods" | "meal_types",
  fields: string,
  activeOnly = false,
): Promise<Record<string, unknown>[]> {
  const base = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!base)
    throw new Error(
      "Configure NEXT_PUBLIC_DIRECTUS_URL no arquivo .env.local para conectar o catálogo.",
    );
  const token = process.env.DIRECTUS_READ_TOKEN;
  const rows: Record<string, unknown>[] = [];
  // Paginação evita truncar catálogos maiores que o limite padrão da API.
  for (let page = 1; ; page++) {
    const url = new URL(`${base.replace(/\/$/, "")}/items/${collection}`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("sort", "sort,name,id");
    url.searchParams.set("limit", "100");
    url.searchParams.set("page", String(page));
    if (activeOnly) url.searchParams.set("filter[active][_eq]", "true");
    let response: Response;
    try {
      response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new Error(
        "Não foi possível conectar ao Directus. Confira a URL e a disponibilidade do serviço.",
      );
    }
    if (!response.ok)
      throw new Error(
        `Falha ao carregar ${collection} (HTTP ${response.status}). Confira as permissões de leitura no Directus.`,
      );
    const body = await response.json();
    if (!Array.isArray(body.data))
      throw new Error("O Directus retornou um catálogo inválido.");
    if (!body.data.length) break;
    rows.push(...body.data);
  }
  return rows;
}

export function requiredText(value: unknown): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error("Há um registro sem nome válido no catálogo do Directus.");
  return value.trim();
}
export function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
export function recordId(value: unknown): string {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    String(value) === ""
  )
    throw new Error("Há um registro sem ID válido no catálogo.");
  return String(value);
}
