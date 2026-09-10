import "server-only";
import data from "@/data/directus-mock-plano-alimentar.json";
import type { Catalog } from "@/types/directus";

function catalogOrder(
  a: { sort: number; name: string; id: string },
  b: { sort: number; name: string; id: string },
) {
  return (
    a.sort - b.sort ||
    a.name.localeCompare(b.name, "pt-BR") ||
    a.id.localeCompare(b.id)
  );
}

export function getMockCatalog(): Catalog {
  // Copia somente os campos usados pelo diário; o arquivo original é imutável.
  return {
    foods: data.foods
      .filter((food) => food.active)
      .map(({ id, name, unit, default_quantity, icon_name, active, sort }) => ({
        id,
        name,
        unit,
        default_quantity,
        icon_name,
        active,
        sort,
      }))
      .sort(catalogOrder),
    mealTypes: data.meal_types
      .map(({ id, name, icon_name, sort }) => ({ id, name, icon_name, sort }))
      .sort(catalogOrder),
  };
}
