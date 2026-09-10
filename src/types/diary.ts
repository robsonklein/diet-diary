export type DiaryDay = { date: string; meals: Meal[] };
export type Meal = {
  id: string;
  mealTypeId: string;
  mealTypeName: string;
  iconName?: string;
  time?: string;
  items: MealItem[];
};
export type MealItem = {
  id: string;
  foodId?: string;
  name: string;
  quantity: number;
  unit?: string;
  iconName?: string;
  isCustom?: boolean;
};
