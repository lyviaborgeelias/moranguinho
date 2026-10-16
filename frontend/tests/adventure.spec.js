import { test, expect } from "@playwright/test";

test("entrada livre e endereços antigos levam ao jogo", async ({ page }) => {
  for (const path of ["/aventura", "/login", "/cadastro"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/aventura$/);
    await expect(page.getByRole("button", { name: "Explorar destino", exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Fase 2: O cadeado da despensa", exact: true }),
    ).toBeDisabled();
  }
});

test("falha de conexão pode ser recuperada", async ({ page }) => {
  await page.route("**/api/journey/", (route) => route.abort());
  await page.goto("/aventura");
  await expect(page.getByRole("alert")).toContainText("Não conseguimos conectar");
  await page.unroute("**/api/journey/");
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByRole("button", { name: "Explorar destino", exact: true })).toBeVisible();
});
