import type { DiaryDay, Meal, MealItem } from "@/types/diary";
import { localDate } from "./diary";

export const DIARY_STORAGE_KEY = "nutri.diary.v1";

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function optionalText(value: unknown) {
  return value === undefined || typeof value === "string";
}
function validItem(value: unknown): value is MealItem {
  return (
    record(value) &&
    text(value.id) &&
    text(value.name) &&
    typeof value.quantity === "number" &&
    Number.isFinite(value.quantity) &&
    value.quantity > 0 &&
    optionalText(value.foodId) &&
    optionalText(value.unit) &&
    optionalText(value.iconName) &&
    (value.isCustom === undefined || typeof value.isCustom === "boolean")
  );
}
function validMeal(value: unknown): value is Meal {
  return (
    record(value) &&
    text(value.id) &&
    text(value.mealTypeId) &&
    text(value.mealTypeName) &&
    optionalText(value.iconName) &&
    (value.time === undefined ||
      (typeof value.time === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(value.time))) &&
    Array.isArray(value.items) &&
    value.items.every(validItem) &&
    new Set(value.items.map((item) => item.id)).size === value.items.length
  );
}
export function parseSavedDiary(raw: string): DiaryDay {
  const saved: unknown = JSON.parse(raw);
  if (!record(saved) || saved.version !== 1 || !record(saved.day))
    throw new Error("Formato inválido");
  const day = saved.day;
  if (typeof day.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day.date))
    throw new Error("Data inválida");
  const [year, month, date] = day.date.split("-").map(Number);
  if (localDate(new Date(year, month - 1, date)) !== day.date)
    throw new Error("Data inválida");
  if (
    !Array.isArray(day.meals) ||
    !day.meals.every(validMeal) ||
    new Set(day.meals.map((meal) => meal.id)).size !== day.meals.length ||
    new Set(day.meals.map((meal) => meal.mealTypeId)).size !== day.meals.length
  )
    throw new Error("Refeições inválidas");
  return { date: day.date, meals: day.meals };
}

export function loadDiary(): { day: DiaryDay; storageError: string } {
  const empty = { date: localDate(), meals: [] };
  try {
    const raw = window.localStorage.getItem(DIARY_STORAGE_KEY);
    if (!raw) return { day: empty, storageError: "" };
    try {
      return { day: parseSavedDiary(raw), storageError: "" };
    } catch {
      return {
        day: empty,
        storageError:
          "Não foi possível recuperar o diário salvo. Novas alterações substituirão o registro inválido neste navegador.",
      };
    }
  } catch {
    return {
      day: empty,
      storageError:
        "O armazenamento deste navegador está indisponível. Exporte o diário antes de sair para não perder os registros.",
    };
  }
}

export function saveDiary(day: DiaryDay): string {
  try {
    window.localStorage.setItem(
      DIARY_STORAGE_KEY,
      JSON.stringify({ version: 1, day }),
    );
    return "";
  } catch {
    return "Não foi possível salvar as últimas alterações neste navegador. Exporte o diário antes de sair para não perder os registros.";
  }
}
