import { CalendarDays, Leaf } from "lucide-react";
import { formatDate } from "@/utils/export";
import { localDate } from "@/lib/diary";

export function DiaryHeader({ date }: { date: string }) {
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
          Registre suas refeições diárias e acompanhe seu progresso nutricional
          de forma prática e eficiente.
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm">
          <CalendarDays size={17} className="text-primary" />
          <span className="font-semibold">
            {date === localDate() ? "Hoje" : "Registro salvo"}
          </span>
          <span className="text-base-content/35">/</span>
          <time dateTime={date} className="text-base-content/65">
            {formatDate(date)}
          </time>
        </div>
      </header>
    </>
  );
}
