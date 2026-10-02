import { useRef, useState } from "react";
import { CalendarDays, Check, Info, Leaf, X } from "lucide-react";
import { formatDate } from "@/utils/export";
import { localDate } from "@/lib/diary";

export function DiaryHeader({ date, onDateChange }: {
  date: string;
  onDateChange: (date: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const today = localDate();
  const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const weekday = weekdays[new Date(`${date}T12:00:00`).getDay()];
  const close = () => {
    setEditing(false);
    requestAnimationFrame(() => trigger.current?.focus());
  };
  const save = () => {
    if (!draft || draft > today) return;
    onDateChange(draft);
    close();
  };
  return (
    <>
      <nav className="navbar min-h-20 border-b border-base-300/60 px-0">
        <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-content">
            <Leaf size={22} />
          </span>
          nutri<span className="text-primary">.</span>
        </div>
        <span className="ms-auto text-xs text-base-content/75">
          Seu diário alimentar
        </span>
      </nav>
      <header className="py-6">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Diário alimentar
        </h1>
        <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-base-content/75">
          Registre suas refeições diárias de forma prática e eficiente.
        </p>
        <div className="mt-6 flex items-center gap-2.5 border-y border-y-gray-300 py-3">
          <CalendarDays size={17} className="text-primary" />
          {editing ? (
            <form className="min-w-0 flex-1" onSubmit={(event) => { event.preventDefault(); save(); }}>
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  aria-label="Data do diário"
                  className="input min-w-0 w-40 text-base sm:text-sm"
                  type="date"
                  required
                  max={today}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); close(); } }}
                />
                <button type="submit" className="btn btn-ghost btn-circle" aria-label="Salvar data"><Check size={18} /></button>
                <button type="button" className="btn btn-ghost btn-circle" aria-label="Cancelar edição da data" onClick={close}><X size={18} /></button>
              </div>
            </form>
          ) : (
            <button
              ref={trigger}
              type="button"
              title="Editar data"
              aria-label="Editar data do diário"
              className="group min-h-11 rounded-lg text-start text-base tracking-tight hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => { setDraft(date); setEditing(true); }}
            >
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {date === today && (
                  <span className="badge badge-primary badge-sm font-semibold">Hoje</span>
                )}
                <span className="font-semibold">{weekday}</span>
                <span aria-hidden="true" className="h-4 w-px bg-base-content/20" />
                <time
                  dateTime={date}
                  className="font-medium tabular-nums text-base-content/65 group-hover:text-primary/80"
                >
                  {formatDate(date)}
                </time>
              </span>
            </button>
          )}
          <div
            className="tooltip tooltip-bottom -top-0.5"
            data-tip="Seu diário é salvo automaticamente neste navegador. Você pode fechar e voltar depois. Exporte uma cópia para guardar ou compartilhar."
          >
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-xs text-primary"
              aria-label="Como o diário é salvo"
            >
              <Info size={16} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
