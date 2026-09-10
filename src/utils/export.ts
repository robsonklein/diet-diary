import type { DiaryDay } from "@/types/diary";

export function formatDate(date: string) {
  return date.split("-").reverse().join("/");
}
export function formatQuantity(quantity: number, unit?: string) {
  return `${quantity.toLocaleString("pt-BR")}${unit ? ` ${unit === "unidade" && quantity !== 1 ? "unidades" : unit}` : ""}`;
}
function csvCell(value: string | number): string {
  let text = String(value);
  // Neutraliza fórmulas ao abrir texto livre em planilhas.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
export function diaryToCsv(day: DiaryDay) {
  const rows: (string | number)[][] = [
    ["date", "meal", "time", "food", "quantity", "unit"],
  ];
  for (const meal of day.meals) {
    if (!meal.items.length)
      rows.push([day.date, meal.mealTypeName, meal.time ?? "", "", "", ""]);
    for (const item of meal.items)
      rows.push([
        day.date,
        meal.mealTypeName,
        meal.time ?? "",
        item.name,
        item.quantity,
        item.unit ?? "",
      ]);
  }
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
function download(href: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
export function downloadCsv(day: DiaryDay) {
  const url = URL.createObjectURL(
    new Blob([diaryToCsv(day)], { type: "text/csv;charset=utf-8;" }),
  );
  download(url, `diario-${day.date}.csv`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadPng(element: HTMLElement, date: string) {
  const { toBlob } = await import("html-to-image");
  await document.fonts.ready;
  const blob = await toBlob(element, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
    width: 720,
    cacheBust: true,
    style: { position: "static", left: "auto", top: "auto" },
  });
  if (!blob)
    throw new Error("Não foi possível gerar a imagem. Tente novamente.");
  const url = URL.createObjectURL(blob);
  download(url, `diario-${date}.png`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
