import type { DiaryDay, Meal, MealItem } from "@/types/diary";

export const QUANTITY_STEPS: Record<string, number> = {
  unidade: 1,
  g: 10,
  ml: 50,
};
export function quantityStep(unit?: string) {
  return QUANTITY_STEPS[unit?.toLowerCase() ?? ""] ?? 1;
}
export function changeQuantity(
  quantity: number,
  unit: string | undefined,
  direction: 1 | -1,
) {
  const next =
    Math.round((quantity + direction * quantityStep(unit)) * 1000) / 1000;
  return next > 0 ? next : quantity;
}
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export type DiaryAction =
  | { type: "new-day"; date: string }
  | { type: "add-meal"; meal: Meal }
  | {
      type: "edit-meal";
      mealId: string;
      changes: Pick<Meal, "mealTypeId" | "mealTypeName" | "iconName" | "time">;
    }
  | { type: "remove-meal"; mealId: string }
  | { type: "add-item"; mealId: string; item: MealItem }
  | { type: "remove-item"; mealId: string; itemId: string }
  | { type: "reorder-items"; mealId: string; itemId: string; overId: string }
  | { type: "quantity"; mealId: string; itemId: string; direction: 1 | -1 };

export function sameMealItem(a: Omit<MealItem, "id">, b: Omit<MealItem, "id">) {
  if (a.foodId || b.foodId) return !!a.foodId && a.foodId === b.foodId;
  const normalize = (value?: string) =>
    (value ?? "").trim().toLocaleLowerCase("pt-BR");
  return (
    !!a.isCustom &&
    !!b.isCustom &&
    normalize(a.name) === normalize(b.name) &&
    normalize(a.unit) === normalize(b.unit)
  );
}

export function diaryReducer(day: DiaryDay, action: DiaryAction): DiaryDay {
  if (action.type === "new-day") return { date: action.date, meals: [] };
  if (
    action.type === "add-meal" &&
    day.meals.some((meal) => meal.mealTypeId === action.meal.mealTypeId)
  )
    return day;
  if (
    action.type === "edit-meal" &&
    day.meals.some(
      (meal) =>
        meal.id !== action.mealId &&
        meal.mealTypeId === action.changes.mealTypeId,
    )
  )
    return day;
  if (action.type === "add-meal")
    return { ...day, meals: [...day.meals, action.meal] };
  if (action.type === "remove-meal")
    return {
      ...day,
      meals: day.meals.filter((meal) => meal.id !== action.mealId),
    };
  return {
    ...day,
    meals: day.meals.map((meal) => {
      if (meal.id !== action.mealId) return meal;
      if (action.type === "edit-meal") return { ...meal, ...action.changes };
      if (action.type === "reorder-items") {
        const from = meal.items.findIndex((item) => item.id === action.itemId);
        const to = meal.items.findIndex((item) => item.id === action.overId);
        if (from < 0 || to < 0 || from === to) return meal;
        const items = [...meal.items];
        items.splice(to, 0, items.splice(from, 1)[0]);
        return { ...meal, items };
      }
      if (action.type === "add-item") {
        const existing = meal.items.find((item) =>
          sameMealItem(item, action.item),
        );
        if (existing)
          return {
            ...meal,
            items: meal.items.map((item) =>
              item.id === existing.id
                ? {
                    ...item,
                    quantity: changeQuantity(item.quantity, item.unit, 1),
                  }
                : item,
            ),
          };
        return { ...meal, items: [...meal.items, action.item] };
      }
      if (action.type === "remove-item")
        return {
          ...meal,
          items: meal.items.filter((item) => item.id !== action.itemId),
        };
      return {
        ...meal,
        items: meal.items.map((item) =>
          item.id === action.itemId
            ? {
                ...item,
                quantity: changeQuantity(
                  item.quantity,
                  item.unit,
                  action.direction,
                ),
              }
            : item,
        ),
      };
    }),
  };
}
