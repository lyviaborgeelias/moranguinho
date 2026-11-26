import { expect, test } from "@playwright/test";

test("o caminho guiado chega a Laranjinha e abre a conversa", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 650 });
  await page.goto("/aventura");
  const next = page.getByRole("button", { name: "Seguir até Laranjinha" });
  await next.click();
  const world = page.getByTestId("garden-world");
  await expect.poll(async () => Number(await world.getAttribute("data-player-z"))).toBeLessThan(13);
  const encounter = page.getByRole("dialog", { name: "Conversar com Laranjinha" });
  await expect(encounter).toBeVisible({ timeout: 25000 });
  await encounter.getByRole("button", { name: "Sobre o bilhete" }).click();
  await expect(encounter.locator(".encounter-speech")).toContainText("pano da cesta");
  await encounter.getByRole("button", { name: "Pedir uma dica" }).click();
  await expect(encounter.locator(".encounter-speech")).toContainText("riacho");
  await encounter.getByRole("button", { name: "Aceitar missão" }).click();
  const quest = page.getByRole("dialog", { name: "A cesta de Laranjinha" });
  await expect(quest).toBeVisible();
  await quest.getByRole("button", { name: "Uma enguia e um girino", exact: true }).click();
  await quest.getByRole("button", { name: "Próxima pergunta" }).click();
  await quest
    .getByRole("button", { name: "No salão, com medo do Galumphalot", exact: true })
    .click();
  await quest.getByRole("button", { name: "Confirmar pista" }).click();
  await quest.getByRole("button", { name: "Seguir para o próximo encontro" }).click();
  await expect(page.getByRole("heading", { name: "Encontre Liminha" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Parar caminhada" })).toBeVisible();
});

test("é possível recuperar a conexão sem perder a entrada da jornada", async ({ page }) => {
  await page.route("**/api/journey/", (route) => route.abort());
  await page.goto("/aventura");
  await expect(page.getByRole("alert")).toContainText("Não conseguimos conectar");
  await page.unroute("**/api/journey/");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByRole("button", { name: "Seguir até Laranjinha" })).toBeVisible();
});
