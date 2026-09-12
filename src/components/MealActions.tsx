"use client";
import { useEffect, useRef } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

export function MealActions({
  name,
  onEdit,
  onRemove,
}: {
  name: string;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const handledPointerAction = useRef(false);
  function close(restoreFocus = false) {
    if (!ref.current) return;
    ref.current.open = false;
    if (restoreFocus) ref.current.querySelector("summary")?.focus();
  }
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !ref.current?.contains(event.target)
      ) {
        if (ref.current) ref.current.open = false;
      }
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  function runAction(action: () => void) {
    close(true);
    action();
  }
  function runPointerAction(action: () => void) {
    // Em alguns navegadores móveis o blur fecha o <details> antes do click.
    // O pointerdown ocorre antes dele e garante a abertura do diálogo.
    handledPointerAction.current = true;
    runAction(action);
  }
  function runClickAction(action: () => void) {
    if (handledPointerAction.current) {
      handledPointerAction.current = false;
      return;
    }
    runAction(action);
  }
  return (
    <details
      ref={ref}
      className="dropdown dropdown-end shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close(true);
        }
      }}
    >
      <summary
        className="btn btn-ghost btn-circle min-h-11 min-w-11 list-none [&::-webkit-details-marker]:hidden"
        aria-label={`Opções de ${name}`}
      >
        <EllipsisVertical size={21} />
      </summary>
      <ul
        className="dropdown-content menu z-30 mt-2 w-44 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg"
        aria-label={`Ações de ${name}`}
      >
        <li>
          <button
            className="min-h-11"
            onPointerDown={() => runPointerAction(onEdit)}
            onClick={() => runClickAction(onEdit)}
          >
            <Pencil size={17} />
            Editar
          </button>
        </li>
        <li>
          <button
            className="min-h-11 text-error"
            onPointerDown={() => runPointerAction(onRemove)}
            onClick={() => runClickAction(onRemove)}
          >
            <Trash2 size={17} />
            Excluir
          </button>
        </li>
      </ul>
    </details>
  );
}
