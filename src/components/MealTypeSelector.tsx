import type { MealType } from "@/types/directus";
import { CatalogIcon } from "@/utils/icons";

export function MealTypeSelector({
  types,
  value,
  onChange,
}: {
  types: MealType[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">Qual é a refeição?</legend>
      <div className="grid grid-cols-2 gap-3">
        {types.map((type) => {
          return (
            <label
              key={type.id}
              className={`flex min-h-20 cursor-pointer items-center gap-2 rounded-2xl border p-3 text-sm transition-colors ${value === type.id ? "border-primary bg-primary/5 text-primary" : "border-base-300"}`}
            >
              <input
                className="radio radio-primary radio-sm shrink-0"
                type="radio"
                name="mealType"
                value={type.id}
                checked={value === type.id}
                onChange={() => onChange(type.id)}
                required
              />
              <span>
                <CatalogIcon name={type.icon_name} size={21} className="mb-1" />
                <span className="font-medium">{type.name}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
