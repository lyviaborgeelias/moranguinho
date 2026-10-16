import { test, expect } from "@playwright/test";

const route = [
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 3],
  [3, 3],
  [3, 4],
  [3, 5],
  [4, 5],
  [5, 5],
  [5, 4],
  [5, 3],
  [5, 4],
  [5, 5],
  [4, 5],
  [3, 5],
  [2, 5],
  [1, 5],
];
async function openNext(page) {
  await page.getByRole("button", { name: "Explorar destino", exact: true }).click();
}
async function confirm(page) {
  await page.getByRole("button", { name: "Confirmar pista", exact: true }).click();
  await expect(page.getByText("PISTA CONFIRMADA", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao mapa", exact: true }).click();
}
async function seed(page, id, answer) {
  const result = await page.evaluate(
    async ({ id, answer }) => {
      const response = await fetch(`/api/activities/${id}/answer/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-ID": localStorage.getItem("tutti-frutti-guest-id"),
        },
        body: JSON.stringify({ answer }),
      });
      return response.json();
    },
    { id, answer },
  );
  expect(result.correct).toBe(true);
}

test("jornada jogável: labirinto, cadeado, pares, lanternas, rota e cofre", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/aventura");
  await openNext(page);
  await expect(page.getByRole("button", { name: "Confirmar pista" })).toBeDisabled();
  await page.getByRole("button", { name: "Mover para baixo", exact: true }).click();
  await page.getByRole("button", { name: "Mover para baixo", exact: true }).click();
  await expect(page.getByText("♥ 2/3 corações", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reiniciar labirinto" }).click();
  for (const [r, c] of route.slice(1))
    await page.getByRole("button", { name: new RegExp(`^Casa ${r + 1}, ${c + 1}:`) }).click();
  await page.screenshot({ path: testInfo.outputPath("maze.png") });
  await confirm(page);

  await openNext(page);
  for (let disk = 1; disk <= 3; disk++)
    await page.getByRole("button", { name: `Avançar disco ${disk}`, exact: true }).click();
  await page.getByRole("button", { name: "Confirmar pista" }).click();
  await expect(page.getByText(/Essa pista não fecha/)).toBeVisible();
  for (const [index, count] of [3, 7, 6].entries())
    for (let n = 0; n < count; n++)
      await page.getByRole("button", { name: `Avançar disco ${index + 1}`, exact: true }).click();
  await confirm(page);

  await openNext(page);
  const cards = page.locator(".memory-card");
  const known = new Map();
  for (
    let turn = 0;
    turn < 14 && (await page.locator(".memory-card.is-matched").count()) < 12;
    turn++
  ) {
    const unmatched = [];
    for (let i = 0; i < 12; i++)
      if (!(await cards.nth(i).getAttribute("class")).includes("is-matched")) unmatched.push(i);
    const first =
      unmatched.find(
        (i) => known.has(i) && unmatched.some((j) => j !== i && known.get(i) === known.get(j)),
      ) ??
      unmatched.find((i) => !known.has(i)) ??
      unmatched[0];
    await cards.nth(first).click();
    known.set(first, (await cards.nth(first).getAttribute("aria-label")).split(": ")[1]);
    const second =
      unmatched.find((i) => i !== first && known.get(i) === known.get(first)) ??
      unmatched.find((i) => i !== first && !known.has(i)) ??
      unmatched.find((i) => i !== first);
    await cards.nth(second).click();
    known.set(second, (await cards.nth(second).getAttribute("aria-label")).split(": ")[1]);
    await expect
      .poll(() => page.locator(".memory-card.is-flipped:not(.is-matched)").count())
      .toBe(0);
    if ((await page.locator(".memory-card.is-matched").count()) < 12)
      await expect(page.locator(".memory-card:not(.is-matched)").first()).toBeEnabled();
  }
  await expect(page.locator(".memory-card.is-matched")).toHaveCount(12);
  await confirm(page);

  await openNext(page);
  for (const i of [1, 3, 7, 9])
    await page.getByRole("button", { name: new RegExp(`^Lanterna ${i}:`) }).click();
  await expect(page.getByText(/Passagem liberada/)).toBeVisible();
  await confirm(page);

  await openNext(page);
  const order = ["Cozinha", "Jardim", "Ponte", "Praça", "Pomar", "Casa da árvore"];
  await expect(page.locator(".order-list strong")).toHaveCount(6);
  for (let target = 0; target < order.length; target++) {
    while (
      (await page.locator(".order-list strong").allTextContents()).indexOf(order[target]) > target
    )
      await page
        .getByRole("button", { name: `Mover ${order[target]} para cima`, exact: true })
        .click();
  }
  await confirm(page);
  await openNext(page);
  for (const [index, letter] of [..."AMIGOS"].entries()) {
    const steps = letter.charCodeAt(0) - 65;
    for (let n = 0; n < steps; n++)
      await page.getByRole("button", { name: `Avançar disco ${index + 1}`, exact: true }).click();
  }
  await page.getByRole("button", { name: "Confirmar pista" }).click();
  await expect(page.getByRole("dialog").getByText(/Caso resolvido! As amigas/)).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao mapa", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Ver certificado", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("celular: painel trava em oito movimentos e reinicia sem perder fases", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/aventura");
  await expect(page.getByRole("button", { name: "Explorar destino", exact: true })).toBeVisible();
  await seed(page, 1, route);
  await seed(page, 2, "487");
  await seed(
    page,
    3,
    ["a", "b", "c", "d", "e", "f"].map((id) => [id + "1", id + "2"]),
  );
  await page.reload();
  await openNext(page);
  for (let n = 0; n < 8; n++) await page.getByRole("button", { name: /^Lanterna 2:/ }).click();
  await expect(page.getByText(/O painel travou/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirmar pista" })).toBeDisabled();
  await page.getByRole("button", { name: "Reiniciar painel" }).click();
  await expect(page.getByText("0/8 movimentos", { exact: true })).toBeVisible();
  expect(
    await page.getByRole("dialog").evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("lights-mobile.png") });
});
