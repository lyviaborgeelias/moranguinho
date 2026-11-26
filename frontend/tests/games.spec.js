import { expect, test } from "@playwright/test";

const phases = [
  ["Laranjinha", "Uma enguia e um girino", "No salão, com medo do Galumphalot"],
  ["Liminha", "Cantava para as violetas", "Do clube de boliche"],
  [
    "Uvinha",
    "Vestiu-se como a detetive e saiu à procura de casos",
    "Brilho dos Berrykins e solução de Berrykin Bloom",
  ],
  ["Amora", "Margaridas e milho de pipoca", "Ela escolheu algo que ela mesma queria ganhar"],
  ["Cerejinha", "A inauguração do mercado", "Sentiu medo de se apresentar no palco"],
  [
    "Framboesa",
    "O desenho que fez em sua lanterna",
    "Criar uma coleção de roupas com glitter na cidade grande",
  ],
];

test("jornada em tela de celular, revisão, festa, certificado e progresso preservado", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Deliberately test the real fallback path used on devices without WebGL.
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...options) {
      if (type.startsWith("webgl")) return null;
      return getContext.call(this, type, ...options);
    };
  });

  await page.goto("/aventura");
  await page.getByRole("button", { name: "Abrir meu perfil" }).click();
  await page.getByLabel("Seu nome", { exact: true }).fill("Luna");
  await page.getByRole("button", { name: "Salvar nome" }).click();
  await expect(page.getByText("Seu nome foi atualizado.")).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao jardim", exact: true }).click();
  await page.getByRole("button", { name: "Jogar com a lista de encontros" }).click();
  const list = page.getByRole("region", { name: "Lista de encontros" });
  await list.getByRole("button", { name: /Cerejinha/ }).click();
  await expect(page.getByRole("dialog", { name: "Conversar com Cerejinha" })).not.toContainText(
    "Aceitar missão",
  );
  await page.getByRole("button", { name: "Ir até Laranjinha" }).click();

  for (const [index, [friend, first, second]] of phases.entries()) {
    const encounter = page.getByRole("dialog", { name: `Conversar com ${friend}` });
    await expect(encounter.getByRole("img", { name: friend })).toBeVisible();
    await encounter.getByRole("button", { name: "Aceitar missão" }).click();
    const quiz = page.getByRole("dialog");
    const select = (answer) => quiz.getByRole("button", { name: answer, exact: true }).click();
    const nextQuestion = quiz.getByRole("button", { name: "Próxima pergunta" });
    await expect(nextQuestion).toBeDisabled();
    await select(index === 0 ? "Uma enguia e um filhote de peixe" : first);
    await nextQuestion.click();
    await select(second);
    const confirm = quiz.getByRole("button", { name: "Confirmar pista" });
    await confirm.click();
    if (index === 0) {
      await expect(quiz.getByRole("status")).toContainText("Revise a pergunta 1");
      await select(first);
      await nextQuestion.click();
      await expect(quiz.getByRole("button", { name: second, exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await confirm.click();
    }
    await expect(quiz.getByRole("status")).toContainText("+100 XP");
    await quiz
      .getByRole("button", {
        name: index === 5 ? "Resolver enigma final" : "Seguir para o próximo encontro",
      })
      .click();
  }

  const riddle = page.getByRole("dialog", { name: "Enigma final" });
  await expect(riddle).toBeVisible();
  await expect(page.getByRole("button", { name: "Meu certificado" })).toHaveCount(0);
  await riddle.getByRole("button", { name: "Validar solução" }).click();
  await expect(riddle.getByRole("alert")).toContainText("Ainda não é a sequência");
  // Drag CUIDADO to the first position, then use the keyboard-accessible controls.
  await riddle.locator("li").filter({ hasText: "CUIDADO" }).dragTo(riddle.locator("li").first());
  for (const word of ["CARINHO", "CARINHO", "CARINHO", "AMIGOS", "AMIGOS"]) {
    const button = riddle.getByRole("button", { name: `Subir ${word}` });
    await button.focus();
    await page.keyboard.press("Enter");
  }
  await expect(riddle.locator("li strong")).toHaveText([
    "CUIDADO",
    "CARINHO",
    "AMIZADE",
    "AMIGOS",
    "MORANGO",
    "ALEGRIA",
  ]);
  await riddle.getByRole("button", { name: "Validar solução" }).click();
  const party = page.getByRole("dialog", { name: "Festa das amigas" });
  await expect(party.locator(".festival-friends li")).toHaveCount(6);
  await expect(party.locator(".festival-stamps span")).toHaveCount(6);
  await party.getByRole("button", { name: "Abrir o livro" }).click();
  await expect(party.getByRole("status")).toContainText("A receita da amizade");
  expect(await party.evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("festa-celular.png") });
  await party.getByRole("button", { name: "Ver certificado" }).click();
  const certificate = page.getByRole("dialog", { name: "Certificado da aventura" });
  await expect(certificate.getByRole("heading", { name: "Guardião do Jardim" })).toBeVisible();
  await expect(certificate).toContainText("Luna");
  await expect(certificate).toContainText("600 XP");
  await page.evaluate(() => {
    window.print = () => (document.body.dataset.printRequested = "yes");
  });
  await certificate.getByRole("button", { name: "Imprimir ou salvar em PDF" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-print-requested", "yes");
  await page.emulateMedia({ media: "print" });
  await expect(certificate.locator(".certificate")).toBeVisible();
  await expect(certificate.getByRole("button", { name: "Voltar à festa" })).toBeHidden();
  const pdf = await page.pdf({
    path: testInfo.outputPath("certificado.pdf"),
    format: "A4",
    printBackground: true,
  });
  expect(pdf.length).toBeGreaterThan(5000);
  await page.emulateMedia({ media: "screen" });
  await page.reload();
  await page.getByRole("button", { name: "Conquistas" }).click();
  await expect(page.getByRole("heading", { name: "Guardião do Jardim" })).toBeVisible();
  await expect(page.getByText(/de 3 conquistas desbloqueadas/)).toContainText("3 de 3");
  await page.getByRole("button", { name: "Meu certificado" }).click();
  await expect(certificate).toContainText("Luna");
});
