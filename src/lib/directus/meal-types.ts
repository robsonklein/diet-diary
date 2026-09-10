import type { MealType } from "@/types/directus";
import { optionalText, readCollection, recordId, requiredText } from "./client";

export async function getMealTypes(): Promise<MealType[]> {
  const rows = await readCollection("meal_types", "id,name,icon_name,sort");
  return rows.map((row) => ({
    id: recordId(row.id),
    name: requiredText(row.name),
    icon_name: optionalText(row.icon_name),
    sort: Number(row.sort) || 0,
  }));
}
