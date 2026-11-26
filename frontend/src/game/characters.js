import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const sphere = new THREE.SphereGeometry(1, 16, 12);
const detail = new THREE.SphereGeometry(1, 8, 6);
const tube = new THREE.CylinderGeometry(1, 1, 1, 12);
const skirt = new THREE.LatheGeometry(
  [
    [0, -0.16],
    [0.29, -0.16],
    [0.31, -0.125],
    [0.247, 0.02],
    [0.19, 0.15],
    [0, 0.15],
  ].map(([x, y]) => new THREE.Vector2(x, y)),
  24,
);
const smile = new THREE.TubeGeometry(
  new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.053, 0.009, 0),
    new THREE.Vector3(0, -0.034, 0.016),
    new THREE.Vector3(0.053, 0.009, 0),
  ),
  10,
  0.0068,
  5,
);
const cream = "#fff0dc";
const profiles = [
  {
    skin: "#edb490",
    hair: "#a33153",
    outfit: "#e96f93",
    trim: "#72a34d",
    eyes: "#609042",
    cut: "long",
  },
  {
    skin: "#b97556",
    hair: "#a84932",
    outfit: "#f2a342",
    trim: "#fcdb71",
    eyes: "#673c31",
    cut: "puffs",
  },
  {
    skin: "#f3c396",
    hair: "#dba645",
    outfit: "#9cbb55",
    trim: "#f4e079",
    eyes: "#67833d",
    cut: "bun",
  },
  {
    skin: "#e5ac9a",
    hair: "#654080",
    outfit: "#9b76ca",
    trim: "#d7bcf2",
    eyes: "#533b7b",
    cut: "tails",
  },
  {
    skin: "#deb49a",
    hair: "#303e61",
    outfit: "#6dadd4",
    trim: "#bde5f0",
    eyes: "#436a98",
    cut: "bob",
  },
  {
    skin: "#f2bbab",
    hair: "#8b3559",
    outfit: "#d66792",
    trim: "#f8d0e4",
    eyes: "#784061",
    cut: "long",
  },
  {
    skin: "#ecc0a9",
    hair: "#9c4776",
    outfit: "#ba79b5",
    trim: "#eac3e6",
    eyes: "#71487e",
    cut: "sweep",
  },
];

function bakeParts() {
  const parts = new Map();
  const transform = new THREE.Object3D();
  const color = new THREE.Color();

  function add(parent, geometry, hex, position, scale, rotation = [0, 0, 0]) {
    transform.position.set(...position);
    transform.scale.set(...scale);
    transform.rotation.set(...rotation);
    transform.updateMatrix();
    const piece = geometry.clone().applyMatrix4(transform.matrix);
    color.set(hex);
    const colors = new Float32Array(piece.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) color.toArray(colors, i);
    piece.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    if (!parts.has(parent)) parts.set(parent, []);
    parts.get(parent).push(piece);
  }

  function finish() {
    const material = new THREE.MeshStandardMaterial({ roughness: 0.77, vertexColors: true });
    for (const [parent, pieces] of parts) {
      const mesh = new THREE.Mesh(mergeGeometries(pieces), material);
      mesh.castShadow = true;
      parent.add(mesh);
      pieces.forEach((piece) => piece.dispose());
    }
  }
  return { add, finish };
}

