"use client";
import dynamic from "next/dynamic";

// Inicializa a data no fuso do navegador, sem divergência com o servidor.
const Diary = dynamic(
  () => import("@/components/Diary").then((module) => module.Diary),
  {
    ssr: false,
    loading: () => (
      <main
        className="flex min-h-dvh items-center justify-center gap-3"
        role="status"
      >
        <span className="loading loading-spinner text-primary" />
        Preparando seu diário…
      </main>
    ),
  },
);
export default function Page() {
  return <Diary />;
}
