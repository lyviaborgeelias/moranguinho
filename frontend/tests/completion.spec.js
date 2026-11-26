import { expect, test } from "@playwright/test";

test("geolocalização opcional e início/continuação distintos no tablet", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: -22.9, longitude: -47.05, accuracy: 20 });
  await page.goto("/aventura?aba=profile");
  await page.getByRole("button", { name: "Usar minha localização" }).click();
  await expect(page.getByText(/Latitude: -22.9000/)).toBeVisible();
  await page.getByRole("button", { name: "Limpar localização" }).click();
  await expect(page.getByText(/Latitude:/)).toHaveCount(0);
  // Complete the first mission via the real API to exercise continue/new start without WebGL.
  await page.evaluate(async () => {
    const id = localStorage.getItem("tutti-frutti-guest-id");
    const response = await fetch("/api/activities/1/answer/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Guest-ID": id },
      body: JSON.stringify({
        answer: ["Uma enguia e um girino", "No salão, com medo do Galumphalot"],
      }),
    });
    if (!response.ok || !(await response.json()).correct)
      throw new Error("Falha ao preparar a primeira pista");
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: /Meu diário/ }).click();
  await expect(page.locator(".clue-sort-card strong")).toHaveText(["AMIZADE"]);
  await page.goto("/");
  await page.getByRole("link", { name: /Começar investigação/ }).click();
  await expect(page.getByRole("dialog", { name: "Reiniciar jornada" })).toBeVisible();
  await page.getByRole("button", { name: "Sim, reiniciar" }).click();
  await page.getByRole("button", { name: /Meu diário/ }).click();
  await expect(page.locator(".clue-sort-card")).toHaveCount(0);
});
