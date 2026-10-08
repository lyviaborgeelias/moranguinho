import { test, expect } from "@playwright/test";

const password = "PomarSecreto42!";
async function register(page, name = "Exploradora") {
  const email = `exploradora-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  await page.goto("/cadastro");
  await page.getByLabel("Seu nome", { exact: true }).fill(name);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Confirme sua senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar conta e explorar" }).click();
  await expect(page).toHaveURL(/\/aventura/);
  await expect(page.getByRole("button", { name: "Explorar destino" })).toBeVisible();
  return email;
}
async function reveal(page) {
  await page.getByRole("button", { name: "Revelar fragmento" }).click();
  await expect(page.getByText("FRAGMENTO ENCONTRADO", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao mapa", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test("jornada completa, memória, progresso persistente, perfil e certificado", async ({
  page,
}, testInfo) => {
  const consoleErrors = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Todo lugar/ })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("landing-desktop.png"), fullPage: true });
  const email = await register(page);
  await page.screenshot({ path: testInfo.outputPath("map-desktop.png"), fullPage: true });
  await expect(page.getByRole("button", { name: "Grande Árvore: bloqueado" })).toBeDisabled();

  await page.getByRole("button", { name: "Pomar dos Morangos: explorar" }).click();
  await page.getByLabel("Sua descoberta").fill("limão");
  await page.getByRole("button", { name: "Revelar fragmento" }).click();
  await expect(page.getByText(/Ainda não é essa/)).toBeVisible();
  await page.getByRole("button", { name: "Preciso de uma dica" }).click();
  await page.getByLabel("Sua descoberta").fill("Morango");
  await reveal(page);

  await page.getByRole("button", { name: "Explorar destino" }).click();
  await page.getByRole("button", { name: "30", exact: true }).click();
  await reveal(page);

  await page.getByRole("button", { name: "Explorar destino" }).click();
  const cards = page.locator(".memory-card");
  const known = new Map();
  for (
    let turn = 0;
    turn < 25 && (await page.locator(".memory-card.is-matched").count()) < 8;
    turn++
  ) {
    const unmatched = [];
    for (let i = 0; i < 8; i++)
      if (!(await cards.nth(i).getAttribute("class")).includes("is-matched")) unmatched.push(i);
    let firstIndex = unmatched.find((i) => !known.has(i)) ?? unmatched[0];
    const knownPair = unmatched.find(
      (i) => known.has(i) && unmatched.some((j) => j !== i && known.get(i) === known.get(j)),
    );
    if (knownPair !== undefined) firstIndex = knownPair;
    await cards.nth(firstIndex).click();
    const symbol = (await cards.nth(firstIndex).getAttribute("aria-label")).split(": ")[1];
    known.set(firstIndex, symbol);
    const secondIndex =
      unmatched.find((i) => i !== firstIndex && known.get(i) === symbol) ??
      unmatched.find((i) => i !== firstIndex && !known.has(i)) ??
      unmatched.find((i) => i !== firstIndex);
    await cards.nth(secondIndex).click();
    known.set(
      secondIndex,
      (await cards.nth(secondIndex).getAttribute("aria-label")).split(": ")[1],
    );
    await expect
      .poll(async () => {
        const first = await cards.nth(firstIndex).getAttribute("class");
        if (!first.includes("is-matched")) return !first.includes("is-flipped");
        return page
          .locator(".memory-card:not(.is-matched):not([disabled])")
          .count()
          .then((count) => count > 0 || unmatched.length === 2);
      })
      .toBeTruthy();
  }
  await expect(page.locator(".memory-card.is-matched")).toHaveCount(8);
  await reveal(page);

  await page.getByRole("button", { name: "Explorar destino" }).click();
  for (const option of ["Biruta", "Leste", "60"])
    await page.getByRole("button", { name: option, exact: true }).click();
  await reveal(page);

  await page.getByRole("button", { name: "Explorar destino" }).click();
  await page.getByRole("button", { name: "Mover Evaporação para cima", exact: true }).click();
  await page.getByRole("button", { name: "Mover Evaporação para cima", exact: true }).click();
  await page.getByRole("button", { name: "Mover Condensação para cima", exact: true }).click();
  await page.getByRole("button", { name: "Mover Condensação para cima", exact: true }).click();
  await reveal(page);

  await page.getByRole("button", { name: "Explorar destino" }).click();
  await page.getByLabel("Sua descoberta").fill("Florescer");
  await reveal(page);
  await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Ver certificado" }).click();
  await expect(page.getByRole("dialog")).toContainText("Exploradora");
  await page.screenshot({ path: testInfo.outputPath("certificate.png") });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".certificate")).toBeVisible();
  await expect(page.locator(".app-sidebar")).toBeHidden();
  await page.pdf({
    path: testInfo.outputPath("certificate-demo.pdf"),
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Fechar", exact: true }).click();

  await page.getByRole("button", { name: "Meu diário", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Juntos o vale volta a florescer." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Conquistas", exact: true }).click();
  await expect(page.getByText("Conquistado", { exact: true })).toHaveCount(3);
  await page.getByRole("button", { name: "Meu perfil", exact: true }).click();
  await page.getByLabel("Seu nome", { exact: true }).fill("Guardião do Vale");
  await page.getByRole("button", { name: "Salvar nome" }).click();
  await expect(page.getByText("Seu nome foi atualizado.")).toBeVisible();

  await page.getByRole("button", { name: "Sair da conta" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar na aventura" }).click();
  await expect(page.getByText(/Olá, Guardião/)).toBeVisible();
  await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Ver certificado" })).toBeVisible();
  await page.evaluate(() => localStorage.setItem("accessToken", "expired-access-token"));
  await page.reload();
  await expect(page.getByRole("button", { name: "Ver certificado" })).toBeVisible();
  await page.getByRole("button", { name: "Reiniciar jornada", exact: true }).click();
  await page.getByRole("button", { name: "Manter minha jornada" }).click();
  await expect(page.getByRole("button", { name: "Ver certificado" })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("celular: cadastro, mapa navegável e desafio acessível", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await register(page, "Explorador Mobile");
  await page.screenshot({ path: testInfo.outputPath("map-mobile.png"), fullPage: true });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Explorar destino" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Sua descoberta").fill("morango");
  await reveal(page);
  await page.getByRole("button", { name: "Meu diário", exact: true }).click();
  await expect(page.getByText("JUNTOS", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Mapa do vale", exact: true }).click();
  await page.getByRole("button", { name: "Explorar destino" }).click();
  await expect(page.getByRole("heading", { name: "O jardim dos padrões" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "O jardim dos padrões" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/aventura$/);
  await page.getByRole("button", { name: "Meu perfil", exact: true }).click();
  await page.getByRole("button", { name: "Encerrar sessão" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("erros de acesso explicados e proteção de rota", async ({ page }) => {
  await page.goto("/aventura");
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("E-mail", { exact: true }).fill("naoexiste@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("SenhaIncorreta42");
  await page.getByRole("button", { name: "Entrar na aventura" }).click();
  await expect(page.getByRole("alert")).toContainText("E-mail ou senha inválidos.");
  await page.route("**/api/login/", (route) => route.abort());
  await page.getByRole("button", { name: "Entrar na aventura" }).click();
  await expect(page.getByRole("alert")).toContainText("Não conseguimos conectar ao servidor");
});
