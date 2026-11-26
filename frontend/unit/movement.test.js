import { test } from "node:test";
import assert from "node:assert/strict";
import { manualMovement } from "../src/game/movement.js";
import { findPath, FRIENDS, SPAWN } from "../src/game/world.js";

const idle = { x: 0, y: 0 };
const step = (options = {}) =>
  manualMovement({
    position: SPAWN,
    keys: new Set(),
    joystick: idle,
    yaw: 0,
    dt: 0.05,
    ...options,
  });

test("uma trilha visual existente não movimenta a personagem sem comando", () => {
  const path = findPath(SPAWN, FRIENDS[0]);
  assert.ok(path.length > 0);
  let position = SPAWN;
  for (let i = 0; i < 120; i++) position = step({ position, path });
  assert.deepEqual(position, { ...SPAWN, dx: 0, dz: 0 });
});

test("WASD e setas comandam o deslocamento e soltar a tecla para imediatamente", () => {
  for (const [key, axis, sign] of [
    ["w", "z", -1],
    ["s", "z", 1],
    ["a", "x", -1],
    ["d", "x", 1],
    ["arrowup", "z", -1],
    ["arrowdown", "z", 1],
    ["arrowleft", "x", -1],
    ["arrowright", "x", 1],
  ]) {
    const moved = step({ keys: new Set([key]) });
    assert.equal(Math.sign(moved[axis] - SPAWN[axis]), sign);
    const stopped = step({ position: moved });
    assert.equal(stopped.x, moved.x);
    assert.equal(stopped.z, moved.z);
  }
});

test("Shift aumenta a velocidade somente quando existe comando de movimento", () => {
  assert.deepEqual(step({ keys: new Set(["shift"]) }), { ...SPAWN, dx: 0, dz: 0 });
  assert.ok(step({ keys: new Set(["w", "shift"]) }).z < step({ keys: new Set(["w"]) }).z);
});

test("joystick move, soltá-lo interrompe e arrastar câmera não desloca", () => {
  const moved = step({ joystick: { x: 1, y: 0 } });
  assert.ok(moved.x > SPAWN.x);
  const stopped = step({ position: moved, yaw: Math.PI });
  assert.equal(stopped.x, moved.x);
  assert.equal(stopped.z, moved.z);
});

test("movimento diagonal é normalizado e obstáculos continuam bloqueando passagem", () => {
  const diagonal = step({ keys: new Set(["w", "d"]) });
  assert.ok(Math.abs(Math.hypot(diagonal.x - SPAWN.x, diagonal.z - SPAWN.z) - 0.16) < 1e-9);
  const position = { x: 7.1, z: 0 };
  assert.equal(step({ position, keys: new Set(["d"]) }).x, position.x);
});
