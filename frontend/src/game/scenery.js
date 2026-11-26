import * as THREE from "three";
import {
  BRIDGES,
  HOUSES,
  FRIENDS,
  PATHS,
  SPAWN,
  bridgeHeight,
  onPath,
  seededRandom,
  canWalk,
} from "./world";
import { buildVillage } from "./village";

function paintedTexture(kind, seed = 1) {
  const random = seededRandom(seed),
    canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = {
    grass: "#97b862",
    path: "#ddd0ae",
    wood: "#997356",
    water: "#65ada6",
  }[kind];
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 12000; i++) {
    const x = random() * 512,
      y = random() * 512,
      light = random() > 0.5;
    ctx.fillStyle = light
      ? `rgba(245,232,189,${random() * 0.17})`
      : `rgba(25,40,25,${random() * 0.16})`;
    const w = kind === "wood" ? 0.6 : kind === "water" ? 8 + random() * 32 : 1 + random() * 3;
    ctx.fillRect(x, y, w, kind === "wood" ? 10 + random() * 100 : 1 + random() * 3);
  }
  if (kind === "water") {
    for (let i = 0; i < 73; i++) {
      const x = random() * 512;
      const y = random() * 512;
      const length = 12 + random() * 48;
      ctx.beginPath();
      ctx.ellipse(x, y, length, 0.7 + random() * 1.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 ? "#d0f6dd45" : "#f1ffeb80";
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    kind === "grass" ? 12 : kind === "water" ? 2 : 1,
    kind === "grass" ? 12 : kind === "water" ? 18 : 1,
  );
  texture.anisotropy = 4;
  return texture;
}

export function buildScenery(scene, mobile = false) {
  const random = seededRandom(93),
    obstacles = [],
    animated = [],
    disposables = [];
  const textures = Object.fromEntries(
    ["grass", "path", "wood", "water"].map((kind, i) => [kind, paintedTexture(kind, i + 2)]),
  );
  disposables.push(...Object.values(textures));
  const mat = (color, roughness = 0.9, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const wood = mat("#e8b58e", 0.92, {
    map: textures.wood,
    bumpMap: textures.wood,
    bumpScale: 0.028,
  });
  const bark = mat("#b68b69", 1, { map: textures.wood, bumpMap: textures.wood, bumpScale: 0.05 });
  const stone = mat("#d2c6ad");
  const mesh = (geometry, material, x, y, z, parent = scene) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const box = (w, h, d, material, x, y, z, parent) =>
    mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z, parent);
  const sphere = new THREE.SphereGeometry(1, 10, 7);
  const dummy = new THREE.Object3D();
  function instance(geometry, material, items, shadow = true) {
    const object = new THREE.InstancedMesh(geometry, material, items.length);
    items.forEach((item, i) => {
      dummy.position.set(item.x, item.y, item.z);
      dummy.rotation.set(item.rx || 0, item.ry || 0, item.rz || 0);
      dummy.scale.set(...(item.scale || [1, 1, 1]));
      dummy.updateMatrix();
      object.setMatrixAt(i, dummy.matrix);
      if (item.color) object.setColorAt(i, new THREE.Color(item.color));
    });
    object.castShadow = shadow;
    object.receiveShadow = true;
    scene.add(object);
    return object;
  }

  const ground = mesh(
    new THREE.PlaneGeometry(160, 160),
    mat("#ebf3d0", 1, { map: textures.grass, bumpMap: textures.grass, bumpScale: 0.015 }),
    0,
    -0.035,
    0,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  const pathMaterial = mat("#fff1d1", 1, {
    map: textures.path,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });
  const pathPebbles = [];
  for (const path of PATHS) {
    const curve = new THREE.CatmullRomCurve3(path.map(([x, z]) => new THREE.Vector3(x, 0.008, z)));
    const steps = Math.ceil(curve.getLength() * 3);
    const vertices = [],
      colors = [],
      uvs = [],
      indices = [];
    const glare = [0, 0.94, 1, 0.94, 0];
    const columns = [-1, -0.79, 0, 0.79, 1];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const width = 1.65 + Math.sin(i * 0.18) * 0.15;
      for (let c = 0; c < 5; c++) {
        const offset = width * columns[c];
        vertices.push(p.x + tangent.z * offset, p.y, p.z - tangent.x * offset);
        uvs.push(c / 4, i / 18);
        colors.push(1, 1, 1, glare[c] * Math.min(1, i / 3, (steps - i) / 3));
        if (c < 4 && i < steps) {
          const j = i * 5 + c;
          indices.push(j, j + 5, j + 1, j + 1, j + 5, j + 6);
        }
      }
      if (i % 3 || !canWalk(p.x, p.z, [], 0.2) || Math.abs(p.x - 10) < 3.2) continue;
      const side = i % 2 ? -1 : 1;
      const size = 0.1 + random() * 0.18;
      pathPebbles.push({
        x: p.x + tangent.z * width * side * 0.76,
        y: 0.015,
        z: p.z - tangent.x * width * side * 0.76,
        ry: random() * 6.3,
        scale: [size * 1.4, size * 0.23, size],
        color: i % 2 ? "#e7caa8" : "#caae8d",
      });
    }
    const ribbon = new THREE.BufferGeometry();
    ribbon.setIndex(indices);
    ribbon.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    ribbon.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
    ribbon.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    ribbon.computeVertexNormals();
    const trail = mesh(ribbon, pathMaterial, 0, 0, 0);
    trail.castShadow = false;
  }
  instance(new THREE.IcosahedronGeometry(1, 1), mat("#ffffff"), pathPebbles, false);
  const plaza = mesh(
    new THREE.CircleGeometry(4.9, 40),
    mat("#ffdfb6", 1, { map: textures.path }),
    0,
    0.013,
    0,
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.castShadow = false;

  const waterMaterial = mat("#9ce8df", 0.29, {
    map: textures.water,
    emissive: "#266b76",
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.96,
  });
  const water = mesh(new THREE.PlaneGeometry(4.8, 76, 1, 32), waterMaterial, 10, 0.022, 0);
  water.rotation.x = -Math.PI / 2;
  water.castShadow = false;
  animated.push((time) => {
    textures.water.offset.x = Math.sin(time * 0.08) * 0.025;
    textures.water.offset.y = time * 0.012;
  });
  const rail = mat("#bf8266");
  const cap = mat("#eed4a1");
  const lightPlank = mat("#ecd2a3", 0.91, { map: textures.wood });
  for (const z of BRIDGES) {
    for (let i = 0; i < 14; i++) {
      const x = 6.76 + i * 0.495;
      box(0.478, 0.14, 3.76, i % 3 ? wood : lightPlank, x, bridgeHeight(x, z) - 0.07, z);
    }
    for (const side of [-1, 1]) {
      const edge = z + side * 1.78;
      for (const height of [0.43, 0.89]) {
        const points = Array.from({ length: 9 }, (_, i) => {
          const x = 6.75 + i * 0.81;
          return new THREE.Vector3(x, bridgeHeight(x, z) + height, edge);
        });
        const curve = new THREE.CatmullRomCurve3(points);
        mesh(new THREE.TubeGeometry(curve, 24, height > 0.8 ? 0.074 : 0.047, 8), rail, 0, 0, 0);
      }
      for (let i = 0; i < 5; i++) {
        const x = 6.82 + i * 1.59;
        const deck = bridgeHeight(x, z);
        box(0.18, 1.02, 0.18, rail, x, deck + 0.48, edge);
        const top = mesh(sphere, cap, x, deck + 1.01, edge);
        top.scale.set(0.126, 0.087, 0.126);
      }
    }
  }
  const bankRocks = [],
    lilyPads = [],
    lilyPetals = [];
  for (let i = 0; i < 150; i++) {
    const z = random() * 70 - 35;
    if (Math.abs(z + 12) < 2 || Math.abs(z - 10) < 2) continue;
    const size = 0.15 + random() * 0.45;
    bankRocks.push({
      x: (i % 2 ? 7.5 : 12.5) + (random() - 0.5) * 0.6,
      z,
      y: 0.04,
      scale: [size * 1.4, size * 0.6, size],
      ry: random() * 6,
      color: new THREE.Color().setHSL(0.11, 0.17, 0.62 + random() * 0.2),
    });
    if (i % 7 === 0) {
      const x = 10 + (random() - 0.5) * 3;
      lilyPads.push({ x, y: 0.034, z, ry: z, scale: [0.26, 0.02, 0.24] });
      if (i % 2)
        for (let p = 0; p < 5; p++) {
          const a = p * 1.2566;
          lilyPetals.push({
            x: x + Math.cos(a) * 0.071,
            y: 0.07,
            z: z + Math.sin(a) * 0.071,
            ry: -a,
            scale: [0.085, 0.038, 0.047],
          });
        }
    }
  }
  instance(new THREE.IcosahedronGeometry(1, 1), stone, bankRocks);
  instance(sphere, mat("#65a654"), lilyPads, false);
  instance(sphere, mat("#f6bee0"), lilyPetals, false);

  disposables.push(...buildVillage(scene, HOUSES, { mesh, mat, instance, stone, wood }));

  // Overlapping crowns keep the grove full and keep the number of draws low.
  const trunks = [],
    leaves = [],
    apples = [];
  for (let i = 0; i < 76; i++) {
    let x = random() * 80 - 40,
      z = random() * 80 - 40;
    if (
      onPath(x, z, 3.2) ||
      !canWalk(x, z, [], 1.2) ||
      FRIENDS.some((n) => Math.hypot(x - n.x, z - n.z) < 3.8) ||
      Math.hypot(x - SPAWN.x, z - SPAWN.z) < 4
    )
      continue;
    const h = 3.8 + random() * 3.0,
      s = 0.8 + random() * 0.5;
    obstacles.push({ x, z, radius: 0.48 });
    trunks.push({ x, z, y: h * 0.32, scale: [0.36 * s, h * 0.64, 0.36 * s] });
    for (let branch = 0; branch < 4; branch++) {
      const a = branch * 1.65 + random();
      trunks.push({
        x: x + Math.sin(a) * 0.7,
        z: z + Math.cos(a) * 0.7,
        y: h * 0.52,
        scale: [0.145 * s, h * 0.36, 0.145 * s],
        rx: Math.cos(a) * 0.75,
        rz: -Math.sin(a) * 0.75,
      });
    }
    for (let j = 0; j < 9; j++) {
      const a = random() * Math.PI * 2,
        r = random() * 1.8 * s;
      const lx = x + Math.sin(a) * r,
        lz = z + Math.cos(a) * r,
        ly = h - Math.pow(r / s, 2) * 0.46 + random() * 0.7;
      leaves.push({
        x: lx,
        z: lz,
        y: ly,
        scale: [
          (1.04 + random() * 0.55) * s,
          (0.83 + random() * 0.53) * s,
          (1.04 + random() * 0.55) * s,
        ],
        ry: a,
        color: new THREE.Color().setHSL(
          0.23 + random() * 0.075,
          0.3 + random() * 0.24,
          0.27 + random() * 0.17,
        ),
      });
      if (i % 3 === 0 && j % 3 === 0)
        apples.push({ x: lx, z: lz + 0.83, y: ly - 0.72, scale: [0.17, 0.21, 0.17] });
    }
  }
  instance(new THREE.CylinderGeometry(0.62, 1, 1, 10), bark, trunks);
  instance(new THREE.SphereGeometry(1, 15, 11), mat("#ffffff", 0.91), leaves);
  instance(new THREE.SphereGeometry(1, 10, 7), mat("#db6671", 0.63), apples);

  const blades = [],
    petals = [],
    stems = [],
    centers = [];
  for (let i = 0; i < (mobile ? 2800 : 5500); i++) {
    const x = random() * 76 - 38,
      z = random() * 76 - 38;
    if (onPath(x, z, 1.55) || !canWalk(x, z, obstacles, 0.15)) continue;
    const h = 0.11 + random() * 0.19;
    blades.push({
      x,
      z,
      y: 0.02,
      scale: [0.07 + random() * 0.1, h, 0.15],
      ry: random() * 6.3,
      color: new THREE.Color().setHSL(0.24 + random() * 0.08, 0.38, 0.26 + random() * 0.14),
    });
    if (i % 11 === 0) {
      const fh = 0.22 + random() * 0.2;
      stems.push({ x, z, y: fh / 2, scale: [0.012, fh, 0.012] });
      const color = ["#fff3cf", "#ee89b0", "#c9bbeb", "#f3c865"][i % 4];
      centers.push({ x, z, y: fh + 0.01, scale: [0.045, 0.028, 0.045] });
      for (let p = 0; p < 5; p++)
        petals.push({
          x: x + Math.sin(p * 1.26) * 0.07,
          z: z + Math.cos(p * 1.26) * 0.07,
          y: fh,
          scale: [0.065, 0.018, 0.045],
          ry: -p * 1.26,
          color,
        });
    }
  }
  const bladeGeometry = new THREE.BufferGeometry();
  bladeGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.18, 0, 0, 0.2, 0, 0, 0.22, 0.62, 0.08, -0.18, 0, 0, 0.22, 0.62, 0.08, -0.05, 0.62, 0.08,
        -0.05, 0.62, 0.08, 0.22, 0.62, 0.08, 0.53, 1, 0.38,
      ],
      3,
    ),
  );
  bladeGeometry.computeVertexNormals();
  instance(bladeGeometry, mat("#ffffff", 1, { side: THREE.DoubleSide }), blades, false);
  instance(new THREE.CylinderGeometry(1, 1, 1, 5), mat("#637749"), stems, false);
  instance(sphere, mat("#ffffff"), petals, false);
  instance(sphere, mat("#b89a47"), centers, false);

  // Vegetable beds, a well, benches and fences make the village feel inhabited.
  for (let bed = 0; bed < 3; bed++) {
    const x = -25 + bed * 2.2,
      z = -7;
    box(1.7, 0.15, 4, mat("#6c5840"), x, 0.06, z);
    for (const side of [-1, 1]) box(0.1, 0.22, 4.2, wood, x + side * 0.9, 0.12, z);
    for (let n = 0; n < 6; n++) {
      const cabbage = mesh(sphere, mat(n % 2 ? "#78905a" : "#688455"), x, 0.24, z - 1.6 + n * 0.62);
      cabbage.scale.set(0.26, 0.18, 0.25);
    }
  }
  for (const [x, z, rotation] of [
    [-6, -1, 0],
    [16, -20, 0.6],
    [24, 5, -0.4],
  ]) {
    const bench = new THREE.Group();
    bench.position.set(x, 0, z);
    bench.rotation.y = rotation;
    scene.add(bench);
    for (let i = 0; i < 3; i++) box(2, 0.1, 0.17, wood, 0, 0.55, i * 0.2, bench);
    box(2, 0.5, 0.12, wood, 0, 1, 0.47, bench);
    for (const side of [-1, 1]) box(0.12, 0.65, 0.55, wood, side * 0.75, 0.3, 0.2, bench);
    obstacles.push({ x, z, radius: 1 });
  }
  const well = new THREE.Group();
  well.position.set(2, 0, 1);
  scene.add(well);
  const rim = mat("#e4bda3");
  const bricks = [];
  for (let course = 0; course < 3; course++)
    for (let i = 0; i < 11; i++) {
      const a = ((i + (course % 2) * 0.5) / 11) * Math.PI * 2;
      bricks.push({
        x: 2 + Math.sin(a) * 0.82,
        y: 0.14 + course * 0.24,
        z: 1 + Math.cos(a) * 0.82,
        ry: a,
        scale: [0.28, 0.16, 0.21],
        color: ["#dac2a8", "#eee0bb", "#d7a89e"][(course + i) % 3],
      });
    }
  instance(new THREE.IcosahedronGeometry(1, 1), mat("#ffffff"), bricks);
  const wellRim = mesh(new THREE.TorusGeometry(0.82, 0.13, 8, 32), rim, 0, 0.74, 0, well);
  wellRim.rotation.x = -Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.02, 24), mat("#4b8f91", 0.35), 0, 0.32, 0, well);
  for (const side of [-1, 1]) {
    box(0.15, 2.23, 0.15, wood, side * 0.88, 1.12, 0, well);
    const roofSlat = box(2.23, 0.14, 0.98, mat("#c56886"), 0, 2.21, side * 0.42, well);
    roofSlat.rotation.x = side * 0.43;
  }
  box(2.3, 0.16, 0.13, rim, 0, 2.43, 0, well);
  box(1.87, 0.1, 0.1, wood, 0, 1.79, -0.05, well);
  box(0.026, 0.7, 0.026, rim, 0, 1.42, -0.05, well);
  mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.24, 10), wood, 0, 0.96, -0.05, well);
  obstacles.push({ x: 2, z: 1, radius: 1.1 });
  for (let i = 0; i < 15; i++) {
    const x = -30 + i * 1.7,
      z = 22;
    box(0.1, 1, 0.1, wood, x, 0.5, z);
    if (i < 14) {
      box(1.7, 0.1, 0.08, wood, x + 0.85, 0.78, z);
      box(1.7, 0.1, 0.08, wood, x + 0.85, 0.38, z);
    }
  }

  const hills = [],
    clouds = [];
  for (let i = 0; i < 25; i++) {
    const a = (i / 25) * Math.PI * 2;
    const r = 60 + random() * 25;
    const h = 4.5 + random() * 8;
    hills.push({
      x: Math.sin(a) * r,
      y: -h * 0.45,
      z: Math.cos(a) * r,
      ry: a,
      scale: [12 + random() * 8, h, 11 + random() * 7],
      color: ["#81a995", "#9baeca", "#8bae83"][i % 3],
    });
    if (i % 3) continue;
    const altitude = 11 + random() * 13;
    for (let j = 0; j < 5; j++) {
      clouds.push({
        x: Math.sin(a) * 77 + (j - 2) * 3.2,
        y: altitude - Math.abs(j - 2) * 0.33,
        z: Math.cos(a) * 77 + Math.sin(j) * 1.3,
        scale: [3.5 + random() * 2.2, 1.2 + random() * 0.6, 2.4 + random() * 0.8],
      });
    }
  }
  const backdrop = new THREE.SphereGeometry(1, 16, 10);
  instance(backdrop, mat("#ffffff"), hills, false).receiveShadow = false;
  const cloudShape = backdrop.clone();
  const cloudPositions = cloudShape.attributes.position;
  const cloudColors = new Float32Array(cloudPositions.count * 3);
  const lavender = new THREE.Color("#d1daec");
  const ivory = new THREE.Color("#fff8ee");
  const tint = new THREE.Color();
  for (let i = 0; i < cloudPositions.count; i++)
    tint
      .copy(lavender)
      .lerp(ivory, (cloudPositions.getY(i) + 1) / 2)
      .toArray(cloudColors, i * 3);
  cloudShape.setAttribute("color", new THREE.BufferAttribute(cloudColors, 3));
  const cloudsMesh = instance(
    cloudShape,
    new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, toneMapped: false }),
    clouds,
    false,
  );
  cloudsMesh.receiveShadow = false;
  animated.push((time) => {
    cloudsMesh.position.x = Math.sin(time * 0.038) * 6;
  });
  // Small butterflies follow loops above the flowers.
  for (let i = 0; i < 7; i++) {
    const butterfly = new THREE.Group(),
      wingMat = mat(i % 2 ? "#f5ad64" : "#ef93c1", 0.8, { side: THREE.DoubleSide });
    const wings = [-1, 1].map((side) => {
      const wing = mesh(new THREE.CircleGeometry(0.14, 10), wingMat, side * 0.085, 0, 0, butterfly);
      wing.scale.set(0.85, 1.25, 1);
      wing.castShadow = false;
      wing.rotation.x = -Math.PI / 2;
      return wing;
    });
    scene.add(butterfly);
    animated.push((time) => {
      butterfly.position.set(
        Math.sin(time * 0.13 + i) * 9 - 4,
        1.4 + Math.sin(time * 0.8 + i) * 0.3,
        Math.cos(time * 0.18 + i) * 9 + 3,
      );
      wings.forEach((wing, n) => {
        wing.rotation.y = Math.sin(time * 17) * (n ? 1 : -1);
      });
    });
  }
  const festival = new THREE.Group();
  festival.position.set(19, 0, 8);
  festival.visible = false;
  scene.add(festival);
  const peachWood = mat("#bb815f");
  const goldLight = mat("#ffe0a5", 0.66, { emissive: "#fbb980", emissiveIntensity: 0.29 });
  const flagColors = ["#ed859e", "#f7c96b", "#a9c978", "#c69ede"].map((color) =>
    mat(color, 0.83, { side: THREE.DoubleSide }),
  );
  const flagShape = new THREE.Shape();
  flagShape.moveTo(-0.22, 0);
  flagShape.lineTo(0.22, 0);
  flagShape.lineTo(0, -0.42);
  flagShape.closePath();
  const flagGeometry = new THREE.ShapeGeometry(flagShape);
  const flags = [];
  for (const z of [-2.1, 2.2]) {
    for (const x of [-3.4, 3.4]) {
      box(0.11, 3.37, 0.11, peachWood, x, 1.685, z, festival);
      const lantern = mesh(sphere, goldLight, x, 3.36, z, festival);
      lantern.scale.set(0.16, 0.21, 0.16);
    }
    const line = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-3.4, 3.27, z),
      new THREE.Vector3(0, 2.45, z),
      new THREE.Vector3(3.4, 3.27, z),
    );
    mesh(new THREE.TubeGeometry(line, 16, 0.024, 6), peachWood, 0, 0, 0, festival);
    for (let i = 0; i < 10; i++) {
      const point = line.getPoint((i + 0.5) / 10);
      const flag = mesh(flagGeometry, flagColors[i % 4], point.x, point.y, point.z, festival);
      flag.castShadow = false;
      flags.push(flag);
    }
  }
  animated.push((time) => {
    if (festival.visible)
      flags.forEach((flag, i) => {
        flag.rotation.x = Math.sin(time * 2.5 + i * 0.75) * 0.31;
      });
  });
  return {
    obstacles,
    animate: (time) => animated.forEach((fn) => fn(time)),
    setFestival: (value) => {
      festival.visible = value;
    },
    textures: disposables,
  };
}