export function createCharacter({ id = 0, player = false } = {}) {
  const { skin, hair, outfit, trim, eyes, cut } = profiles[player ? 0 : id] || profiles[0];
  const darker = new THREE.Color(outfit).multiplyScalar(0.65);
  const hairLight = new THREE.Color(hair).offsetHSL(0, 0.025, 0.08);
  const blush = new THREE.Color(skin).lerp(new THREE.Color("#d75c72"), 0.28);
  const { add, finish } = bakeParts();
  const root = new THREE.Group();
  const body = new THREE.Group();
  const head = new THREE.Group();
  const blinking = new THREE.Group();
  const limbs = [];
  root.add(body);
  body.add(head);
  head.add(blinking);
  head.position.y = 1.56;

  const oval = (parent, color, position, scale, rotation = [0, 0, 0]) =>
    add(parent, sphere, color, position, scale, rotation);
  const dot = (parent, color, position, scale) => add(parent, detail, color, position, scale);
  function blossom(parent, x, y, z, color, size) {
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 0.4;
      dot(
        parent,
        color,
        [x + Math.cos(a) * size, y + Math.sin(a) * size, z],
        [size * 0.64, size * 0.64, size * 0.45],
      );
    }
    dot(parent, "#ffd88b", [x, y, z + size * 0.23], [size * 0.57, size * 0.57, size * 0.36]);
  }

  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    const knee = new THREE.Group();
    const arm = new THREE.Group();
    body.add(leg, arm);
    leg.add(knee);
    leg.position.set(side * 0.13, 0.7, 0);
    knee.position.y = -0.31;
    arm.position.set(side * 0.25, 1.14, 0);
    limbs.push({ leg, knee, arm, side });

    add(leg, tube, player ? trim : cream, [0, -0.15, 0], [0.073, 0.32, 0.074]);
    add(knee, tube, player ? trim : cream, [0, -0.145, 0], [0.068, 0.29, 0.069]);
    for (let i = 0; i < (player ? 3 : 1); i++)
      add(knee, tube, player ? cream : trim, [0, -0.055 - i * 0.083, 0], [0.071, 0.031, 0.071]);
    oval(knee, darker, [0, -0.329, 0.052], [0.098, 0.055, 0.144]);
    oval(knee, outfit, [0, -0.299, 0.048], [0.091, 0.072, 0.137]);
    oval(knee, cream, [0, -0.242, 0.077], [0.087, 0.019, 0.025]);

    oval(arm, player ? outfit : trim, [0, -0.06, 0], [0.099, 0.126, 0.1]);
    oval(arm, cream, [0, -0.137, 0], [0.078, 0.035, 0.077]);
    oval(arm, skin, [0, -0.243, 0.015], [0.052, 0.13, 0.055], [0.09, 0, 0]);
    oval(arm, skin, [0, -0.348, 0.029], [0.062, 0.07, 0.052]);
    dot(arm, skin, [-side * 0.044, -0.33, 0.054], [0.025, 0.04, 0.028]);
  }

  oval(body, player ? outfit : cream, [0, 1.058, 0], [0.227, 0.259, 0.162]);
  add(body, skirt, outfit, [0, 0.815, 0], [1.03, 1.06, 0.77]);
  oval(body, darker, [0, 0.66, 0], [0.3, 0.027, 0.222]);
  add(body, tube, trim, [0, 0.978, 0], [0.21, 0.065, 0.163]);
  const insert = player || id === 1;
  if (insert) {
    oval(body, cream, [0, 1.072, 0.151], [0.122, 0.165, 0.038]);
    blossom(body, 0, 1.095, 0.183, player ? "#ed8ab2" : "#f8bd60", 0.021);
  } else {
    oval(body, outfit, [0, 1.085, 0.097], [0.178, 0.205, 0.093]);
    for (let i = 0; i < 3; i++)
      dot(body, cream, [0, 1.19 - i * 0.071, 0.188], [0.018, 0.018, 0.012]);
  }

  for (let i = 0; i < 12; i++) {
    const angle = i * 2.39996;
    const bottom = i % 2;
    const radius = bottom ? 0.279 : 0.234;
    dot(
      body,
      player ? "#ffd8df" : trim,
      [Math.sin(angle) * radius, bottom ? 0.71 : 0.81, Math.cos(angle) * radius * 0.78],
      [0.025, 0.023, 0.024],
    );
  }
  oval(body, darker, [0, 0.999, -0.173], [0.09, 0.05, 0.052]);
  for (const side of [-1, 1])
    oval(body, trim, [side * 0.1, 1.003, -0.178], [0.092, 0.055, 0.039], [0, 0, side * 0.33]);

  oval(body, skin, [0, 1.304, 0.008], [0.082, 0.115, 0.082]);
  oval(head, hair, [0, 0.052, -0.064], [0.292, 0.303, 0.253]);
  oval(head, skin, [0, -0.007, 0.064], [0.255, 0.259, 0.221]);
  oval(head, skin, [0, -0.108, 0.104], [0.218, 0.164, 0.176]);
  for (const side of [-1, 1]) {
    oval(head, skin, [side * 0.245, -0.051, 0.041], [0.048, 0.068, 0.039]);
    oval(head, blush, [side * 0.252, -0.055, 0.073], [0.023, 0.037, 0.011]);
    oval(
      head,
      blush,
      [side * 0.158, -0.085, 0.245],
      [0.045, 0.023, 0.009],
      [0, side * 0.45, side * 0.1],
    );
    oval(head, hair, [side * 0.106, 0.131, 0.265], [0.045, 0.01, 0.01], [0, 0, side * -0.16]);
    oval(blinking, "#fff9f2", [side * 0.105, 0.051, 0.268], [0.05, 0.055, 0.026]);
    oval(blinking, eyes, [side * 0.102, 0.047, 0.29], [0.031, 0.041, 0.012]);
    oval(blinking, "#302536", [side * 0.102, 0.047, 0.3], [0.016, 0.026, 0.006]);
    dot(blinking, "#ffffff", [side * 0.102 - 0.01, 0.067, 0.305], [0.01, 0.012, 0.004]);
    dot(blinking, "#fff0dd", [side * 0.102 + 0.011, 0.033, 0.304], [0.004, 0.005, 0.003]);
  }
  oval(head, skin, [0, -0.027, 0.278], [0.035, 0.034, 0.031]);
  add(head, smile, "#a74759", [0, -0.123, 0.279], [1, 1, 1]);

  // Sculpted locks follow the silhouette, with different styles for each friend.
  oval(head, hair, [-0.092, 0.202, 0.167], [0.18, 0.11, 0.111], [0, 0, 0.24]);
  oval(head, hairLight, [0.09, 0.206, 0.159], [0.181, 0.1, 0.104], [0, 0, -0.32]);
  oval(head, hair, [0.169, 0.151, 0.158], [0.093, 0.11, 0.103], [0, 0, 0.56]);
  for (const side of [-1, 1]) {
    oval(head, hair, [side * 0.235, 0.043, 0.014], [0.07, 0.175, 0.115], [0, 0, -side * 0.11]);
    if (cut === "bob" || cut === "sweep") {
      oval(
        head,
        side === 1 ? hairLight : hair,
        [side * 0.208, -0.133, -0.056],
        [0.105, 0.168, 0.145],
        [0.14, 0, side * 0.27],
      );
    }
    if (cut === "long" || cut === "tails") {
      const separation = cut === "tails" ? 0.21 : 0.124;
      oval(
        head,
        hair,
        [side * separation, -0.233, -0.149],
        [0.137, 0.321, 0.128],
        [-0.16, 0, side * 0.1],
      );
      oval(
        head,
        hairLight,
        [side * (separation + 0.042), -0.36, -0.134],
        [0.098, 0.177, 0.091],
        [0.1, 0, -side * 0.28],
      );
      if (cut === "tails") oval(head, trim, [side * 0.245, -0.107, -0.091], [0.082, 0.032, 0.094]);
    }
    if (cut === "puffs") {
      for (let n = 0; n < 4; n++) {
        const angle = n * 1.57;
        oval(
          head,
          n % 2 ? hair : hairLight,
          [side * (0.263 + Math.cos(angle) * 0.054), -0.064 + Math.sin(angle) * 0.081, -0.124],
          [0.107, 0.112, 0.119],
        );
      }
    }
  }
  if (cut === "bun") {
    oval(head, hairLight, [0.078, 0.273, -0.196], [0.159, 0.148, 0.145]);
    oval(head, hair, [-0.024, 0.218, -0.23], [0.151, 0.117, 0.135]);
  }

  if (player) {
    oval(head, "#74a04d", [0, 0.232, 0.012], [0.356, 0.058, 0.353]);
    oval(head, "#e46e91", [0, 0.281, -0.018], [0.341, 0.213, 0.329]);
    for (let i = 0; i < 22; i++) {
      const a = i * 2.39996;
      const y = 0.21 + (i / 22) * 0.72;
      const r = Math.sqrt(1 - y * y);
      add(
        head,
        detail,
        "#ffe5a9",
        [Math.cos(a) * r * 0.343, 0.281 + y * 0.214, Math.sin(a) * r * 0.332 - 0.018],
        [0.013, 0.021, 0.009],
        [0, Math.PI / 2 - a, Math.sin(a) * 0.32],
      );
    }
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 0.4;
      oval(
        head,
        i % 2 ? "#92b35a" : "#789b46",
        [Math.sin(a) * 0.081, 0.476, Math.cos(a) * 0.084 - 0.018],
        [0.044, 0.022, 0.102],
        [0.24, a, 0],
      );
    }
    blossom(head, -0.246, 0.231, 0.213, "#f59fbd", 0.033);
  } else {
    const accessoryX = id % 2 ? -0.214 : 0.218;
    const accessoryY = cut === "bun" ? 0.229 : 0.171;
    for (const side of [-1, 1])
      oval(
        head,
        trim,
        [accessoryX + side * 0.051, accessoryY, 0.172],
        [0.057, 0.039, 0.025],
        [0, 0, side * 0.37],
      );
    blossom(head, accessoryX, accessoryY, 0.192, id === 1 ? "#fff0aa" : trim, 0.024);
  }

  finish();
  root.userData.markerHeight = player ? 2.29 : 2.08;
  root.userData.animate = (time, speed = 0, wave = false) => {
    const stride = Math.sin(time * 9.2) * Math.min(speed / 3.2, 1);
    for (const { leg, knee, arm, side } of limbs) {
      leg.rotation.x = stride * side * 0.57;
      knee.rotation.x = Math.max(0, -stride * side) * 0.73;
      arm.rotation.x = -stride * side * 0.43;
      arm.rotation.z = side * 0.16;
      if (wave && side === -1) {
        arm.rotation.z = -2.23 + Math.sin(time * 5.2) * 0.12;
        arm.rotation.x = -0.34 + Math.sin(time * 4) * 0.18;
      }
    }
    body.position.y = speed > 0.12 ? Math.abs(stride) * 0.037 : Math.sin(time * 2.1) * 0.008;
    body.rotation.z = stride * 0.025;
    head.rotation.z = speed > 0.12 ? -stride * 0.038 : Math.sin(time * 1.1) * 0.022;
    const blinkPhase = (time + id * 0.37) % 4.6;
    blinking.scale.y = blinkPhase < 0.19 ? 1 - Math.sin((blinkPhase / 0.19) * Math.PI) * 0.88 : 1;
    blinking.position.y = 0.05 * (1 - blinking.scale.y);
  };
  return root;
}
