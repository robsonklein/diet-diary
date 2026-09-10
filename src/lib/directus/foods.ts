import { optionalText, readCollection, recordId, requiredText } from "./client";
import type { Food } from "@/types/directus";

export async function getFoods(): Promise<Food[]> {
  const rows = await readCollection(
    "foods",
    "id,name,unit,default_quantity,icon_name,active,sort",
    true,
  );
  return rows.map((row) => {
    const quantity = Number(row.default_quantity);
    if (!Number.isFinite(quantity) || quantity <= 0)
      throw new Error(
        "Um alimento possui default_quantity inválida no Directus.",
      );
    return {
      id: recordId(row.id),
      name: requiredText(row.name),
      unit: optionalText(row.unit) ?? "",
      default_quantity: quantity,
      icon_name: optionalText(row.icon_name),
      active: true,
      sort: Number(row.sort) || 0,
    };
  });
}
