import { getFoods } from "@/lib/directus/foods";
import { getMealTypes } from "@/lib/directus/meal-types";
import { getMockCatalog } from "@/lib/mock-catalog";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const source = process.env.CATALOG_SOURCE ?? "mock";
    if (source === "mock") {
      return Response.json(getMockCatalog(), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    if (source !== "directus") {
      throw new Error("CATALOG_SOURCE deve ser mock ou directus.");
    }
    const [foods, mealTypes] = await Promise.all([getFoods(), getMealTypes()]);
    return Response.json(
      { foods, mealTypes },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o catálogo.",
      },
      { status: 503 },
    );
  }
}
