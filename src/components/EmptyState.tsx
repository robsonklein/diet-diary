import { Plus, Salad, Sprout } from "lucide-react";

export function EmptyState({
  onAdd,
  disabled,
}: {
  onAdd: () => void;
  disabled: boolean;
}) {
  return (
    <div className="card items-center border border-dashed border-primary/25 bg-base-100 px-6 py-12 text-center">
      <div className="relative mb-6 flex size-24 items-center justify-center rounded-full bg-primary/8 text-primary">
        <Salad size={47} strokeWidth={1.25} />
        <span className="absolute -right-1 top-0 flex size-8 items-center justify-center rounded-full border-4 border-base-100 bg-secondary/25">
          <Sprout size={17} />
        </span>
      </div>
      <h3 className="text-xl font-semibold">Seu dia começa aqui</h3>
      <p className="mt-2 max-w-64 text-sm leading-relaxed text-base-content/60">
        Do primeiro café à última refeição.
        <br />
        Adicione o que você comeu hoje.
      </p>
      <button
        className="btn btn-primary mt-6 min-h-12 rounded-xl"
        onClick={onAdd}
        disabled={disabled}
      >
        <Plus size={18} />
        Registrar primeira refeição
      </button>
    </div>
  );
}
