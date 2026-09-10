import { CalendarDays, Leaf } from "lucide-react";
import { formatDate } from "@/utils/export";

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
      <header className="pb-7 pt-9">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          Um dia de cada vez
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          O que nutre seu dia?
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-base-content/60">
          Registre suas refeições, do seu jeito.
          <br />
          Cada pequena escolha faz parte da sua história.
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm">
          <CalendarDays size={17} className="text-primary" />
          <span className="font-semibold">Hoje</span>
          <span className="text-base-content/35">/</span>
          <time dateTime={date} className="text-base-content/65">
            {formatDate(date)}
          </time>
        </div>
      </header>
    </>
  );
}
