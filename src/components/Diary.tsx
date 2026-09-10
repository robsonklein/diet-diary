"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Check, Info, Plus, RefreshCw } from "lucide-react";
import { useDiary } from "@/hooks/use-diary";
import { getCatalog } from "@/lib/catalog";
import type { Catalog } from "@/types/directus";
import { DiaryHeader } from "./DiaryHeader";
import { EmptyState } from "./EmptyState";
import { MealCard } from "./MealCard";
import { MealForm } from "./MealForm";
import { MobileSheet } from "./MobileSheet";
import { SideDrawer } from "./SideDrawer";
import { FoodTypeahead } from "./FoodTypeahead";
import { ExportActions } from "./ExportActions";
import { localDate } from "@/lib/diary";
import { formatDate } from "@/utils/export";

type Sheet =
  | { type: "meal" }
  | { type: "edit"; mealId: string }
  | { type: "food"; mealId: string }
  | { type: "export" }
  | { type: "new-day" }
  | { type: "remove"; mealId: string }
  | null;
export function Diary() {
  const { day, dispatch, storageError } = useDiary();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  const scrollAfterAdding = useRef(false);
  useEffect(() => {
    // Aguarda o drawer/sheet liberar a rolagem e devolver o foco à página.
    if (sheet || !scrollAfterAdding.current) return;
    const frame = requestAnimationFrame(() => {
      scrollAfterAdding.current = false;
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [day, sheet]);
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
    <main className="mx-auto min-h-dvh max-w-2xl px-5 pb-6 sm:px-8">
      <DiaryHeader date={day.date} />
      {storageError && (
        <div
          role="alert"
          className="mb-7 flex items-start gap-2.5 rounded-xl bg-warning/15 p-3.5 text-xs leading-relaxed text-base-content"
        >
          <Info size={17} className="mt-0.5 shrink-0 text-primary" />
          <p>{storageError}</p>
        </div>
      )}
      {day.date !== localDate() && (
        <div className="alert mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p>Você está continuando o registro de {formatDate(day.date)}.</p>
          <button
            className="btn btn-primary min-h-11"
            onClick={() => setSheet({ type: "new-day" })}
          >
            Iniciar diário de hoje
          </button>
        </div>
      )}
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
        <h2 className="text-base font-extrabold tracking-tight">
          Suas refeições{" "}
          <span className="badge badge-sm ml-1 border-none bg-primary/10 text-primary">
            {day.meals.length}
          </span>
        </h2>
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
        aria-label="Ações do diário"
        className="mt-6 border-t border-base-300/70 pt-4"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-wrap gap-3">
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
            aria-label="Exportar dia"
            disabled={!day.meals.length}
            onClick={() => setSheet({ type: "export" })}
          >
            <ArrowDownToLine size={20} />
            <span className="hidden sm:inline">Exportar dia</span>
          </button>
        </div>
      </footer>
      {sheet?.type === "food" && catalog && (
        <SideDrawer
          key="food"
          title="Adicionar alimentos"
          subtitle={selectedMeal?.mealTypeName}
          focusSearch
          onClose={() => setSheet(null)}
        >
          <FoodTypeahead
            foods={catalog.foods}
            items={selectedMeal?.items ?? []}
            onAdd={(item) => {
              scrollAfterAdding.current = true;
              dispatch({ type: "add-item", mealId: sheet.mealId, item });
            }}
            onDone={() => setSheet(null)}
          />
        </SideDrawer>
      )}
      {sheet?.type === "meal" && catalog && (
        <SideDrawer
          key="meal"
          title="Nova refeição"
          onClose={() => setSheet(null)}
        >
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5"
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
          >
            <MealForm
              types={catalog.mealTypes}
              disabledTypeIds={day.meals.map((meal) => meal.mealTypeId)}
              onSubmit={(meal) => {
                scrollAfterAdding.current = true;
                dispatch({ type: "add-meal", meal });
                setSheet({ type: "food", mealId: meal.id });
              }}
            />
          </div>
        </SideDrawer>
      )}
      {sheet && sheet.type !== "food" && sheet.type !== "meal" && (
        <MobileSheet
          key={sheet.type}
          title={
            sheet.type === "edit"
              ? "Editar refeição"
              : sheet.type === "remove"
                ? "Remover refeição?"
                : sheet.type === "new-day"
                  ? "Iniciar diário de hoje?"
                  : "Seu dia para levar"
          }
          onClose={() => setSheet(null)}
        >
          {sheet.type === "edit" && catalog && selectedMeal && (
            <MealForm
              types={catalog.mealTypes}
              initialMeal={selectedMeal}
              disabledTypeIds={day.meals
                .filter((meal) => meal.id !== selectedMeal.id)
                .map((meal) => meal.mealTypeId)}
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
          {sheet.type === "new-day" && (
            <div className="space-y-5">
              <p className="text-sm text-base-content/65">
                O registro de {formatDate(day.date)} será substituído por um
                diário vazio de hoje. Exporte o registro atual antes de
                continuar, se quiser guardá-lo.
              </p>
              <button
                className="btn btn-outline min-h-12 w-full"
                onClick={() => setSheet({ type: "export" })}
              >
                Exportar registro atual
              </button>
              <div className="flex gap-3">
                <button
                  className="btn min-h-12 flex-1"
                  onClick={() => setSheet(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary min-h-12 flex-1"
                  onClick={() => {
                    dispatch({ type: "new-day", date: localDate() });
                    setSheet(null);
                  }}
                >
                  Iniciar novo diário
                </button>
              </div>
            </div>
          )}
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
