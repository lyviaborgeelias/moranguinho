import { expect, test } from "@playwright/test";

test("a trilha não movimenta a personagem e o jogador controla a caminhada", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 650 });
  await page.goto("/aventura");
  const next = page.getByRole("button", { name: "Mostrar caminho até Laranjinha" });
  const world = page.getByTestId("garden-world");
  await expect(world).toHaveAttribute("data-player-z", "14.00");
  const originalX = await world.getAttribute("data-player-x");
  await next.click();
  await expect(page.getByRole("button", { name: "Ocultar trilha" })).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(world).toHaveAttribute("data-player-z", "14.00");
  await expect(world).toHaveAttribute("data-player-x", originalX);
  const encounter = page.getByRole("dialog", { name: "Conversar com Laranjinha" });
  await expect(encounter).toHaveCount(0);
  await page.keyboard.down("w");
  try {
    await expect(page.getByRole("button", { name: /CONVERSAR COM Laranjinha/ })).toBeVisible({
      timeout: 15000,
    });
  } finally {
    await page.keyboard.up("w");
  }
  await expect(encounter).toHaveCount(0);
  await page.waitForTimeout(150);
  const stoppedX = await world.getAttribute("data-player-x");
  const stoppedZ = await world.getAttribute("data-player-z");
  await page.waitForTimeout(500);
  await expect(world).toHaveAttribute("data-player-x", stoppedX);
  await expect(world).toHaveAttribute("data-player-z", stoppedZ);
  await page.keyboard.press("e");
  await expect(encounter).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Ocultar trilha" })).toBeVisible();
  await page.waitForTimeout(750);
  await expect(world).toHaveAttribute("data-player-x", stoppedX);
  await expect(world).toHaveAttribute("data-player-z", stoppedZ);
});

test("é possível recuperar a conexão sem perder a entrada da jornada", async ({ page }) => {
  await page.route("**/api/journey/", (route) => route.abort());
  await page.goto("/aventura");
  await expect(page.getByRole("alert")).toContainText("Não conseguimos conectar");
  await page.unroute("**/api/journey/");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByRole("button", { name: "Mostrar caminho até Laranjinha" })).toBeVisible();
});
