import { expect, test } from "@playwright/test";

test("PWA instala service worker, abre o diário offline e sincroniza após reconectar", async ({
  page,
  context,
}) => {
  await page.goto("/aventura?aba=journal");
  await expect(page.getByRole("heading", { name: "Meu diário" })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  // Use the actual API to seed a completed stage, then exercise the offline user interface.
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
  await page.reload();
  await expect(page.locator(".clue-sort-card strong")).toHaveText(["AMIZADE"]);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("Offline · cópia local")).toBeVisible();
  await expect(page.locator(".clue-sort-card strong")).toHaveText(["AMIZADE"]);
  await context.setOffline(false);
  await expect(page.getByText("Online · jornada salva")).toBeVisible();
});
