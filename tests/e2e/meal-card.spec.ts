import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/catalog", (route) =>
    route.fulfill({
      json: {
        foods: [
          {
            id: "banana",
            name: "Banana",
            unit: "unidade",
            default_quantity: 2,
            icon_name: "Banana",
            active: true,
            sort: 1,
          },
          {
            id: "coffee",
            name: "Café",
            unit: "ml",
            default_quantity: 100,
            icon_name: "Coffee",
            active: true,
            sort: 2,
          },
        ],
        mealTypes: [
          {
            id: "breakfast",
            name: "Café da manhã",
            icon_name: "Coffee",
            sort: 1,
          },
          { id: "lunch", name: "Almoço", icon_name: "Sun", sort: 2 },
        ],
      },
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Registrar primeira refeição" })
    .click();
  await page
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await page.getByRole("button", { name: /Adicionar Banana/ }).click();
  await page.getByRole("button", { name: /Adicionar Café/ }).click();
  await page.getByRole("button", { name: "Concluir" }).click();
});

test("recolher, editar e excluir pelo menu; ordenar com teclado e cancelar", async ({
  page,
}) => {
  const handle = page.getByRole("button", {
    name: "Arrastar Banana para ordenar",
  });
  const list = page.getByRole("list", { name: "Alimentos de Café da manhã" });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(list.locator(":scope > li").first()).toContainText("Café");
  await expect(
    page.getByRole("group", { name: "Quantidade de Banana" }).locator("output"),
  ).toHaveText("2");
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Escape");
  await expect(list.locator(":scope > li").first()).toContainText("Café");

  await page.getByRole("button", { name: "Recolher Café da manhã" }).click();
  await expect(list).toBeHidden();
  const options = page.getByLabel("Opções de Café da manhã", { exact: true });
  await options.click();
  await expect(
    page.getByRole("button", { name: "Editar", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Editar", exact: true }),
  ).toBeHidden();
  await options.click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByRole("radio", { name: "Almoço", exact: true }).check();
  await page.locator('input[type="time"]').fill("12:30");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("button", { name: "Expandir Almoço" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Expandir Almoço" }).click();
  await expect(
    page
      .getByRole("list", { name: "Alimentos de Almoço" })
      .locator(":scope > li")
      .first(),
  ).toContainText("Café");
  await page.getByLabel("Opções de Almoço", { exact: true }).click();
  await page.getByRole("button", { name: "Excluir", exact: true }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByLabel("Opções de Almoço", { exact: true }).click();
  await page.getByRole("button", { name: "Excluir", exact: true }).click();
  await page
    .getByRole("button", { name: "Remover refeição", exact: true })
    .click();
  await expect(page.locator("article")).toHaveCount(0);
});

test("ordenar com mouse e toque sem alterar quantidades", async ({
  page,
  context,
}, testInfo) => {
  const list = page.getByRole("list", { name: "Alimentos de Café da manhã" });
  const first = page.getByRole("button", {
    name: "Arrastar Banana para ordenar",
  });
  const second = page.getByRole("button", {
    name: "Arrastar Café para ordenar",
  });
  await first.scrollIntoViewIfNeeded();
  await second.scrollIntoViewIfNeeded();
  const start = (await first.boundingBox())!;
  const end = (await second.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    start.x + start.width / 2,
    start.y + start.height / 2 + 12,
    { steps: 3 },
  );
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(list.locator(":scope > li").first()).toContainText("Café");

  // Eventos reais de toque via Chromium verificam o sensor em dispositivo mobile.
  await first.click({ trial: true });
  await second.click({ trial: true });
  const touchStart = (await first.boundingBox())!;
  const touchEnd = (await second.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const x = touchStart.x + touchStart.width / 2;
  const y = touchStart.y + touchStart.height / 2;
  const targetY = touchEnd.y + touchEnd.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let step = 1; step <= 12; step++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y + ((targetY - y) * step) / 12 }],
    });
  }
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
  await expect(list.locator(":scope > li").first()).toContainText("Banana");
  await expect(
    page.getByRole("group", { name: "Quantidade de Banana" }).locator("output"),
  ).toHaveText("2");
  await page.getByRole("button", { name: "Aumentar Banana" }).click();
  await expect(
    page.getByRole("group", { name: "Quantidade de Banana" }).locator("output"),
  ).toHaveText("3");
  await expect(list.locator(":scope > li").first()).toContainText("Banana");
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("sortable-mobile.png"),
    fullPage: true,
  });
});
