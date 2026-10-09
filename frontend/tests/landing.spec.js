import { test, expect } from "@playwright/test";

test("entrada com visual de jogo permanece em uma única tela", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".landing-visual > img")).toHaveJSProperty("complete", true);

  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [1280, 720],
    [1024, 600],
    [768, 1024],
    [390, 844],
    [375, 667],
    [320, 568],
    [844, 390],
    [568, 320],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole("heading", { name: /Todo lugar/ })).toBeVisible();
    const layout = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const fits = (selector) => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.right <= viewport.width &&
          rect.bottom <= viewport.height
        );
      };
      return {
        noScroll:
          document.documentElement.scrollHeight === viewport.height &&
          document.documentElement.scrollWidth === viewport.width,
        copyFits: fits(".landing-copy"),
        actionFits: fits(".landing-actions .button"),
        imageFits: fits(".landing-visual"),
        imageHeight: document.querySelector(".landing-visual").getBoundingClientRect().height,
      };
    });
    expect(layout, `${width} × ${height}`).toMatchObject({
      noScroll: true,
      copyFits: true,
      actionFits: true,
      imageFits: true,
    });
    expect(layout.imageHeight).toBeGreaterThan(100);
    const mission = page.getByRole("link", { name: /MISSÃO 01/ });
    if (await mission.isVisible()) {
      const card = await mission.boundingBox();
      const start = await page.locator(".trail-point--start").boundingBox();
      expect(card.y + card.height).toBeLessThanOrEqual(height);
      expect(
        start.y + start.height,
        `${width} × ${height}: trilha sem sobreposição`,
      ).toBeLessThanOrEqual(card.y);
    }
    if (width === 1440 || width === 390)
      await page.screenshot({ path: testInfo.outputPath(`landing-game-${width}.png`) });
  }
  expect(errors).toEqual([]);
});

test("convites da entrada levam ao cadastro e ao login", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Começar minha aventura/ }).click();
  await expect(page).toHaveURL(/\/cadastro$/);
  await expect(page.getByRole("button", { name: "Criar conta e explorar" })).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: /MISSÃO 01/ }).click();
  await expect(page).toHaveURL(/\/cadastro$/);

  await page.goto("/");
  await page.getByRole("link", { name: /^Entrar/ }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Entrar na aventura" })).toBeVisible();
});
