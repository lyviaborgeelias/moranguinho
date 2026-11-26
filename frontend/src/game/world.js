export const WORLD_LIMIT = 34;
export const SPAWN = { x: 0, z: 14 };
export const BRIDGES = [-12, 10];

export function bridgeHeight(x, z) {
  if (x < 6.7 || x > 13.3 || !BRIDGES.some((crossing) => Math.abs(z - crossing) < 1.9)) return 0;
  const span = (x - 6.7) / 6.6;
  return 0.17 + Math.sin(span * Math.PI) * 0.18;
}

export const FRIENDS = [
  {
    id: 1,
    name: "Laranjinha",
    x: -2,
    z: 7,
    color: "#d68a35",
    region: "Jardim da casa",
    greeting:
      "Moranguinho! Ainda bem que você chegou. O livro de receitas desapareceu e eu encontrei uma cesta com um bilhete. Me ajuda a entender a pista?",
  },
  {
    id: 2,
    name: "Liminha",
    x: -16,
    z: 1,
    color: "#a7ae4f",
    region: "Horta de Liminha",
    greeting:
      "Oi, amiga! Achei uma pista entre os canteiros. Ela fala de duas aventuras da Gotinha de Limão. Você lembra como aconteceram?",
  },
  {
    id: 3,
    name: "Uvinha",
    x: -18,
    z: -16,
    color: "#9677b6",
    region: "Pomar das amigas",
    greeting:
      "Você encontrou meu pomar! Vi um bilhete preso a uma das árvores. Vamos usar o que sabemos para seguir as pistas?",
  },
  {
    id: 4,
    name: "Amora",
    x: 0,
    z: -24,
    color: "#7296af",
    region: "Bosque de Amora",
    greeting:
      "O bosque está tão tranquilo hoje… Escute os passarinhos! Tenho duas perguntas que vão ajudar a descobrir o caminho do livro.",
  },
  {
    id: 5,
    name: "Cerejinha",
    x: 20,
    z: -14,
    color: "#b65e67",
    region: "Jardim da ponte",
    greeting:
      "Moranguinho! Atravessei a ponte e achei outra pista. Parece que alguém está preparando uma coisa muito especial para nós.",
  },
  {
    id: 6,
    name: "Framboesa",
    x: 19,
    z: 8,
    color: "#ba7793",
    region: "Clareira da amizade",
    greeting:
      "Você chegou à nossa clareira! Falta só descobrir a última mensagem. Pense em tudo o que você viveu com as amigas até aqui.",
  },
];

export const HOUSES = [
  { x: -8, z: 11, w: 6, d: 5, color: "#ffe7ca", roof: "#d95a7b", name: "Café Tutti-Frutti" },
  { x: -23, z: 2, w: 5, d: 5, color: "#fff0ba", roof: "#83ac5d", name: "Horta de Liminha" },
  { x: 24, z: 14, w: 5, d: 5, color: "#f5d8e6", roof: "#a57ac2", name: "Casa das amigas" },
];
export const PATHS = [
  [
    [0, 19],
    [0, 7],
    [-2, 2],
    [-16, 1],
    [-18, -16],
    [-8, -24],
    [0, -24],
    [4, -16],
    [10, -12],
    [20, -14],
    [21, -2],
    [19, 8],
    [10, 10],
    [0, 14],
  ],
  [
    [-2, 2],
    [0, 0],
    [4, -16],
  ],
];

export function seededRandom(seed = 47) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}

export function segmentDistance(x, z, a, b) {
  const dx = b[0] - a[0],
    dz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
}
export function onPath(x, z, margin = 2) {
  if (Math.hypot(x, z) < 5) return true;
  return PATHS.some((path) =>
    path.some((point, i) => i && segmentDistance(x, z, path[i - 1], point) < margin),
  );
}

export function canWalk(x, z, obstacles = [], radius = 0.38) {
  if (Math.abs(x) > WORLD_LIMIT || Math.abs(z) > WORLD_LIMIT) return false;
  if (
    x > 7.6 - radius &&
    x < 12.4 + radius &&
    !BRIDGES.some((crossing) => Math.abs(z - crossing) < 2 - radius)
  )
    return false;
  for (const house of HOUSES) {
    if (
      Math.abs(x - house.x) < house.w / 2 + radius + 0.25 &&
      Math.abs(z - house.z) < house.d / 2 + radius + 0.25
    )
      return false;
  }
  for (const item of obstacles) {
    if (Math.hypot(x - item.x, z - item.z) < item.radius + radius) return false;
  }
  return true;
}

// A* uses the same collision function as manual movement, including both bridges.
export function findPath(start, goal, obstacles = []) {
  const key = (x, z) => `${x},${z}`;
  const sx = Math.round(start.x),
    sz = Math.round(start.z),
    gx = Math.round(goal.x),
    gz = Math.round(goal.z);
  if (!canWalk(gx, gz, obstacles)) return [];
  const first = { x: sx, z: sz, g: 0, f: Math.hypot(gx - sx, gz - sz), parent: null };
  const open = [first],
    best = new Map([[key(sx, sz), first]]),
    closed = new Set();
  for (let limit = 0; open.length && limit < 6000; limit++) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift(),
      currentKey = key(current.x, current.z);
    if (closed.has(currentKey)) continue;
    if (current.x === gx && current.z === gz) {
      const route = [];
      for (let node = current; node?.parent; node = node.parent)
        route.unshift({ x: node.x, z: node.z });
      return route;
    }
    closed.add(currentKey);
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]) {
      const x = current.x + dx,
        z = current.z + dz;
      if (!canWalk(x, z, obstacles) || closed.has(key(x, z))) continue;
      if (
        dx &&
        dz &&
        (!canWalk(current.x + dx, current.z, obstacles) ||
          !canWalk(current.x, current.z + dz, obstacles))
      )
        continue;
      const g = current.g + Math.hypot(dx, dz);
      if (best.has(key(x, z)) && best.get(key(x, z)).g <= g) continue;
      const node = { x, z, g, f: g + Math.hypot(gx - x, gz - z), parent: current };
      best.set(key(x, z), node);
      open.push(node);
    }
  }
  return [];
}
