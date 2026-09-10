import { GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MealItem as Item } from "@/types/diary";
import { CatalogIcon } from "@/utils/icons";
import { QuantityStepper } from "./QuantityStepper";

export function MealItem({
  item,
  onRemove,
  onQuantity,
  dragDisabled = false,
}: {
  item: Item;
  onRemove: () => void;
  onQuantity: (direction: 1 | -1) => void;
  dragDisabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: dragDisabled });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 20 : undefined,
      }}
      className={`grid grid-cols-[1.5rem_minmax(0,1fr)_2.75rem] items-center gap-x-1 gap-y-2 border-t border-base-200 bg-base-100 py-4 first:border-0 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto_2.75rem] ${isDragging ? "rounded-xl shadow-lg ring-2 ring-primary/30" : ""}`}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        style={{ touchAction: "none" }}
        className="col-start-1 row-start-1 flex h-11 w-6 cursor-grab items-center justify-center rounded-md text-base-content/30 hover:bg-base-200 hover:text-base-content/60 focus-visible:outline-2 focus-visible:outline-primary active:cursor-grabbing disabled:opacity-30"
        aria-label={`Arrastar ${item.name} para ordenar`}
        aria-roledescription="alimento ordenável"
        disabled={dragDisabled}
      >
        <GripVertical size={14} />
      </button>
      <div className="col-start-2 row-start-1 flex min-w-0 items-center gap-3">
        <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-base-200 sm:flex">
          <CatalogIcon name={item.iconName} size={20} strokeWidth={1.6} />
        </div>
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold">{item.name}</p>
          <p className="mt-0.5 text-xs text-base-content/60">
            {item.unit || "Quantidade"}
            {item.isCustom && " · Item customizado"}
          </p>
        </div>
      </div>
      <div className="col-start-2 row-start-2 justify-self-start sm:col-start-3 sm:row-start-1">
        <QuantityStepper
          name={item.name}
          quantity={item.quantity}
          unit={item.unit}
          onChange={onQuantity}
        />
      </div>
      <button
        className="btn btn-ghost btn-circle col-start-3 row-start-1 min-h-11 min-w-11 text-base-content/45 sm:col-start-4"
        aria-label={`Remover ${item.name}`}
        onClick={onRemove}
      >
        <X size={17} />
      </button>
    </li>
  );
}
