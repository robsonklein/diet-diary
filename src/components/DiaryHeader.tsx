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
  const [error, setError] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const weekday = weekdays[new Date(`${date}T12:00:00`).getDay()];
  const close = () => {
    setEditing(false);
    requestAnimationFrame(() => trigger.current?.focus());
  };
  const save = () => {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(draft.trim());
    const value = match ? `${match[3]}-${match[2]}-${match[1]}` : "";
    if (!match || Number(match[3]) < 1000 || localDate(new Date(`${value}T12:00:00`)) !== value) {
      setError("Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }
    onDateChange(value);
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
        <span className="ml-auto text-xs text-base-content/50">
          Seu diário alimentar
        </span>
      </nav>
      <header className="py-6">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Diário alimentar
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-base-content/60">
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
                  aria-invalid={!!error}
                  aria-describedby={error ? "diary-date-error" : undefined}
                  className="input min-w-0 w-36"
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  value={draft}
                  onFocus={(event) => event.target.select()}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
                    setDraft(digits.replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2"));
                    setError("");
                  }}
                  onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); close(); } }}
                />
                <button type="submit" className="btn btn-ghost btn-circle" aria-label="Salvar data"><Check size={18} /></button>
                <button type="button" className="btn btn-ghost btn-circle" aria-label="Cancelar edição da data" onClick={close}><X size={18} /></button>
              </div>
              {error && <p id="diary-date-error" role="alert" className="mt-1 text-xs text-error">{error}</p>}
            </form>
          ) : (
            <button
              ref={trigger}
              type="button"
              title="Editar data"
              aria-label="Editar data do diário"
              className="min-h-11 text-left text-base font-semibold tracking-tight hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => { setDraft(formatDate(date)); setError(""); setEditing(true); }}
            >
              {date === localDate() ? `Hoje -- ${weekday} ` : `${weekday} -- `}
              <time dateTime={date}>{formatDate(date)}</time>
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
