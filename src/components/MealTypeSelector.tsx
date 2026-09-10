import type { MealType } from "@/types/directus";
import { CatalogIcon } from "@/utils/icons";

export function MealTypeSelector({
  types,
  value,
  onChange,
  disabledIds = [],
}: {
  types: MealType[];
  value: string;
  onChange: (id: string) => void;
  disabledIds?: string[];
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">Qual é a refeição?</legend>
      <div className="grid grid-cols-2 gap-3">
        {types.map((type) => {
          const disabled = disabledIds.includes(type.id);
          return (
            <label
              key={type.id}
              className={`flex min-h-20 items-center gap-2 rounded-2xl border p-3 text-sm transition-colors ${disabled ? "cursor-not-allowed border-base-300 bg-base-200 text-base-content/45" : value === type.id ? "cursor-pointer border-primary bg-primary/5 text-primary" : "cursor-pointer border-base-300"}`}
            >
              <input
                className="radio radio-primary radio-sm shrink-0"
                type="radio"
                name="mealType"
                value={type.id}
                checked={value === type.id}
                disabled={disabled}
                aria-label={type.name}
                onChange={() => onChange(type.id)}
                required
              />
              <span>
                <CatalogIcon name={type.icon_name} size={21} className="mb-1" />
                <span className="font-medium">{type.name}</span>
                {disabled && (
                  <span className="mt-1 block text-xs">Já adicionada</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
