import { canWalk } from "./world.js";

// Only active keyboard or joystick input can change the player's horizontal position.
export function manualMovement({ position, keys, joystick, yaw, dt, obstacles = [] }) {
  const forward =
    Number(keys.has("w") || keys.has("arrowup")) -
    Number(keys.has("s") || keys.has("arrowdown")) -
    joystick.y;
  const side =
    Number(keys.has("d") || keys.has("arrowright")) -
    Number(keys.has("a") || keys.has("arrowleft")) +
    joystick.x;
  if (Math.abs(forward) + Math.abs(side) <= 0.01)
    return { x: position.x, z: position.z, dx: 0, dz: 0 };
  let dx = Math.cos(yaw) * side - Math.sin(yaw) * forward;
  let dz = -Math.sin(yaw) * side - Math.cos(yaw) * forward;
  const length = Math.max(1, Math.hypot(dx, dz));
  dx /= length;
  dz /= length;
  const speed = keys.has("shift") ? 5 : 3.2;
  const nextX = position.x + dx * speed * dt;
  const nextZ = position.z + dz * speed * dt;
  const x = canWalk(nextX, position.z, obstacles) ? nextX : position.x;
  const z = canWalk(x, nextZ, obstacles) ? nextZ : position.z;
  return { x, z, dx, dz };
}
