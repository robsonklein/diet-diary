"use client";
import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import type { Food } from "@/types/directus";
import type { MealItem } from "@/types/diary";
import { CatalogIcon } from "@/utils/icons";
import { formatQuantity } from "@/utils/export";
import { sameMealItem } from "@/lib/diary";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
export function FoodTypeahead({
  foods,
  items,
  onAdd,
  onDone,
}: {
  foods: Food[];
  items: MealItem[];
  onAdd: (item: MealItem) => void;
  onDone: () => void;
}) {
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("");
  const [notice, setNotice] = useState("");
  const matches = useMemo(
    () =>
      foods.filter((food) =>
        normalize(food.name).includes(normalize(query.trim())),
      ),
    [foods, query],
  );
  function add(item: Omit<MealItem, "id">) {
    onAdd({ ...item, id: crypto.randomUUID() });
    setNotice(
      items.some((existing) => sameMealItem(existing, item))
        ? `Quantidade de ${item.name} aumentada.`
        : `${item.name} adicionado à refeição.`,
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-5 pb-3 pt-4">
        <label className="input min-h-13 w-full rounded-xl">
          <Search size={19} className="text-base-content/50" />
          <input
            className="text-base"
            aria-label="Buscar alimento"
            placeholder="O que você comeu?"
            maxLength={160}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="mt-3 text-xs text-base-content/60" aria-live="polite">
          {matches.length}{" "}
          {matches.length === 1
            ? "alimento encontrado"
            : "alimentos encontrados"}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-4">
        <ul>
          {matches.map((food) => {
            const selected = items.find((item) => item.foodId === food.id);
            return (
              <li key={food.id}>
                <button
                  className="flex min-h-18 w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary"
                  onClick={() =>
                    add({
                      foodId: food.id,
                      name: food.name,
                      quantity: food.default_quantity,
                      unit: food.unit,
                      iconName: food.icon_name,
                    })
                  }
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-base-200">
                    <CatalogIcon name={food.icon_name} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-semibold">
                      {food.name}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {formatQuantity(
                        selected?.quantity ?? food.default_quantity,
                        food.unit,
                      )}
                      {selected && " na refeição"}
                    </span>
                  </span>
                  {selected && (
                    <span
                      className="badge badge-soft badge-primary shrink-0"
                      aria-live="polite"
                    >
                      {selected.quantity.toLocaleString("pt-BR")}
                    </span>
                  )}
                  <Plus size={20} className="shrink-0 text-primary" />
                  <span className="sr-only">
                    {selected ? "Aumentar quantidade de" : "Adicionar"}{" "}
                    {food.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {!matches.length && (
          <p className="py-2 text-sm text-base-content/60">
            {query.trim()
              ? "Nenhum resultado. Você pode adicionar um item customizado abaixo."
              : "O catálogo ainda não tem alimentos. Adicione um item customizado pela busca."}
          </p>
        )}
        {query.trim() && (
          <div className="rounded-2xl border border-primary/30 bg-primary/8 p-4">
            <p className="mb-3 text-sm font-semibold">Não está no catálogo?</p>
            <p className="mb-4 break-words text-sm text-base-content/70">
              Adicione “{query.trim()}” como item customizado.
            </p>
            <label className="block text-xs">
              Unidade do item customizado (opcional)
              <input
                className="input mt-1 min-h-11 w-full bg-base-100 text-base"
                placeholder="Ex.: unidade, g, ml"
                maxLength={30}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              />
            </label>
            <button
              className="btn btn-primary mt-4 min-h-13 w-full rounded-xl text-base shadow-sm"
              aria-label={`Adicionar item “${query.trim()}”`}
              onClick={() => {
                add({
                  name: query.trim(),
                  quantity: 1,
                  unit: unit.trim() || undefined,
                  isCustom: true,
                });
                setQuery("");
                setUnit("");
              }}
            >
              <Plus size={21} className="shrink-0" />
              Adicionar item
            </button>
          </div>
        )}
      </div>
      <footer
        className="shrink-0 border-t border-base-200 bg-base-100 px-5 pt-2"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <p className="mb-2 text-sm text-primary" role="status">
          {notice}
        </p>
        <button
          className="btn btn-outline btn-primary min-h-12 w-full rounded-xl"
          onClick={onDone}
        >
          <Check size={18} />
          Concluir
        </button>
      </footer>
    </div>
  );
}
