"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export function SideDrawer({
  children,
  title,
  subtitle,
  focusSearch = false,
  onClose,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  focusSearch?: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(onClose, 240);
  };
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    if (focusSearch)
      dialog
        .querySelector<HTMLInputElement>('input[aria-label="Buscar alimento"]')
        ?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [focusSearch]);
  return (
    <dialog
      ref={ref}
      className={`side-drawer drawer drawer-end drawer-open ${closing ? "is-closing" : ""}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section className="side-drawer-panel ml-auto flex h-full w-full flex-col bg-base-100 shadow-xl sm:max-w-lg">
        <header
          className="flex shrink-0 items-center gap-3 border-b border-base-200 px-4 pb-4"
          style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-circle min-h-11 min-w-11"
            aria-label="Fechar"
            onClick={requestClose}
          >
            <ArrowLeft size={22} />
          </button>
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-bold">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-sm text-base-content/60">
                {subtitle}
              </p>
            )}
          </div>
        </header>
        {children}
      </section>
    </dialog>
  );
}
