import { expect, test } from "@playwright/test";

async function expectPageBottom(page: import("@playwright/test").Page) {
  await expect.poll(() => page.evaluate(() =>
    Math.abs(document.documentElement.scrollHeight - window.innerHeight - window.scrollY),
  )).toBeLessThan(3);
}

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
  await expect(page.getByRole("dialog", { name: "Nova refeição", exact: true })).toHaveClass(/side-drawer/);
  await page
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await page.getByRole("button", { name: /Adicionar Banana/ }).click();
  await page.getByRole("button", { name: /Adicionar Café/ }).click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await expect(page.getByRole("dialog", { name: "Adicionar alimentos", exact: true })).toHaveCount(0);
  await expectPageBottom(page);
});

test("ações no fim da lista e rolagem após incluir refeições e alimentos", async ({ page }) => {
  const actions = page.locator('main > footer[aria-label="Ações do diário"]');
  await expect(actions).toHaveCSS("position", "static");
  expect((await actions.boundingBox())!.y).toBeGreaterThan((await page.locator("article").last().boundingBox())!.y);
  await page.getByRole("button", { name: "Adicionar refeição", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar alimentos", exact: true }).click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await expect(page.locator("article")).toHaveCount(2);
  await expectPageBottom(page);

  // Adicionar na primeira refeição também retorna aos controles no fim do dia.
  await page.locator("article").first().getByRole("button", { name: "Adicionar alimento", exact: true }).click();
  await page.getByRole("textbox", { name: "Buscar alimento" }).fill("Banana");
  await page.getByRole("button", { name: /Aumentar quantidade de Banana/ }).click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await expectPageBottom(page);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("article").first().getByRole("button", { name: "Adicionar alimento", exact: true }).click();
  await page.getByRole("textbox", { name: "Buscar alimento" }).fill("Meu lanche");
  await page.getByRole("button", { name: "Adicionar item “Meu lanche”" }).click();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await expectPageBottom(page);
  await expect(actions.getByRole("button", { name: "Exportar dia", exact: true })).toBeVisible();
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
  await expect(handle).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Banana na posição 1 de 2.", { exact: true })).toBeAttached();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByText("Banana na posição 2 de 2.", { exact: true })).toBeAttached();
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
  await page.reload();
  await expect(page.locator("article")).toContainText("12:30");
  await expect(page.getByRole("list", { name: "Alimentos de Almoço" }).locator(":scope > li").first()).toContainText("Café");
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

test("tipos usados ficam desabilitados e voltam a ficar disponíveis após exclusão", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Adicionar refeição", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "Café da manhã", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("radio", { name: "Almoço", exact: true }),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await page
    .getByRole("button", { name: "Adicionar refeição", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "Almoço", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Adicionar alimentos", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText(/Todas as refeições já foram adicionadas/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByLabel("Opções de Café da manhã", { exact: true }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Café da manhã", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("radio", { name: "Almoço", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByLabel("Opções de Almoço", { exact: true }).click();
  await page.getByRole("button", { name: "Excluir", exact: true }).click();
  await page
    .getByRole("button", { name: "Remover refeição", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Adicionar refeição", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "Almoço", exact: true }),
  ).toBeEnabled();
});

test("drawer lateral mantém busca no topo e permite item customizado com tela reduzida", async ({
  page,
}, testInfo) => {
  await page
    .getByRole("button", { name: "Adicionar alimento", exact: true })
    .click();
  const drawer = page.getByRole("dialog", {
    name: "Adicionar alimentos",
    exact: true,
  });
  await expect(drawer).toHaveClass(/side-drawer/);
  await page.setViewportSize({ width: 1280, height: 900 });
  const panel = drawer.locator(".side-drawer-panel");
  await expect.poll(async () => {
    const box = (await panel.boundingBox())!;
    return Math.abs(box.x + box.width - 1280);
  }).toBeLessThan(2);
  await page.setViewportSize({ width: 393, height: 420 });
  const search = page.getByRole("textbox", { name: "Buscar alimento" });
  await search.fill("Meu sanduíche");
  const searchBox = (await search.boundingBox())!;
  expect(searchBox.y).toBeLessThan(160);
  await expect(drawer).toHaveCSS("height", "420px");
  const add = page.getByRole("button", {
    name: "Adicionar item “Meu sanduíche”",
  });
  await expect(add).toHaveClass(/btn-primary/);
  await add.scrollIntoViewIfNeeded();
  expect((await search.boundingBox())!.y).toBe(searchBox.y);
  await page.screenshot({
    path: testInfo.outputPath("side-drawer-small-viewport.png"),
  });
  await add.click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await expect(drawer).toHaveCount(0);
  await expect(page.getByText("Meu sanduíche", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Adicionar alimento", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Adicionar alimento", exact: true }),
  ).toBeFocused();
});
