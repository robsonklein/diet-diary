"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function MobileSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="sheet-title"
      onCancel={onClose}
    >
      <div className="modal-box max-h-[88dvh] rounded-t-3xl p-6 sm:rounded-3xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-base-300 sm:hidden" />
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 id="sheet-title" className="text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-circle min-h-11 min-w-11"
            aria-label="Fechar"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>Fechar janela</button>
      </form>
    </dialog>
  );
}
