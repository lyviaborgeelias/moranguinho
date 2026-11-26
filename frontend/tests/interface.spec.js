import { expect, test } from "@playwright/test";

test("interface 3D mantém o objetivo, a identidade e o menu acessíveis", async ({ page }) => {
  await page.goto("/aventura");
  await expect(page.getByRole("button", { name: "Mostrar caminho até Laranjinha" })).toBeVisible();
  for (const [width, height] of [
    [1280, 720],
    [390, 844],
    [320, 568],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole("button", { name: "Mostrar caminho até Laranjinha" })).toBeInViewport({
      ratio: 1,
    });
    await expect(page.getByRole("navigation", { name: "Navegação da aventura" })).toBeInViewport({
      ratio: 1,
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole("button", { name: /Meu diário/ }).click();
  await expect(page.getByRole("heading", { name: "Meu diário", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Visitar Laranjinha" })).toBeVisible();
  await expect(page.getByText("Encontro bloqueado", { exact: true })).toHaveCount(5);
});

test("perfil salva o nome no dispositivo e reinício pede confirmação", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/aventura?aba=profile");
  await page.getByLabel("Seu nome", { exact: true }).fill("Luna");
  await page.getByRole("button", { name: "Salvar nome" }).click();
  await expect(page.getByText("Seu nome foi atualizado.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Seu nome", { exact: true })).toHaveValue("Luna");
  await page.getByRole("button", { name: "Reiniciar jornada", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Reiniciar jornada" })).toBeVisible();
  await page.getByRole("button", { name: "Manter minha jornada" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
