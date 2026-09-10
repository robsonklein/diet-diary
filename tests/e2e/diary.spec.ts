import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const catalog = {
  foods: [
    {
      id: "1",
      name: "Ovo cozido",
      unit: "unidade",
      default_quantity: 1,
      icon_name: "Egg",
      active: true,
      sort: 1,
    },
    {
      id: "2",
      name: "Café",
      unit: "ml",
      default_quantity: 150,
      icon_name: "Coffee",
      active: true,
      sort: 2,
    },
  ],
  mealTypes: [
    { id: "1", name: "Café da manhã", icon_name: "Sunrise", sort: 1 },
  ],
};

test("integração REST: token no servidor, filtro, paginação e normalização", async ({
  request,
}) => {
  test.skip(
    !!process.env.PLAYWRIGHT_BASE_URL,
    "O teste REST exige a fixture Directus iniciada pela configuração padrão.",
  );
  const response = await request.get("/api/catalog");
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.foods).toHaveLength(2);
  expect(body.foods[0]).toMatchObject({ id: "1", default_quantity: 1.5 });
  expect(body.mealTypes[0].id).toBe("1");
  expect(JSON.stringify(body)).not.toContain("test-read-token");
});

test("fluxo mobile completo, exportações e reset no refresh", async ({
  page,
}, testInfo) => {
  await page.route("**/api/catalog", (route) =>
    route.fulfill({ json: catalog }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Registrar primeira refeição" })
    .click();
  await page.locator('input[type="time"]').fill("08:30");
  await page
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await page.getByRole("button", { name: /Adicionar Ovo cozido/ }).click();
  await page.getByRole("textbox", { name: "Buscar alimento" }).fill("cafe");
  await page.getByRole("button", { name: /Adicionar Café/ }).click();
  await page
    .getByRole("textbox", { name: "Buscar alimento" })
    .fill("Pão integral com queijo");
  await page
    .getByRole("button", { name: "Adicionar “Pão integral com queijo”" })
    .click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await page.getByRole("button", { name: "Aumentar Ovo cozido" }).click();
  await expect(
    page
      .getByRole("group", { name: "Quantidade de Ovo cozido" })
      .locator("output"),
  ).toHaveText("2");
  await page
    .getByRole("button", { name: "Diminuir Café", exact: true })
    .click();
  await expect(
    page
      .getByRole("group", { name: "Quantidade de Café", exact: true })
      .locator("output"),
  ).toHaveText("100");
  await expect(
    page.getByText("Item customizado", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("diary-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("diary-small-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 393, height: 851 });
  await page.getByRole("button", { name: "Exportar dia", exact: true }).click();
  const csvPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Exportar CSV/ }).click();
  const csv = await csvPromise;
  const csvContent = await readFile((await csv.path())!, "utf8");
  expect(csvContent).toContain("Café da manhã,08:30,Ovo cozido,2,unidade");
  expect(csvContent).toContain("Pão integral com queijo,1,");
  const pngPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Exportar imagem PNG/ }).click();
  const png = await pngPromise;
  await png.saveAs(testInfo.outputPath("diary-export.png"));
  const pngBytes = await readFile((await png.path())!);
  expect(pngBytes.subarray(1, 4).toString()).toBe("PNG");
  expect(pngBytes.length).toBeGreaterThan(10000);
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Remover Pão integral com queijo",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Pão integral com queijo", { exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Seu dia começa aqui")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: testInfo.outputPath("diary-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 393, height: 851 });
  await page
    .getByRole("button", { name: "Registrar primeira refeição" })
    .click();
  await page
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await page.getByLabel("Opções de Café da manhã", { exact: true }).click();
  await page.getByRole("button", { name: "Excluir", exact: true }).click();
  await page
    .getByRole("button", { name: "Remover refeição", exact: true })
    .click();
  await expect(page.getByText("Seu dia começa aqui")).toBeVisible();
});

test("erro recuperável e catálogo vazio", async ({ page }) => {
  let unavailable = true;
  await page.route("**/api/catalog", (route) =>
    unavailable
      ? route.fulfill({ status: 503, json: { error: "Directus indisponível" } })
      : route.fulfill({ json: { foods: [], mealTypes: [] } }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("alert").filter({ hasText: "Directus indisponível" }),
  ).toBeVisible();
  unavailable = false;
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(
    page.getByText(/Nenhum tipo de refeição disponível/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Adicionar refeição", exact: true }),
  ).toBeDisabled();
});
