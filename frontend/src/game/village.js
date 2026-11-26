import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { seededRandom } from "./world";

const TAU = Math.PI * 2;

export function buildVillage(scene, houses, { mesh, mat, instance, stone, wood }) {
  const random = seededRandom(191);
  const sphere = new THREE.SphereGeometry(1, 16, 10);
  const seedShape = new THREE.SphereGeometry(1, 8, 6);
  const cream = mat("#ffe1aa");
  const green = mat("#699340");
  const darkGreen = mat("#416d46");
  const frame = mat("#8e534d");
  const glass = mat("#8acada", 0.28, { emissive: "#24495a", emissiveIntensity: 0.25 });
  const windowGlint = mat("#c7f0e8", 0.35);
  const textures = [];
  const berryForm = new THREE.LatheGeometry(
    [
      [0, -1],
      [0.27, -0.91],
      [0.54, -0.69],
      [0.8, -0.36],
      [0.97, 0.06],
      [0.99, 0.36],
      [0.84, 0.62],
      [0.56, 0.73],
      [0.24, 0.64],
      [0, 0.59],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    24,
  );
  const oval = (parent, material, x, y, z, sx, sy, sz) => {
    const part = mesh(sphere, material, x, y, z, parent);
    part.scale.set(sx, sy, sz);
    return part;
  };
  const rounded = (parent, material, x, y, z, w, h, d, radius) =>
    mesh(new RoundedBoxGeometry(w, h, d, 2, radius), material, x, y, z, parent);

  function arch(parent, material, x, y, z, width, height, depth) {
    const r = width / 2;
    const outline = new THREE.Shape();
    outline.moveTo(-r, 0);
    outline.lineTo(r, 0);
    outline.lineTo(r, height - r);
    outline.absarc(0, height - r, r, 0, Math.PI);
    outline.closePath();
    return mesh(
      new THREE.ExtrudeGeometry(outline, {
        depth,
        steps: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        curveSegments: 12,
      }),
      material,
      x,
      y,
      z,
      parent,
    );
  }

  function sign(parent, label, y, z) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 168;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff1cd";
    ctx.fillRect(0, 0, 640, 168);
    ctx.strokeStyle = "#ca7d79";
    ctx.lineWidth = 5;
    ctx.strokeRect(12, 12, 616, 144);
    ctx.fillStyle = "#85364b";
    ctx.font = "bold 58px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 320, 86, 568);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    textures.push(texture);
    rounded(parent, frame, 0, y, z, 2.75, 0.76, 0.18, 0.12);
    mesh(
      new THREE.PlaneGeometry(2.56, 0.65),
      mat("#ffffff", 0.9, { map: texture }),
      0,
      y,
      z + 0.095,
      parent,
    );
  }

  houses.forEach((house, index) => {
    const cafe = index === 0;
    const group = new THREE.Group();
    group.position.set(house.x, 0, house.z);
    const turn = index === 1 ? 0 : (Math.PI / 2) * (cafe ? 1 : -1);
    group.rotation.y = turn;
    scene.add(group);
    const w = turn ? house.d : house.w;
    const d = turn ? house.w : house.d;
    const front = d / 2;
    const roof = mat(house.roof, 0.76);
    const facade = mat(house.color);
    rounded(group, stone, 0, 0.2, 0, w + 0.4, 0.4, d + 0.4, 0.17);
    rounded(group, facade, 0, 1.89, 0, w, 3.43, d, 0.46);
    oval(group, cream, 0, 3.51, 0, w * 0.61, 0.31, d * 0.58);
    oval(group, roof, 0, 3.73, 0, w * 0.63, cafe ? 1.81 : 1.47, d * 0.59);
    if (cafe) {
      for (let i = 0; i < 56; i++) {
        const angle = i * 2.39996;
        const y = 0.13 + (i / 56) * 0.83;
        const r = Math.sqrt(1 - y * y);
        const pip = mesh(
          seedShape,
          cream,
          Math.cos(angle) * r * w * 0.632,
          3.73 + y * 1.82,
          Math.sin(angle) * r * d * 0.592,
          group,
        );
        pip.scale.set(0.052, 0.112, 0.04);
        pip.lookAt(
          group.localToWorld(
            new THREE.Vector3(pip.position.x * 2, pip.position.y + y, pip.position.z * 2),
          ),
        );
      }
      rounded(group, darkGreen, 0, 5.53, 0.02, 0.24, 0.72, 0.26, 0.11).rotation.z = -0.21;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        const leaf = oval(
          group,
          i % 2 ? darkGreen : green,
          Math.sin(a) * 0.53,
          5.4,
          Math.cos(a) * 0.53,
          0.34,
          0.12,
          0.88,
        );
        leaf.rotation.set(0.2, a, 0, "YXZ");
      }
    } else {
      rounded(group, roof, w * 0.23, 4.66, -0.49, 0.7, 1.52, 0.72, 0.11);
      rounded(group, cream, w * 0.23, 5.37, -0.49, 0.88, 0.29, 0.9, 0.1);
    }
    arch(group, cream, 0, 0.34, front + 0.025, 1.49, 2.28, 0.14);
    arch(group, mat(cafe ? "#b85568" : "#a47960"), 0, 0.42, front + 0.16, 1.2, 1.99, 0.09);
    for (const x of [-0.29, 0, 0.29])
      rounded(group, frame, x, 1.08, front + 0.263, 0.018, 1.24, 0.025, 0.008);
    oval(group, mat("#f2b751", 0.42), 0.35, 1.31, front + 0.29, 0.058, 0.058, 0.055);
    rounded(group, stone, 0, 0.22, front + 0.22, 1.61, 0.2, 0.93, 0.09);

    for (const side of [-1, 1]) {
      const x = side * w * 0.31;
      arch(group, frame, x, 1.44, front + 0.02, 1.3, 1.35, 0.09);
      arch(group, glass, x, 1.54, front + 0.11, 1.06, 1.14, 0.04);
      rounded(group, cream, x, 2.02, front + 0.173, 0.068, 0.99, 0.06, 0.025);
      rounded(group, cream, x, 1.94, front + 0.18, 1.05, 0.064, 0.06, 0.026);
      rounded(
        group,
        windowGlint,
        x - 0.27,
        2.21,
        front + 0.173,
        0.055,
        0.3,
        0.024,
        0.02,
      ).rotation.z = -0.23;
      rounded(group, wood, x, 1.4, front + 0.22, 1.29, 0.28, 0.48, 0.09);
      for (let i = 0; i < 5; i++) {
        const flowerX = x + (i - 2) * 0.22;
        oval(group, green, flowerX, 1.57, front + 0.31, 0.14, 0.14, 0.14);
        oval(
          group,
          mat(i % 2 ? "#ed8daa" : "#fff0ba"),
          flowerX,
          1.68 + (i % 2) * 0.05,
          front + 0.35,
          0.085,
          0.065,
          0.075,
        );
      }
      // The side windows remain visible when approaching from the garden paths.
      const window = new THREE.Group();
      window.position.set((side * w) / 2, 0, 0.28);
      window.rotation.y = (side * Math.PI) / 2;
      group.add(window);
      arch(window, frame, 0, 1.2, 0.02, 1.26, 1.52, 0.09);
      arch(window, glass, 0, 1.3, 0.1, 1.0, 1.29, 0.04);
      rounded(window, cream, 0, 1.9, 0.17, 0.07, 1.2, 0.07, 0.03);
      rounded(window, cream, 0, 1.8, 0.17, 1.02, 0.07, 0.07, 0.03);
    }
    if (cafe) {
      sign(group, "Café Tutti-Frutti", 3.08, front + 0.13);
      const awningPink = mat("#df7790");
      for (let i = 0; i < 9; i++) {
        const stripe = rounded(
          group,
          i % 2 ? cream : awningPink,
          (i - 4) * 0.48,
          2.82,
          front + 0.4,
          0.48,
          0.12,
          0.84,
          0.05,
        );
        stripe.rotation.x = 0.16;
        oval(
          group,
          i % 2 ? cream : awningPink,
          (i - 4) * 0.48,
          2.72,
          front + 0.78,
          0.24,
          0.14,
          0.055,
        );
      }
    }
  });

  const foliage = [];
  const stalks = [];
  const berries = [];
  const tops = [];
  const flowers = [];
  const centers = [];
  const gardens = [
    [-3.6, 14.3],
    [-3.7, 11.3],
    [-3.8, 7.8],
    [3.7, 13.8],
    [2.9, 7.5],
    [5.2, 5.9],
    [-7.5, 6.6],
    [-9.1, 7.2],
    [-13.3, 3.1],
    [-17.7, -4],
    [-14.3, -15.8],
    [-23, -13],
    [-5.5, -20.5],
    [2.6, -19.8],
    [15.5, -16.4],
    [17.5, -10.2],
    [16.7, 4.0],
    [23, 10],
  ];
  gardens.forEach(([gx, gz], garden) => {
    for (let i = 0; i < 9; i++) {
      const angle = i * 2.39996 + garden;
      const r = Math.sqrt(i) * 0.34;
      const x = gx + Math.sin(angle) * r;
      const z = gz + Math.cos(angle) * r;
      const size = 0.82 + random() * 0.41;
      const flower = i % 3 !== 0 && i % 2 !== 0;
      const height = (flower ? 0.43 : 0.31) * size;
      stalks.push({ x, y: height / 2, z, scale: [0.027 * size, height, 0.027 * size] });
      for (let branch = 0; branch < 3; branch++) {
        const a = angle + (branch / 3) * TAU;
        foliage.push({
          x: x + Math.sin(a) * 0.18,
          y: size * (0.26 + branch * 0.045),
          z: z + Math.cos(a) * 0.18,
          rx: -0.31,
          ry: a,
          scale: [0.19 * size, 0.067 * size, 0.42 * size],
          color: ["#629b40", "#87b44d", "#538644"][branch],
        });
      }
      if (i % 3 === 0) {
        berries.push({
          x,
          z,
          y: 0.23 * size,
          rz: -0.22 + random() * 0.44,
          scale: [0.16 * size, 0.19 * size, 0.16 * size],
          color: i ? "#e65774" : "#c94361",
        });
        tops.push({ x, z, y: 0.36 * size, scale: [0.13 * size, 0.036, 0.13 * size] });
      } else if (flower) {
        const y = 0.43 * size;
        centers.push({ x, y: y + 0.015, z, scale: [0.051, 0.028, 0.051] });
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * TAU;
          flowers.push({
            x: x + Math.sin(a) * 0.077,
            y,
            z: z + Math.cos(a) * 0.077,
            ry: a,
            scale: [0.05, 0.03, 0.074],
            color: garden % 4 ? "#ffeedb" : "#f5a4c6",
          });
        }
      }
    }
  });
  const plantPart = new THREE.SphereGeometry(1, 10, 7);
  instance(new THREE.CylinderGeometry(0.65, 1, 1, 5), darkGreen, stalks, false);
  instance(plantPart, mat("#ffffff"), foliage);
  instance(berryForm, mat("#ffffff", 0.65), berries);
  instance(plantPart, green, tops, false);
  instance(plantPart, mat("#ffffff"), flowers, false);
  instance(plantPart, mat("#ecb44c"), centers, false);
  return textures;
}
