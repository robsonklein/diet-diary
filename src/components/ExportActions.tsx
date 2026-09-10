"use client";
import { useRef, useState } from "react";
import { Download, FileSpreadsheet, ImageDown } from "lucide-react";
import type { DiaryDay } from "@/types/diary";
import {
  downloadCsv,
  downloadPng,
  formatDate,
  formatQuantity,
} from "@/utils/export";

export function ExportActions({ day }: { day: DiaryDay }) {
  const preview = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-base-content/60">
        Guarde seu registro ou compartilhe com seu nutricionista. O arquivo
        inclui todas as refeições deste dia.
      </p>
      <div
        ref={preview}
        style={{
          width: 720,
          padding: 48,
          background: "#ffffff",
          color: "#213d32",
          fontFamily: "Arial, sans-serif",
          fontSize: 18,
          lineHeight: 1.6,
          position: "absolute",
          left: -10000,
          top: 0,
        }}
        aria-hidden="true"
      >
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 3,
            color: "#487c63",
            margin: "0 0 20px",
          }}
        >
          NUTRI · DIÁRIO ALIMENTAR
        </p>
        <h2
          style={{
            fontSize: 36,
            lineHeight: 1.2,
            margin: "0 0 12px",
            fontWeight: 700,
          }}
        >
          {formatDate(day.date)}
        </h2>
        <p style={{ color: "#66766d", margin: "0 0 32px" }}>
          Meu registro do dia
        </p>
        {day.meals.map((meal) => (
          <section
            key={meal.id}
            style={{
              borderTop: "1px solid #dce5de",
              padding: "24px 0",
              overflowWrap: "anywhere",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>
              {meal.mealTypeName.toLocaleUpperCase("pt-BR")}
              {meal.time ? ` — ${meal.time}` : ""}
            </h3>
            {meal.items.length ? (
              meal.items.map((item) => (
                <p key={item.id} style={{ margin: "7px 0" }}>
                  {item.name} — {formatQuantity(item.quantity, item.unit)}
                </p>
              ))
            ) : (
              <p style={{ color: "#66766d" }}>Sem alimentos registrados.</p>
            )}
          </section>
        ))}
        <p
          style={{
            borderTop: "1px solid #dce5de",
            paddingTop: 24,
            fontSize: 13,
            color: "#66766d",
          }}
        >
          Feito com nutri. · Um dia de cada vez.
        </p>
      </div>
      <button
        className="btn min-h-16 w-full justify-start rounded-xl bg-base-100"
        disabled={busy}
        onClick={() => {
          try {
            downloadCsv(day);
            setError("");
            setNotice("Download do CSV iniciado.");
          } catch {
            setError("Não foi possível baixar o CSV. Tente novamente.");
          }
        }}
      >
        <FileSpreadsheet size={24} className="text-primary" />
        <span className="flex-1 text-left">
          Exportar CSV
          <span className="block text-xs font-normal text-base-content/60">
            Para abrir em uma planilha
          </span>
        </span>
        <Download size={18} />
      </button>
      <button
        className="btn btn-primary min-h-16 w-full justify-start rounded-xl"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          setNotice("");
          try {
            await downloadPng(preview.current!, day.date);
            setNotice("Download da imagem iniciado.");
          } catch {
            setError(
              "Não foi possível gerar o PNG. Tente novamente ou exporte o CSV.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          <ImageDown size={24} />
        )}
        <span className="flex-1 text-left">
          {busy ? "Preparando imagem…" : "Exportar imagem PNG"}
          <span className="block text-xs font-normal opacity-75">
            Uma versão limpa, pronta para compartilhar
          </span>
        </span>
        <Download size={18} />
      </button>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <p role="status" className="text-sm text-primary">
        {notice}
      </p>
    </div>
  );
}
