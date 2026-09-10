import { Minus, Plus } from "lucide-react";
import { quantityStep } from "@/lib/diary";

export function QuantityStepper({
  quantity,
  unit,
  name,
  onChange,
}: {
  quantity: number;
  unit?: string;
  name: string;
  onChange: (direction: 1 | -1) => void;
}) {
  return (
    <div
      className="join shrink-0 border border-base-300 rounded-xl"
      role="group"
      aria-label={`Quantidade de ${name}`}
    >
      <button
        className="btn btn-ghost join-item min-h-11 min-w-11 px-2"
        aria-label={`Diminuir ${name}`}
        disabled={quantity <= quantityStep(unit)}
        onClick={() => onChange(-1)}
      >
        <Minus size={16} />
      </button>
      <output
        className="flex min-w-9 items-center justify-center text-sm font-semibold tabular-nums"
        aria-live="polite"
      >
        {quantity.toLocaleString("pt-BR")}
      </output>
      <button
        className="btn btn-ghost join-item min-h-11 min-w-11 px-2"
        aria-label={`Aumentar ${name}`}
        onClick={() => onChange(1)}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
