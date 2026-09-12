import { expect, test } from "@playwright/test";

const key = "nutri.diary.v1";
const day = {
  date: "2020-01-02",
  meals: [
    {
      id: "meal",
      mealTypeId: "breakfast",
      mealTypeName: "Café da manhã",
      time: "08:30",
      items: [
        { id: "custom", name: "Meu lanche", quantity: 2, isCustom: true },
      ],
    },
  ],
};

test.beforeEach(async ({ context }) => {
  await context.route("**/api/catalog", (route) =>
    route.fulfill({
      json: {
        foods: [],
        mealTypes: [{ id: "breakfast", name: "Café da manhã", sort: 1 }],
      },
    }),
  );
});

test("reabre registro e altera data preservando refeições", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(
    ({ key, day }) =>
      localStorage.setItem(key, JSON.stringify({ version: 1, day })),
    { key, day },
  );
  await page.reload();
  await expect(page.getByRole("button", { name: "Editar data do diário" })).toHaveText("Quinta -- 02/01/2020");
  await page.getByRole("button", { name: "Aumentar Meu lanche" }).click();
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto("/");
  await expect(
    reopened
      .getByRole("group", { name: "Quantidade de Meu lanche" })
      .locator("output"),
  ).toHaveText("3");
  await expect(reopened.locator("article")).toContainText("08:30");
  await reopened.getByRole("button", { name: "Editar data do diário" }).click();
  const input = reopened.getByRole("textbox", { name: "Data do diário" });
  await input.fill("31/02/2026");
  await input.press("Enter");
  await expect(reopened.locator("main").getByRole("alert")).toContainText("Informe uma data válida");
  await input.fill("10/09/2026");
  await input.press("Enter");
  await expect(reopened.getByRole("button", { name: "Editar data do diário" })).toHaveText("Quinta -- 10/09/2026");
  await reopened.reload();
  await expect(reopened.getByRole("button", { name: "Editar data do diário" })).toHaveText("Quinta -- 10/09/2026");
  await expect(reopened.locator("article")).toHaveCount(1);
  await expect(reopened.getByRole("group", { name: "Quantidade de Meu lanche" }).locator("output")).toHaveText("3");
  await reopened.getByRole("button", { name: "Editar data do diário" }).click();
  await input.fill("09/09/2026");
  await input.press("Escape");
  await expect(reopened.getByRole("button", { name: "Editar data do diário" })).toHaveText("Quinta -- 10/09/2026");

});

test("registro inválido não quebra a tela nem é sobrescrito ao abrir", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.setItem(key, "invalid-json"), key);
  await page.reload();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Não foi possível recuperar",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    "invalid-json",
  );
  await page
    .getByRole("button", { name: "Registrar primeira refeição" })
    .click();
  await page
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
});

test("falha de gravação avisa e mantém o diário utilizável", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Registrar primeira refeição" })
    .click();
  await page
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Não foi possível salvar",
  );
  await expect(page.locator("article")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Exportar dia", exact: true }),
  ).toBeEnabled();
});

test("armazenamento bloqueado na leitura exibe aviso", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "armazenamento deste navegador está indisponível",
  );
  await expect(
    page.getByRole("button", { name: "Registrar primeira refeição" }),
  ).toBeEnabled();
});
