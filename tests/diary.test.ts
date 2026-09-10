import { test } from "node:test";
import assert from "node:assert/strict";
import { changeQuantity, diaryReducer, localDate } from "../src/lib/diary";
import { diaryToCsv, formatQuantity } from "../src/utils/export";
import type { DiaryDay, Meal } from "../src/types/diary";

test("passos por unidade e limites positivos", () => {
  assert.equal(changeQuantity(1, "unidade", 1), 2);
  assert.equal(changeQuantity(20, "g", 1), 30);
  assert.equal(changeQuantity(150, "ml", -1), 100);
  assert.equal(changeQuantity(1, "g", -1), 1);
  assert.equal(changeQuantity(0.5, "unidade", -1), 0.5);
  assert.equal(changeQuantity(0.1, "g", 1), 10.1);
});
test("estado isolado: adicionar, alterar e remover sem mutação", () => {
  const initial: DiaryDay = { date: "2026-09-09", meals: [] };
  const meal: Meal = {
    id: "meal",
    mealTypeId: "1",
    mealTypeName: "Café da manhã",
    items: [],
  };
  let day = diaryReducer(initial, { type: "add-meal", meal });
  day = diaryReducer(day, {
    type: "add-item",
    mealId: "meal",
    item: {
      id: "item",
      foodId: "food",
      name: "Ovo",
      quantity: 1,
      unit: "unidade",
    },
  });
  const before = day;
  day = diaryReducer(day, {
    type: "quantity",
    mealId: "meal",
    itemId: "item",
    direction: 1,
  });
  assert.equal(day.meals[0].items[0].quantity, 2);
  assert.equal(before.meals[0].items[0].quantity, 1);
  assert.equal(meal.items.length, 0);
  assert.equal(initial.meals.length, 0);
  day = diaryReducer(day, {
    type: "remove-item",
    mealId: "meal",
    itemId: "item",
  });
  assert.equal(day.meals[0].items.length, 0);
  day = diaryReducer(day, { type: "remove-meal", mealId: "meal" });
  assert.equal(day.meals.length, 0);
});
test("CSV preserva acentos, decimais, aspas, quebras e neutraliza fórmulas", () => {
  const csv = diaryToCsv({
    date: "2026-09-09",
    meals: [
      {
        id: "1",
        mealTypeId: "1",
        mealTypeName: "Café",
        items: [
          { id: "1", name: 'Pão, "integral"\ncaseiro', quantity: 1.5 },
          { id: "2", name: "=SUM(A1)", quantity: 1 },
        ],
      },
    ],
  });
  assert.ok(csv.startsWith("\uFEFFdate,meal,time,food,quantity,unit\r\n"));
  assert.ok(csv.includes('"Pão, ""integral""\ncaseiro",1.5,'));
  assert.ok(csv.includes("'=SUM(A1)"));
});
test("data local e unidades em português", () => {
  assert.equal(localDate(new Date(2026, 8, 9, 23, 59)), "2026-09-09");
  assert.equal(formatQuantity(2, "unidade"), "2 unidades");
  assert.equal(formatQuantity(1, "unidade"), "1 unidade");
});

test("seleções repetidas incrementam o mesmo item somente na refeição escolhida", () => {
  const item = {
    id: "coffee",
    foodId: "coffee",
    name: "Café",
    quantity: 100,
    unit: "ml",
  };
  const meal: Meal = {
    id: "first",
    mealTypeId: "breakfast",
    mealTypeName: "Café da manhã",
    items: [item],
  };
  const before: DiaryDay = {
    date: "2026-09-09",
    meals: [meal, { ...meal, id: "second" }],
  };
  let day = before;
  for (let count = 0; count < 3; count++) {
    day = diaryReducer(day, {
      type: "add-item",
      mealId: "first",
      item: { ...item, id: `new-${count}` },
    });
  }
  assert.equal(day.meals[0].items.length, 1);
  assert.equal(day.meals[0].items[0].id, "coffee");
  assert.equal(day.meals[0].items[0].quantity, 250);
  assert.equal(day.meals[1].items[0].quantity, 100);
  assert.equal(before.meals[0].items[0].quantity, 100);
});

test("editar tipo e horário preserva alimentos, quantidades e outras refeições", () => {
  const meal: Meal = {
    id: "first",
    mealTypeId: "breakfast",
    mealTypeName: "Café da manhã",
    time: "08:30",
    items: [{ id: "egg", name: "Ovo", quantity: 2 }],
  };
  const before: DiaryDay = {
    date: "2026-09-09",
    meals: [meal, { ...meal, id: "second" }],
  };
  const day = diaryReducer(before, {
    type: "edit-meal",
    mealId: "first",
    changes: {
      mealTypeId: "lunch",
      mealTypeName: "Almoço",
      iconName: "Sun",
      time: undefined,
    },
  });
  assert.equal(day.meals[0].mealTypeName, "Almoço");
  assert.equal(day.meals[0].time, undefined);
  assert.equal(day.meals[0].items, meal.items);
  assert.equal(day.meals[1], before.meals[1]);
  assert.equal(before.meals[0].time, "08:30");
});

test("itens customizados iguais são agrupados por nome e unidade", () => {
  const item = {
    id: "custom",
    name: "Meu lanche",
    unit: "porção",
    quantity: 1,
    isCustom: true,
  };
  let day: DiaryDay = {
    date: "2026-09-09",
    meals: [
      {
        id: "meal",
        mealTypeId: "snack",
        mealTypeName: "Lanche",
        items: [item],
      },
    ],
  };
  day = diaryReducer(day, {
    type: "add-item",
    mealId: "meal",
    item: { ...item, id: "new", name: " meu LANCHE " },
  });
  assert.equal(day.meals[0].items.length, 1);
  assert.equal(day.meals[0].items[0].quantity, 2);
  day = diaryReducer(day, {
    type: "add-item",
    mealId: "meal",
    item: { ...item, id: "other-unit", unit: "g" },
  });
  assert.equal(day.meals[0].items.length, 2);
});

test("ordenar preserva identidade e quantidade e limita alterações à refeição selecionada", () => {
  const items = [
    { id: "a", name: "Banana", quantity: 2 },
    { id: "b", name: "Café", quantity: 100, unit: "ml" },
    { id: "c", name: "Aveia", quantity: 20, unit: "g" },
  ];
  const meal: Meal = {
    id: "meal",
    mealTypeId: "breakfast",
    mealTypeName: "Café da manhã",
    items,
  };
  const before: DiaryDay = {
    date: "2026-09-09",
    meals: [meal, { ...meal, id: "other" }],
  };
  const day = diaryReducer(before, {
    type: "reorder-items",
    mealId: "meal",
    itemId: "a",
    overId: "c",
  });
  assert.deepEqual(
    day.meals[0].items.map((item) => item.id),
    ["b", "c", "a"],
  );
  assert.equal(day.meals[0].items[2], items[0]);
  assert.equal(day.meals[1], before.meals[1]);
  assert.deepEqual(
    before.meals[0].items.map((item) => item.id),
    ["a", "b", "c"],
  );
  const csv = diaryToCsv({ ...day, meals: [day.meals[0]] });
  assert.ok(csv.indexOf(",Café,100,ml") < csv.indexOf(",Banana,2,"));
  const invalid = diaryReducer(day, {
    type: "reorder-items",
    mealId: "meal",
    itemId: "missing",
    overId: "a",
  });
  assert.equal(invalid.meals[0], day.meals[0]);
});
