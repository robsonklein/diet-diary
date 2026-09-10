"use client";
import { useEffect, useState } from "react";
import { ArrowDownToLine, Check, Info, Plus, RefreshCw } from "lucide-react";
import { useDiary } from "@/hooks/use-diary";
import { getCatalog } from "@/lib/catalog";
import type { Catalog } from "@/types/directus";
import { DiaryHeader } from "./DiaryHeader";
import { EmptyState } from "./EmptyState";
import { MealCard } from "./MealCard";
import { MealForm } from "./MealForm";
import { MobileSheet } from "./MobileSheet";
import { FoodTypeahead } from "./FoodTypeahead";
import { ExportActions } from "./ExportActions";

type Sheet =
  | { type: "meal" }
  | { type: "edit"; mealId: string }
  | { type: "food"; mealId: string }
  | { type: "export" }
  | { type: "remove"; mealId: string }
  | null;
export function Diary() {
  const { day, dispatch } = useDiary();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  const selectedMeal =
    sheet && "mealId" in sheet
      ? day.meals.find((meal) => meal.id === sheet.mealId)
      : undefined;
  useEffect(() => {
    const controller = new AbortController();
    getCatalog(controller.signal)
      .then(setCatalog)
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o catálogo.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  const canAdd = !!catalog?.mealTypes.length;
  const itemCount = day.meals.reduce((sum, meal) => sum + meal.items.length, 0);
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 pb-32 sm:px-8">
      <DiaryHeader date={day.date} />
      <div className="mb-7 flex items-start gap-2.5 rounded-xl bg-primary/6 p-3.5 text-xs leading-relaxed text-base-content/65">
        <Info size={17} className="mt-0.5 shrink-0 text-primary" />
        <p>
          Este diário é temporário.{" "}
          <strong className="font-semibold">Exporte antes de sair:</strong> ao
          atualizar ou fechar a página, os registros serão apagados.
        </p>
      </div>
      {loading && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl bg-base-100 p-4 text-sm"
          role="status"
        >
          <span className="loading loading-spinner loading-sm text-primary" />
          Carregando seu catálogo…
        </div>
      )}
      {error && (
        <div className="alert alert-error mb-6 items-start" role="alert">
          <div>
            <p className="font-semibold">Não conseguimos carregar o catálogo</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              className="btn btn-sm mt-3 min-h-11"
              onClick={() => {
                setError("");
                setLoading(true);
                setAttempt((value) => value + 1);
              }}
            >
              <RefreshCw size={15} />
              Tentar novamente
            </button>
          </div>
        </div>
      )}
      {catalog && !catalog.mealTypes.length && (
        <div className="alert mb-6 text-sm" role="status">
          Nenhum tipo de refeição disponível. Cadastre os tipos em meal_types no
          Directus e recarregue a página.
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold">
          Suas refeições{" "}
          <span className="badge badge-sm ml-1 border-none bg-primary/10 text-primary">
            {day.meals.length}
          </span>
        </h2>
        <button
          className="btn btn-ghost min-h-11 px-2 text-xs text-base-content/60"
          disabled={!day.meals.length}
          onClick={() => setSheet({ type: "export" })}
        >
          <ArrowDownToLine size={16} />
          Exportar dia
        </button>
      </div>
      {day.meals.length ? (
        <div className="space-y-4">
          {day.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onAddFood={() => setSheet({ type: "food", mealId: meal.id })}
              onEdit={() => setSheet({ type: "edit", mealId: meal.id })}
              onRemove={() => setSheet({ type: "remove", mealId: meal.id })}
              onReorder={(itemId, overId) =>
                dispatch({
                  type: "reorder-items",
                  mealId: meal.id,
                  itemId,
                  overId,
                })
              }
              onRemoveItem={(itemId) =>
                dispatch({ type: "remove-item", mealId: meal.id, itemId })
              }
              onQuantity={(itemId, direction) =>
                dispatch({
                  type: "quantity",
                  mealId: meal.id,
                  itemId,
                  direction,
                })
              }
            />
          ))}
          <p className="flex items-center justify-center gap-1.5 pt-4 text-xs text-base-content/45">
            <Check size={14} />
            {itemCount}{" "}
            {itemCount === 1 ? "alimento registrado" : "alimentos registrados"}{" "}
            no seu dia
          </p>
        </div>
      ) : (
        <EmptyState
          disabled={!canAdd}
          onAdd={() => setSheet({ type: "meal" })}
        />
      )}
      <footer
        className="fixed inset-x-0 bottom-0 z-10 border-t border-base-300/70 bg-base-100/95 px-5 pt-3 backdrop-blur"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-xl gap-3">
          <button
            className="btn btn-primary min-h-13 flex-1 rounded-xl"
            disabled={!canAdd}
            onClick={() => setSheet({ type: "meal" })}
          >
            <Plus size={20} />
            Adicionar refeição
          </button>
          <button
            className="btn min-h-13 rounded-xl bg-base-100 px-4"
            aria-label="Exportar diário"
            disabled={!day.meals.length}
            onClick={() => setSheet({ type: "export" })}
          >
            <ArrowDownToLine size={20} />
          </button>
        </div>
      </footer>
      {sheet && (
        <MobileSheet
          key={sheet.type}
          title={
            sheet.type === "meal"
              ? "Nova refeição"
              : sheet.type === "edit"
                ? "Editar refeição"
                : sheet.type === "food"
                  ? "Adicionar alimentos"
                  : sheet.type === "remove"
                    ? "Remover refeição?"
                    : "Seu dia para levar"
          }
          onClose={() => setSheet(null)}
        >
          {sheet.type === "meal" && catalog && (
            <MealForm
              types={catalog.mealTypes}
              onSubmit={(meal) => {
                dispatch({ type: "add-meal", meal });
                setSheet({ type: "food", mealId: meal.id });
              }}
            />
          )}
          {sheet.type === "food" && catalog && (
            <FoodTypeahead
              foods={catalog.foods}
              items={selectedMeal?.items ?? []}
              onAdd={(item) =>
                dispatch({ type: "add-item", mealId: sheet.mealId, item })
              }
              onDone={() => setSheet(null)}
            />
          )}
          {sheet.type === "edit" && catalog && selectedMeal && (
            <MealForm
              types={catalog.mealTypes}
              initialMeal={selectedMeal}
              onSubmit={({ mealTypeId, mealTypeName, iconName, time }) => {
                dispatch({
                  type: "edit-meal",
                  mealId: selectedMeal.id,
                  changes: { mealTypeId, mealTypeName, iconName, time },
                });
                setSheet(null);
              }}
            />
          )}
          {sheet.type === "export" && <ExportActions day={day} />}
          {sheet.type === "remove" && (
            <div>
              <p className="mb-6 text-sm text-base-content/65">
                A refeição e todos os seus alimentos serão removidos deste dia.
              </p>
              <div className="flex gap-3">
                <button
                  className="btn min-h-12 flex-1"
                  onClick={() => setSheet(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-error min-h-12 flex-1"
                  onClick={() => {
                    dispatch({ type: "remove-meal", mealId: sheet.mealId });
                    setSheet(null);
                  }}
                >
                  Remover refeição
                </button>
              </div>
            </div>
          )}
        </MobileSheet>
      )}
    </main>
  );
}
