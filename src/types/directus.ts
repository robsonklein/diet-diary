export type Food = {
  id: string;
  name: string;
  unit: string;
  default_quantity: number;
  icon_name?: string;
  active: boolean;
  sort: number;
};
export type MealType = {
  id: string;
  name: string;
  icon_name?: string;
  sort: number;
};
export type Catalog = { foods: Food[]; mealTypes: MealType[] };
