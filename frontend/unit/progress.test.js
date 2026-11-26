import test from "node:test";
import assert from "node:assert/strict";
import {
  readLocal,
  writeLocal,
  clearLocalJourney,
  orderedClues,
  reorder,
} from "../src/services/progress.js";
const storage = new Map();
globalThis.localStorage = new Proxy(
  {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
  {
    ownKeys: () => [...storage.keys()],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  },
);
test("persistência de progresso, rascunho e ordem isolada por visitante", () => {
  localStorage.setItem("tutti-frutti-guest-id", "A");
  writeLocal("journey", { completed: [1, 2] });
  writeLocal("order", [2, 1]);
  writeLocal("draft-3", ["alternativa"]);
  assert.deepEqual(readLocal("journey"), { completed: [1, 2] });
  assert.deepEqual(readLocal("order"), [2, 1]);
  assert.deepEqual(readLocal("draft-3"), ["alternativa"]);
  localStorage.setItem("tutti-frutti-guest-id", "B");
  assert.equal(readLocal("journey"), null);
  writeLocal("order", [4]);
  localStorage.setItem("tutti-frutti-guest-id", "A");
  clearLocalJourney();
  assert.equal(readLocal("journey"), null);
  assert.equal(readLocal("draft-3"), null);
  assert.equal(readLocal("order"), null);
  localStorage.setItem("tutti-frutti-guest-id", "B");
  assert.deepEqual(readLocal("order"), [4]);
});
test("ordem guarda apenas pistas concluídas, remove duplicatas e inclui novas", () => {
  const activities = [
    { id: 1, status: "completed" },
    { id: 2, status: "completed" },
    { id: 3, status: "locked" },
    { id: 4, status: "in_progress" },
    { id: 5, status: "completed" },
  ];
  assert.deepEqual(
    orderedClues(activities, [2, 3, 2, 99]).map((x) => x.id),
    [2, 1, 5],
  );
});
test("movimentos de arraste e teclado preservam todas as pistas", () => {
  let ids = [1, 2, 3, 4, 5, 6];
  ids = reorder(ids, 5, 1);
  for (let i = 0; i < 3; i++) ids = reorder(ids, 4, ids[ids.indexOf(4) - 1]);
  for (let i = 0; i < 2; i++) ids = reorder(ids, 6, ids[ids.indexOf(6) - 1]);
  assert.deepEqual(ids, [5, 4, 1, 6, 2, 3]);
  assert.deepEqual(reorder(ids, 99, 1), ids);
  assert.deepEqual(reorder(ids, 1, 1), ids);
});
