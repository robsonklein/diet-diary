"use client";
import { useId, useState } from "react";
import { ChevronDown, Clock3, Plus } from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Meal } from "@/types/diary";
import { CatalogIcon } from "@/utils/icons";
import { MealItem } from "./MealItem";
import { MealActions } from "./MealActions";

export function MealCard({
  meal,
  onAddFood,
  onEdit,
  onRemove,
  onRemoveItem,
  onQuantity,
  onReorder,
}: {
  meal: Meal;
  onAddFood: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onRemoveItem: (id: string) => void;
  onQuantity: (id: string, direction: 1 | -1) => void;
  onReorder: (itemId: string, overId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const contentId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function position(id: string | number) {
    return meal.items.findIndex((item) => item.id === id) + 1;
  }
  function itemName(id: string | number) {
    return meal.items.find((item) => item.id === id)?.name ?? "Alimento";
  }
  return (
    <article className="card border border-base-300/60 bg-base-100 shadow-sm">
      <div className="card-body gap-0 p-4 sm:p-6">
        <header className="flex items-center gap-2">
          <button
            className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-primary"
            aria-expanded={expanded}
            aria-controls={contentId}
            aria-label={`${expanded ? "Recolher" : "Expandir"} ${meal.mealTypeName}`}
            onClick={() => setExpanded((value) => !value)}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CatalogIcon name={meal.iconName} size={23} strokeWidth={1.6} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block break-words font-bold">
                {meal.mealTypeName}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-base-content/60">
                <Clock3 size={13} />
                {meal.time || "Sem horário"}
                <span className="px-1">·</span>
                <span>
                  {meal.items.length}{" "}
                  {meal.items.length === 1 ? "alimento" : "alimentos"}
                </span>
              </span>
            </span>
            <ChevronDown
              size={19}
              className={`shrink-0 text-base-content/50 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <MealActions
            name={meal.mealTypeName}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        </header>
        <div id={contentId} hidden={!expanded}>
          {meal.items.length ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              accessibility={{
                screenReaderInstructions: {
                  draggable:
                    "Para ordenar, pressione espaço, use as setas para mover e espaço para soltar. Escape cancela.",
                },
                announcements: {
                  onDragStart: ({ active }) =>
                    `${itemName(active.id)} selecionado, posição ${position(active.id)} de ${meal.items.length}.`,
                  onDragOver: ({ active, over }) =>
                    over
                      ? `${itemName(active.id)} na posição ${position(over.id)} de ${meal.items.length}.`
                      : "Fora da lista.",
                  onDragEnd: ({ active, over }) =>
                    over
                      ? `${itemName(active.id)} movido para a posição ${position(over.id)}.`
                      : "Ordem mantida.",
                  onDragCancel: () => "Ordenação cancelada. Ordem mantida.",
                },
              }}
              onDragEnd={({ active, over }) => {
                if (over && active.id !== over.id)
                  onReorder(String(active.id), String(over.id));
              }}
            >
              <SortableContext
                items={meal.items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul
                  className="mt-3"
                  aria-label={`Alimentos de ${meal.mealTypeName}`}
                >
                  {meal.items.map((item) => (
                    <MealItem
                      key={item.id}
                      item={item}
                      dragDisabled={meal.items.length < 2}
                      onRemove={() => onRemoveItem(item.id)}
                      onQuantity={(direction) => onQuantity(item.id, direction)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="py-5 text-sm text-base-content/55">
              Sua refeição está pronta para receber alimentos.
            </p>
          )}
          <button
            className="btn btn-ghost mt-2 min-h-12 w-full justify-start rounded-xl border border-dashed border-primary/25 text-primary"
            onClick={onAddFood}
          >
            <Plus size={18} />
            Adicionar alimento
          </button>
        </div>
      </div>
    </article>
  );
}
