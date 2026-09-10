"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Meal } from "@/types/diary";
import type { MealType } from "@/types/directus";
import { MealTypeSelector } from "./MealTypeSelector";

export function MealForm({
  types,
  initialMeal,
  onSubmit,
}: {
  types: MealType[];
  initialMeal?: Meal;
  onSubmit: (meal: Meal) => void;
}) {
  const [typeId, setTypeId] = useState(initialMeal?.mealTypeId ?? types[0]?.id ?? "");
  const [time, setTime] = useState(initialMeal?.time ?? "");
  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const type = types.find((type) => type.id === typeId);
        if (type)
          onSubmit({
            id: initialMeal?.id ?? crypto.randomUUID(),
            mealTypeId: type.id,
            mealTypeName: type.name,
            iconName: type.icon_name,
            time: time || undefined,
            items: initialMeal?.items ?? [],
          });
      }}
    >
      <MealTypeSelector types={types} value={typeId} onChange={setTypeId} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">
          Horário{" "}
          <span className="font-normal text-base-content/50">(opcional)</span>
        </span>
        <input
          className="input min-h-12 w-full"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
      </label>
      <button
        className="btn btn-primary min-h-13 w-full rounded-xl"
        disabled={!typeId}
      >
        {initialMeal ? "Salvar alterações" : "Adicionar alimentos"}
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
