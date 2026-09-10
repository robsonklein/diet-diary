"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
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
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const viewport = window.visualViewport;
    // Segue a área visível quando o teclado virtual abre, inclusive no Safari.
    function resize() {
      dialog.style.height = `${viewport?.height ?? window.innerHeight}px`;
      dialog.style.top = `${viewport?.offsetTop ?? 0}px`;
    }
    resize();
    dialog.showModal();
    if (focusSearch)
      dialog
        .querySelector<HTMLInputElement>('input[aria-label="Buscar alimento"]')
        ?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    window.addEventListener("resize", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
      window.removeEventListener("resize", resize);
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [focusSearch]);
  return (
    <dialog
      ref={ref}
      className="side-drawer drawer drawer-end drawer-open"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
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
            onClick={onClose}
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
